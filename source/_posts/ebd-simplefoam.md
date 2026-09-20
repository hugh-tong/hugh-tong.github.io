---
title: simpleFoam 源码走读：SIMPLE 迭代的调用链
date: 2026-09-15 14:00:00
updated: 2026-09-17 12:00:00
categories:
  - [CFD, OpenFOAM, 求解器]
tags:
  - CFD/OpenFOAM/求解器
  - 求解器
  - SIMPLE
description: 逐段走读 ESI v2406 simpleFoam 的主循环与 UEqn/pEqn，梳理动量预测、压力修正、两处欠松弛与 SIMPLEC 开关在源码中的位置，并对照 Foundation 13 的 incompressibleFluid 模块。
mathjax: true
graph:
  id: ebd-simplefoam
---

> 适用范围：ESI v2406 的 classic `simpleFoam`；Foundation 13 没有独立的 simpleFoam，等价物是 `foamRun -solver incompressibleFluid` 配稳态格式，结构相同。
> 最后核对：2026-09-17。

SIMPLE 的算法描述（acronym 展开、官方步骤表）见[系列总览](/2026/09/15/simple-piso-pimple-algorithms/)。本文自底向上走读源码：主循环怎么组织、`UEqn.H` 和 `pEqn.H` 各做什么、欠松弛和 SIMPLEC 出现在哪一行。

## 主循环骨架

`simpleFoam.C` 的 `main` 在初始化后进入：

```cpp
while (simple.loop())
{
    Info<< "Time = " << runTime.timeName() << nl << endl;

    // --- Pressure-velocity SIMPLE corrector
    {
        #include "UEqn.H"
        #include "pEqn.H"
    }

    laminarTransport.correct();
    turbulence->correct();

    runTime.write();
    runTime.printExecutionTime(Info);
}
```

几个直接可验证的事实：

- `simple.loop()` 每执行一次，日志的 `Time` 增加 1——那是迭代计数，不是物理时间。迭代上限来自 `controlDict` 的 `endTime`（稳态求解器把伪时间当迭代计数用）；提前结束的条件是 `fvSolution` 中 `SIMPLE` 字典的 `residualControl`（各场初始残差阈值，源码中逐场与 `absTol` 比较）。
- 一个 SIMPLE 迭代 = 动量方程（`UEqn.H`）+ 压力修正（`pEqn.H`）+ 湍流量修正（`turbulence->correct()`），与官方用户指南的步骤表一一对应。

## UEqn.H：动量预测

```cpp
tmp<fvVectorMatrix> tUEqn
(
    fvm::div(phi, U)
  + MRF.DDt(U)
  + turbulence->divDevReff(U)
 ==
    fvOptions(U)
);
fvVectorMatrix& UEqn = tUEqn.ref();

UEqn.relax();

fvOptions.constrain(UEqn);

if (simple.momentumPredictor())
{
    solve(UEqn == -fvc::grad(p));
    fvOptions.correct(U);
}
```

- 动量矩阵由对流项（隐式）、MRF 旋转项和湍流有效黏性项组成，压力梯度是**显式**源项（`-fvc::grad(p)`，用的是上一迭代的压力）。
- `UEqn.relax()` 是第一处欠松弛：按 `relaxationFactors.equations` 的系数修改矩阵对角，让本次解不彻底替代上次值。
- `momentumPredictor` 开关（`SIMPLE` 字典）关闭时整个 `solve` 被跳过：动量方程从未显式求解，速度更新完全由 `pEqn.H` 末尾的重构完成。对强耦合问题这样可以省掉不必要的一次线性求解，但改变了迭代性质，收敛监控也要相应理解。

## pEqn.H：压力修正逐块读

去掉 MRF/多孔细节后的主干：

```cpp
volScalarField rAU(1.0/UEqn.A());
volVectorField HbyA(constrainHbyA(rAU*UEqn.H(), U, p));
surfaceScalarField phiHbyA("phiHbyA", fvc::flux(HbyA));

adjustPhi(phiHbyA, U, p);

tmp<volScalarField> rAtU(rAU);

if (simple.consistent())
{
    rAtU = 1.0/(1.0/rAU - UEqn.H1());
    phiHbyA += fvc::interpolate(rAtU() - rAU)*fvc::snGrad(p)*mesh.magSf();
    HbyA -= (rAU - rAtU())*fvc::grad(p);
}

tUEqn.clear();

constrainPressure(p, U, phiHbyA, rAtU(), MRF);

while (simple.correctNonOrthogonal())
{
    fvScalarMatrix pEqn
    (
        fvm::laplacian(rAtU(), p) == fvc::div(phiHbyA)
    );

    pEqn.setReference(pRefCell, pRefValue);

    pEqn.solve();

    if (simple.finalNonOrthogonalIter())
    {
        phi = phiHbyA - pEqn.flux();
    }
}

#include "continuityErrs.H"

p.relax();

U = HbyA - rAtU()*fvc::grad(p);
U.correctBoundaryConditions();
fvOptions.correct(U);
```

按出现顺序：

1. `rAU = 1/UEqn.A()` 取矩阵对角倒数；`HbyA = rAU*UEqn.H()` 用邻友项和源项重构出"无压力速度"。
2. `phiHbyA` 是它的面通量；`adjustPhi` 只在全域封闭（总流量为零的边界组合）时调整参考通量，保证压力方程可解。
3. `simple.consistent()` 对应 `SIMPLE { consistent yes; }`，即 SIMPLEC：用 $r_{AtU} = 1/(1/r_{AU} - H_1)$ 代替 $r_{AU}$ 抵消部分压力显式项。效果是压力不再需要欠松弛，劣质网格上的收敛行为通常更好，对比见 [SIMPLE vs SIMPLEC](/2026/09/15/simple-vs-simplec/)。
4. `tUEqn.clear()` 在进压力方程前释放动量矩阵的内存（非一致模式下后面还用不到它）。
5. 压力方程 `fvm::laplacian(rAtU, p) == fvc::div(phiHbyA)` 就是"通量投影"的泊松方程；非正交修正循环内反复重解，只有最终迭代更新 `phi = phiHbyA - pEqn.flux()`，保证通量与最终压力一致（投影观点的推导见[分数步投影法](/2026/09/15/fractional-step-method/)）。
6. `continuityErrs.H` 输出的连续性误差就是投影质量的量度。
7. `p.relax()` 是第二处欠松弛：对压力场本身做欠松弛（`relaxationFactors.fields`），供下一迭代动量预测使用；SIMPLEC 模式下应省去。
8. `U = HbyA - rAtU*grad(p)` 重构速度并修正边界，一次 SIMPLE 迭代结束。

## 欠松弛出现的位置小结

| 位置 | 代码 | 配置 | 作用对象 |
|---|---|---|---|
| 动量方程后 | `UEqn.relax()` | `relaxationFactors.equations` | 矩阵对角（本次解向旧解收缩） |
| 压力求解后 | `p.relax()` | `relaxationFactors.fields` | 压力场（供下次动量预测） |

SIMPLEC（`consistent yes`）只消除第二处的必要性，动量松弛一般保留。收敛诊断时值得先分清波动来自哪一层：残差整体震荡多与松弛/格式有关，单调下降但停滞则看 `residualControl` 中哪个场先触底。

## Foundation 13 对照

Foundation 13 把求解器模块化，稳态不可压问题用 `foamRun -solver incompressibleFluid`，配合 `fvSchemes` 的 `steadyState` 时间格式和 `fvSolution` 的 `SIMPLE` 字典。对应代码在 `applications/modules/incompressibleFluid/`：

- `momentumPredictor.C` —— 等价于 `UEqn.H`，增加 `fvm::ddt(U)`（稳态格式下退化为零贡献），源项框架从 `fvOptions` 换成 `fvModels`/`fvConstraints`。
- `correctPressure.C` —— 等价于 `pEqn.H`，额外处理运动网格通量（`ddtCorr`、`correctUf`）和体积源项。

调用顺序与上文逐块一致，`pimple` 控制对象同时承担 SIMPLE/PISO/PIMPLE 的开关读取，所以同一模块瞬态稳态通用。教程实例可看 `tutorials/incompressibleFluid/motorBikeSteady`。

## 参考资料

- [OpenFOAM Foundation 13：incompressibleFluid 模块（GitHub）](https://github.com/OpenFOAM/OpenFOAM-13/blob/master/applications/modules/incompressibleFluid/incompressibleFluid.C)
- [SimpleFoam - OpenFOAMWiki](https://openfoamwiki.net/index.php/SimpleFoam) —— 压力方程的逐步分析
- [OpenFOAM: User Guide: SIMPLE algorithm](https://www.openfoam.com/documentation/guides/latest/doc/guide-applications-solvers-simple.html)
- ESI OpenFOAM v2406 源码 `applications/solvers/incompressible/simpleFoam/`（simpleFoam.C、UEqn.H、pEqn.H），仓库位于 develop.openfoam.com 的 Development/openfoam，标签 `OpenFOAM-v2406`。
