---
title: OpenFOAM 中的 LTS：局部伪时间步不是物理时间
date: 2026-09-15 14:00:00
updated: 2026-09-16 18:00:00
categories:
  - [CFD, OpenFOAM, 求解器]
tags:
  - CFD/OpenFOAM/求解器
  - 求解器
  - LTS
description: 说明 OpenFOAM localEuler 与 SLTS 的用途、稳态伪时间含义和使用边界，避免把局部时间步误当成物理瞬态推进。
mathjax: true
---

> 适用范围：本文以 OpenFOAM Foundation 13 的 `localEulerDdtScheme` 和 `SLTSDdtScheme` 源码说明为准。OpenCFD 发行线以及第三方多区域求解器的配置和能力可能不同。

## 先说结论

OpenFOAM 中的 `localEuler` 和 `SLTS` 是**局部伪时间步**离散。不同单元可以使用不同的局部步长，以改善稳态收敛过程；这些步长不能组成一个全域一致的物理时刻，因此不能用它们解释真实瞬态历程。

Foundation 13 的源码说明明确限定：`localEuler` 应用于“使用瞬态代码进行稳态计算”的场景。`SLTS` 在此基础上调整局部步长，使对流方程保持对角占优。

## 与三种常见时间设置的区别

| 设置 | 时间导数 | 目标 | 可以解释物理瞬态吗 |
|---|---|---|---|
| `steadyState` | 直接置零 | 经典稳态迭代 | 否 |
| `Euler` / `backward` | 使用统一物理时间步 | 瞬态推进 | 是，仍需满足时间精度要求 |
| `localEuler` / `SLTS` | 每个单元使用局部伪时间尺度 | 用瞬态形式加速稳态收敛 | 否 |

所以，“LTS 可以大幅加速瞬态计算”这个说法缺少关键限定。它可能更快到达一个稳态解，但不能用局部伪时间的中间结果代替时间准确的瞬态解。

## 配置不是只改一行

离散格式通常会出现类似设置：

```cpp
ddtSchemes
{
    default localEuler;
}
```

但这不是通用开关。Foundation 的 `localEulerDdtScheme` 会从对象数据库中查找局部倒数时间步场；求解器必须负责创建和更新该场，并正确处理残差、停止条件和输出。把普通瞬态算例的 `Euler` 机械替换为 `localEuler`，不会自动得到可信的稳态算法。

## 多区域求解器

第三方仓库中的 `chtMultiRegionFoamLTS` 或 `multiRegionReactingFoam` 只能说明该仓库实现过特定方案，不能推出所有官方多区域求解器都支持相同语义。使用前至少核对：

1. 代码基于 Foundation 还是 OpenCFD 发行线；
2. 对应 tag/commit 和 OpenFOAM 版本；
3. 哪个区域决定局部时间尺度；
4. 区域耦合时如何保持能量和通量一致；
5. 停止条件是否基于残差，而不是伪时间值。

## 参考

- [OpenFOAM Foundation 13：localEulerDdtScheme](https://cpp.openfoam.org/v13/classFoam_1_1fv_1_1localEulerDdtScheme.html)
- [OpenFOAM Foundation：SLTSDdtScheme](https://cpp.openfoam.org/v12/classFoam_1_1fv_1_1SLTSDdtScheme.html)
- [OpenFOAM v6 User Guide：time schemes](https://doc.cfd.direct/openfoam/user-guide-v6/fvschemes)
- [TonkomoLLC/multiRegionReactingFoam](https://github.com/TonkomoLLC/multiRegionReactingFoam)——第三方实现线索，不作为当前官方版本的通用文档
