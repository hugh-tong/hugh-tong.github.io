---
title: OpenFOAM 线性求解器选择：从矩阵性质到配置
date: 2026-09-15 15:10:00
updated: 2026-09-17 12:00:00
categories:
  - [CFD, 数值方法]
tags:
  - CFD/数值方法
  - OpenFOAM
  - 线性求解器
description: 按 lduMatrix 的对称性与问题规模选择 PCG/PBiCGStab/smoothSolver/GAMG，给出 Foundation 13 源码依据、教程 fvSolution 实例与 tolerance/relTol 的收敛语义。
mathjax: true
---

> 适用范围：求解器清单与源码依据基于 OpenFOAM Foundation 13；ESI 发行线（如 v2406）的求解器集合略有差异，选择思路相同。
> 最后核对：2026-09-17。

每个外迭代或时间步里，OpenFOAM 把离散后的 `fvMatrix` 交给 `fvSolution` 的 `solvers` 字典中选定的线性求解器。选错求解器通常不是报错，而是收敛慢或迭代不收敛，所以值得先弄清楚矩阵性质和求解器的适用范围。

## 矩阵性质：对称还是非对称

有限体积离散最终落到 `lduMatrix`（对角 + 上/下三角系数，面向非结构网格）。当上、下三角互为转置时矩阵是对称的，否则非对称。决定因素是方程本身：

| 方程 | 典型矩阵 | 原因 |
|---|---|---|
| 压力泊松方程 `fvm::laplacian(rAU, p)` | 对称 | 扩散算子离散后上下三角一致 |
| 动量方程 `fvm::div(phi, U)` | 非对称 | 对流项方向性 |
| 湍流量 $k$、$\varepsilon$、$\omega$ | 非对称 | 同样含对流项 |

## Foundation 13 提供哪些求解器

以下描述摘自 Foundation 13 源码头文件的 `Description`：

| 求解器 | 矩阵要求 | 说明 |
|---|---|---|
| `PCG` | 对称 | 预条件共轭梯度，预条件子运行时选择 |
| `PBiCGStab` | 非对称 | 稳定化双共轭梯度（Van der Vorst, 1992），预条件子运行时选择 |
| `smoothSolver` | 对称与非对称 | 用 smoother（如 `symGaussSeidel`）迭代，每 `nSweeps` 次平滑检查一次残差 |
| `GAMG` | 正定、对角占优 | 几何聚合代数多重网格；V-cycle，最粗层用 PCG 或 PBiCGStab 直接收尾 |
| `PBiCG` | 非对称 | 旧式双共轭梯度，稳定性和并行表现不如 PBiCGStab，新配置不建议使用 |
| `diagonalSolver` | 只有对角元 | 平凡求解，如某些显式步 |

预条件子（`preconditioner`）有 `noPreconditioner`、`diagonal`、`DIC`、`FDIC`、`DILU`、`GAMG`；常用组合是对称矩阵配 `DIC`、非对称矩阵配 `DILU`。`smoothSolver` 的 `smoother` 可选 `GaussSeidel`、`symGaussSeidel`、`DIC`/`DILU` 及其组合、`nonBlockingGaussSeidel` 等。

## 选择表

| 求解对象 | 首选 | 备选 | 说明 |
|---|---|---|---|
| 压力（中小网格） | `PCG` + `DIC` | `smoothSolver` + `symGaussSeidel` | 共轭梯度对对称正定系统收敛性质明确 |
| 压力（大网格） | `GAMG` | `PCG` + `GAMG` 预条件 | 单层迭代法迭代数随网格加密增长，多重网格基本不随单元数变化 |
| 动量、湍流量 | `PBiCGStab` + `DILU` | `smoothSolver` + `symGaussSeidel` | 非对称矩阵交给 PCG 可能不收敛；对称矩阵交给 PBiCGStab 通常仍收敛，但每迭代成本更高 |

教程里的实际配置可以当参照。Foundation 13 的 `incompressibleFluid/boxTurb16`（小网格）：

```cpp
"p.*" { solver PCG; preconditioner DIC; tolerance 1e-06; relTol 0; }
"U.*" { solver smoothSolver; smoother symGaussSeidel; tolerance 1e-05; relTol 0; }
```

`incompressibleFluid/motorBikeSteady`（大网格稳态）：

```cpp
p   { solver GAMG; smoother GaussSeidel; tolerance 1e-7; relTol 0.01; }
U   { solver smoothSolver; smoother GaussSeidel; tolerance 1e-8; relTol 0.1; nSweeps 1; }
```

## tolerance 与 relTol 的确切含义

`SolverPerformance::checkConvergence`（Foundation 13 源码）中的判据是：

- 本次求解的**最终残差**小于 `tolerance`；或
- 最终残差小于 `relTol` × **初始残差**（`relTol` 大于机器小量时才启用该判据）。

两条满足其一即收敛。两个实践要点：

- 稳态外迭代中，线性方程不需要每次都解到机器精度——外迭代本身还会继续修正解，所以 `relTol` 取 `0.01`–`0.1` 是常态（如上面的 motorBikeSteady）。
- 瞬态压力方程相反：投影后通量的无散性直接取决于压力方程解到什么程度，`relTol` 应取 `0`，靠 `tolerance` 控制，否则连续性误差会随时间步累积。

日志中每个求解输出一行 `DICPCG:  Solving for p, Initial residual = ..., Final residual = ..., No Iterations ...`，排查收敛问题时先看初始残差的整体趋势（外迭代是否在下降），再看单次求解的迭代数是否异常膨胀。

## GAMG 的常用配置键

必配的是 `solver GAMG`、`smoother`、`tolerance`、`relTol`。Foundation 13 构造函数读取的可选键及默认值：`cacheAgglomeration`（默认 `true`，聚合矩阵跨时间步复用）、`nPreSweeps`（0）、`nPostSweeps`（2）、`nFinestSweeps`、`interpolateCorrection`、`scaleCorrection`、`directSolveCoarsest`（`false`），以及控制聚合停止条件的 `nCellsInCoarsestLevel`（最粗层单元数）。

`nCellsInCoarsestLevel` 取得过粗（层数少）则收敛慢，取得过细则最粗层求解开销变大；源码在矩阵无法继续聚合时会直接提示检查该项。教程默认值通常够用，先动 `tolerance`/`relTol` 和 `smoother`，再考虑调聚合参数。

## 常见错误

- 看到压力收敛慢就把所有方程都换成 GAMG：动量/湍流量方程非对称，GAMG 的 smoother 要选非对称可用的（如 `GaussSeidel`），且 `div` 主导的系统多网格收益不如泊松型方程明显。
- 稳态算例把 `relTol` 设成 `0` 又把 `tolerance` 收得很紧：外迭代还没收敛，单次线性求解的过度精度是浪费。
- 复用别人的 `fvSolution` 时不看矩阵类型：`PCG` 配非对称矩阵的行为是"可能不收敛"，而不是报错提示。

## 参考资料

- [OpenFOAM Foundation 13：PCG.H](https://cpp.openfoam.org/v13/PCG_8H_source.html)
- [OpenFOAM Foundation 13：PBiCGStab.H](https://cpp.openfoam.org/v13/PBiCGStab_8H_source.html)
- [OpenFOAM Foundation 13：smoothSolver.H](https://cpp.openfoam.org/v13/smoothSolver_8H_source.html)
- [OpenFOAM Foundation 13：GAMGSolver.H](https://cpp.openfoam.org/v13/GAMGSolver_8H_source.html)
- [OpenFOAM Foundation 13 教程 boxTurb16 的 fvSolution（GitHub）](https://github.com/OpenFOAM/OpenFOAM-13/blob/master/tutorials/incompressibleFluid/boxTurb16/system/fvSolution)
- [OpenFOAM Foundation 13 教程 motorBikeSteady 的 fvSolution（GitHub）](https://github.com/OpenFOAM/OpenFOAM-13/blob/master/tutorials/incompressibleFluid/motorBikeSteady/system/fvSolution)
- Van der Vorst, H. A. (1992). Bi-CGSTAB: A fast and smoothly converging variant of Bi-CG. *SIAM Journal on Scientific and Statistical Computing*, 13(2), 631–644.
