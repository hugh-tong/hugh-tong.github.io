---
title: potentialFoam 势流初始化：用途与边界
date: 2026-09-15 14:00:00
updated: 2026-09-16 18:00:00
categories:
  - [CFD, OpenFOAM, 求解器]
tags:
  - CFD/OpenFOAM/求解器
  - 求解器
  - potentialFoam
description: 说明 potentialFoam 如何由速度势构造不可压缩通量和速度初场，以及为什么是否改善黏性计算收敛需要逐算例验证。
mathjax: true
---

> 适用范围：本文依据 OpenCFD v2306 的 `potentialFoam` 文档说明概念；命令参数应以所用发行版的 `potentialFoam -help-full` 为准。

`potentialFoam` 求解速度势 $\Phi$，由此得到不可压缩体积通量和单元中心速度。官方给出的主要用途是为后续黏性计算提供初始速度场。

其核心方程写作：

$$
\nabla^2\Phi = \nabla\cdot\phi,
$$

然后由面通量重构速度。该工具不包含黏性、湍流或分离流动等物理模型，所以结果不是 `simpleFoam` 稳态解的廉价替代品。

## 什么时候可以尝试

- 初始速度场与边界通量明显不一致，导致压力修正初期震荡；
- 复杂入口/出口条件下，希望先得到近似无散的内部速度场；
- 需要在正式计算前检查速度边界和通量方向。

典型调用形式是：

```bash
potentialFoam -initialiseUBCs
```

部分版本还提供 `-writePhi`、`-pName` 等选项。运行后应检查连续性误差、边界通量和写出的 `U`，再启动正式求解器。

## 不能预先保证的事

是否减少 `simpleFoam` 迭代次数取决于几何、边界条件和原始初场。某个外部案例中“迭代没有减少”的结果只能描述该案例，不能推广成“通常没必要初始化”。可靠判断需要在同一个算例上对比：

1. 相同数值格式和松弛参数；
2. 相同停止残差与守恒判据；
3. 有/无 `potentialFoam` 时的总迭代数和总墙钟时间；
4. 最终解是否收敛到相同状态。

## 参考

- [OpenCFD v2306：potentialFoam](https://doc.openfoam.com/2306/tools/processing/solvers/rtm/basic/potentialFoam/)
