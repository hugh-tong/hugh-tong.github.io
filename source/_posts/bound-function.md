---
title: OpenFOAM bound 函数：下界修正的源码逻辑与使用边界
date: 2026-09-15 15:10:00
updated: 2026-09-16 15:30:00
categories:
  - [CFD, 数值方法]
tags:
  - CFD/数值方法
  - OpenFOAM
  - 数值稳定性
description: 基于 OpenFOAM Foundation 13 源码说明 bound 如何修正低于物理下界的标量场，并区分数值保护、守恒限幅和根因排查。
mathjax: true
---

> 适用范围：OpenFOAM Foundation 13。其他发行线可能有同名实现，但应按对应版本源码核对。
> 最后核对：2026-09-16。

`bound` 是一个面向 `volScalarField` 的下界修正函数，常用于避免湍动能 $k$、耗散率 $\epsilon$ 等本应非负的量进入无效区间。它不是简单地把所有负值替换为同一个常数：Foundation 13 的实现会先尝试利用邻域信息修正负值，最后再保证结果不低于指定下界。

## 调用接口与返回值

接口只有两个参数：待修改的标量场和带量纲的最小值。

```cpp
bool Foam::bound
(
    volScalarField& field,
    const dimensionedScalar& minimum
);
```

函数会原地修改 `field`。若调用前全场最小值已经不低于 `minimum`，它返回 `false` 且不修改场；一旦执行修正则返回 `true`，并向日志输出修正前的最小值、最大值和平均值。

## 内部场如何修正

源码中的核心表达式可按下面三步理解：

1. 对参与邻域平均的场先执行 `max(field, minimum)`，避免负邻居继续污染平均值。
2. 只在当前单元值为负时，用相邻面值的面积加权平均作为候选值；非负单元保持原值。
3. 最外层再与 `minimum` 取最大值，确保最终结果不低于指定下界。

因此，若一个单元值为负且周围单元仍有合理的正值，修正结果可能高于硬下界；若邻域平均仍不足，才会落到 `minimum`。边界场采用类似思路：负的 patch 值会参考 `patchInternalField()`，最后同样执行下界截断。

这里有一个容易忽略的细节：邻域替换由 `pos0(-field)` 触发，即主要针对负值；而位于 $[0, minimum)$ 的值最终由外层 `max(..., minimum)` 直接提升到下界。

## 它解决什么，不解决什么

`bound` 适合充当求解过程中的保护措施：防止本应为正的模型变量导致除零、开方无效或模型系数失真。但它不能证明离散格式稳定，也不能修复错误的边界条件、过大的时间步、质量很差的网格或不合理的松弛设置。

频繁出现 `bounding k`、`bounding epsilon` 一类日志时，应把它当成诊断信号：记录发生位置和幅度，再检查初始场、边界条件、网格质量、离散格式与时间步。仅提高下界可能让计算继续运行，却也可能掩盖原始问题并改变局部解。

## 与 MULES 的区别

两者都涉及“限幅”，但层级不同：

- `bound` 是求解后对一个体标量场执行下界修正。
- MULES 是有限体积输运方程中的有界性算法，围绕通量与显式修正项控制相分数等变量。

所以不能把 `bound(k, kMin)` 描述成 MULES 的简化版本，也不能由 `bound` 已执行就推断输运过程守恒。若修正量对结果重要，应额外检查守恒误差和网格收敛性。

## 参考资料

- [OpenFOAM Foundation 13：`bound.H`](https://cpp.openfoam.org/v13/bound_8H_source.html)
- [OpenFOAM Foundation 13：`bound.C`](https://cpp.openfoam.org/v13/bound_8C_source.html)
- [bound 函数的实现方法 - CFD-China](https://www.cfd-china.com/topic/6766/) —— 社区讨论保留作延伸阅读
