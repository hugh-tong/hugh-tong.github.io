---
title: 分数步投影法：从 Chorin 分裂到 OpenFOAM 的通量投影
date: 2026-09-15 15:10:00
updated: 2026-09-17 12:00:00
categories:
  - [CFD, 理论, 求解算法]
tags:
  - CFD/理论/求解算法
  - 求解算法
  - 投影法
description: 分数步/投影法把动量预测与压力投影拆成两步；本文对照 Chorin 原始格式与 OpenFOAM icoFoam/incompressibleFluid 中以 rAU 加权的通量投影实现，说明两者的对应与差别。
mathjax: true
graph:
  id: fractional-step-method
---

> 适用范围：理论部分为通用内容；实现对照基于 OpenFOAM Foundation 13 与 ESI v2406 源码，其他版本应按对应源码核对。
> 最后核对：2026-09-17。

分数步法（fractional step method）与投影法（projection method）基本是同一族算法的两个名字：把不可压缩流动的一个时间步拆成"无压力的动量预测"和"压力投影"两个分数步。它也是理解 OpenFOAM 压力-速度耦合代码的入门视角。

## 为什么必须分裂

不可压缩 Navier-Stokes 方程中，压力没有自己的输运方程，它的角色是保证速度场无散的拉格朗日乘子：

$$\frac{\partial u}{\partial t} + (u\cdot\nabla)u = -\frac{1}{\rho}\nabla p + \nu\nabla^2 u, \qquad \nabla\cdot u = 0$$

如果对动量方程直接隐式求解而把压力当作已知（上一时刻的值），得到的中间速度场一般不满足散度约束。对速度取散度可以推出压力必须满足的泊松方程——这正是分裂出"压力步"的动机。

## Chorin 投影格式

Chorin（1968）与 Temam（1969）给出的经典两步格式：

**第一步（预测）**：不带压力推进动量方程，得到中间速度 $u^*$：

$$\frac{u^* - u^n}{\Delta t} = -N(u^n)$$

其中 $N$ 代表对流与扩散算子的离散。

**第二步（投影）**：用压力把 $u^*$ 投影到无散空间：

$$u^{n+1} = u^* - \frac{\Delta t}{\rho}\nabla p^{n+1}$$

代入 $\nabla\cdot u^{n+1}=0$，得到压力泊松方程：

$$\nabla^2 p^{n+1} = \frac{\rho}{\Delta t}\,\nabla\cdot u^*$$

两个经常被引用的性质：

- 原始格式的时间精度是一阶；二阶格式需要在预测步加入压力外推（Kim & Moin 一类改进）。
- 压力边界条件是理论难点：对法向动量方程离散得到的 $\partial p/\partial n$ 条件与物理边界条件不完全相容，会在壁面附近产生数值边界层。评估边界误差要看具体格式的收敛性分析，不能笼统断言"投影法二阶精度"。

## OpenFOAM 中的对应实现

以 ESI v2406 的 `icoFoam`（层流不可压缩瞬态求解器）为例，一个时间步内的核心结构是：

```cpp
fvVectorMatrix UEqn
(
    fvm::ddt(U) + fvm::div(phi, U) - fvm::laplacian(nu, U)
);

if (piso.momentumPredictor())
{
    solve(UEqn == -fvc::grad(p));   // 预测步：压力为显式源项
}

while (piso.correct())              // PISO 修正步
{
    volScalarField rAU(1.0/UEqn.A());
    volVectorField HbyA(constrainHbyA(rAU*UEqn.H(), U, p));
    surfaceScalarField phiHbyA
    (
        "phiHbyA",
        fvc::flux(HbyA) + fvc::interpolate(rAU)*fvc::ddtCorr(U, phi)
    );

    fvScalarMatrix pEqn
    (
        fvm::laplacian(rAU, p) == fvc::div(phiHbyA)
    );
    pEqn.solve();

    if (piso.finalNonOrthogonalIter())
    {
        phi = phiHbyA - pEqn.flux();        // 通量投影
    }

    U = HbyA - rAU*fvc::grad(p);            // 速度投影
    U.correctBoundaryConditions();
}
```

对照 Chorin 格式，可以看出三个本质差别：

1. **质量算子不同**。Chorin 的投影系数是统一的 $\Delta t$（单位质量矩阵）；OpenFOAM 用 $r_{AU} = 1/A_{pp}$，即动量矩阵对角元的倒数。每个单元有自己的"时间尺度"，这是近似因子分解的观点：隐式动量方程被近似拆成"对角求解 + 邻居项 $H$ 重构"。
2. **投影对象是面通量而不是单元速度**。最终无散的是 $\phi$（`phi = phiHbyA - pEqn.flux()`），配合 Rhie-Chow 插值避免同位网格上的压力棋盘振荡（见 [Rhie-Chow 插值](/2026/09/15/rhie-chow-interpolation/)）。`U = HbyA - rAU*grad(p)` 是通量投影之后对单元速度的相容重构。
3. **压力不是完全被丢掉，而是显式进入预测步**，分裂误差靠 `nCorrectors` 次修正消化，而不是单次投影。把 `momentumPredictor` 关掉、只保留一次修正时，结构最接近教科书上的分数步。

`pEqn.flux()` 的含义值得单独记：它把解出的 $p$ 转成满足离散连续性的守恒通量。投影后 $\phi$ 的无散程度由压力线性方程的求解容差决定，日志中的连续性误差 `continuity errors` 就是这个投影质量的直接量度。

Foundation 13 中 `icoFoam` 已并入模块化求解器，运行方式为 `foamRun -solver incompressibleFluid`，同样的投影结构位于 `applications/modules/incompressibleFluid/correctPressure.C`，仅在 `ddtCorr`、体积源项等细节上更通用。

## 与 SIMPLE/PISO/PIMPLE 的关系

把"预测速度 + 压力泊松 + 通量/速度修正"这个骨架称为一次投影，则三大算法只是投影的组织方式不同：

| 算法 | 投影的用法 | 外层机制 |
|---|---|---|
| SIMPLE | 每个外迭代一次投影 | 欠松弛驱动收敛，面向稳态 |
| PISO | 每个时间步多次投影 | 无松弛，靠修正消除分裂误差 |
| PIMPLE | 每个时间步外迭代 + 多次投影 | 允许更大的时间步长 |

算法展开与资料索引见[系列总览](/2026/09/15/simple-piso-pimple-algorithms/)；稳态与瞬态求解器在相同案例上的行为差异见 [simpleFoam 与 pisoFoam 对比](/2026/09/15/simplefoam-vs-pisofoam-steady-transient/)，SIMPLE 的源码走读见 [simpleFoam 源码走读](/2026/09/15/ebd-simplefoam/)。

## 参考资料

- Chorin, A. J. (1968). Numerical solution of the Navier-Stokes equations. *Mathematics of Computation*, 22(104), 745–762.
- Temam, R. (1969). Sur l'approximation de la solution des équations de Navier-Stokes. *Archive for Rational Mechanics and Analysis*, 32, 377–385.
- [Projection method (fluid dynamics) - Wikipedia](https://en.wikipedia.org/wiki/Projection_method_(fluid_dynamics))
- [OpenFOAM guide/The PISO algorithm in OpenFOAM - OpenFOAMWiki](https://openfoamwiki.net/index.php/OpenFOAM_guide/The_PISO_algorithm_in_OpenFOAM)
- [OpenFOAM Foundation 13：incompressibleFluid/correctPressure.C（GitHub）](https://github.com/OpenFOAM/OpenFOAM-13/blob/master/applications/modules/incompressibleFluid/correctPressure.C)
