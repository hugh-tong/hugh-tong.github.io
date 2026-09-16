---
title: OpenFOAM 稳态求解为什么仍使用 Time 目录
date: 2026-09-15 13:00:00
updated: 2026-09-16 18:00:00
categories:
  - [CFD, OpenFOAM, 求解器]
tags:
  - CFD/OpenFOAM/求解器
  - 求解器
  - simpleFoam
  - 迭代步
description: 区分 OpenFOAM 稳态循环中的输出时间标签、物理时间和局部伪时间，并说明与 Fluent iteration 只能作粗略类比。
mathjax: true
---

> 适用范围：经典 `simpleFoam`/SIMPLE 稳态工作流。不同 OpenFOAM 发行版和新模块化求解器的循环组织可能不同，但“`steadyState` 时间导数为零”这一数值含义不变。

## 结论

稳态 OpenFOAM 算例仍使用 `Time` 对象和数字目录，是因为运行控制、写出和重启机制复用了统一框架。若 `fvSchemes` 使用 `steadyState`，方程中的时间导数为零；目录名不是物理秒数。

把一次 OpenFOAM 外层 SIMPLE 循环粗略类比为一次 Fluent steady iteration 有助于理解界面，但不能认为两者“完全等价”：每次外层循环内部的压力修正、非正交修正、方程求解次数和停止条件都可能不同。

## `deltaT` 在经典稳态算例中的作用

常见设置如下：

```cpp
// system/fvSchemes
ddtSchemes
{
    default steadyState;
}
```

```cpp
// system/controlDict
endTime       5000;
deltaT        1;
writeControl  timeStep;
writeInterval 100;
```

此时 `deltaT 1` 让运行标签按 1 增长，便于把 `Time = 5000` 理解成第 5000 个外层循环附近的输出。它不进入已经被 `steadyState` 置零的时间导数，因此不能解释为 1 秒。

如果把 `deltaT` 改成其他值，目录标签和 `endTime` 对应的循环次数也会变化，所以更准确的说法是“常用作迭代标签”，而不是语言层面固定的整数计数器。

## 欠松弛不等于局部伪时间

经典 SIMPLE 稳态求解通常通过 `fvSolution` 中的 `relaxationFactors` 控制外层迭代稳定性。`localEuler` 则是另一类离散：它要求求解器保留时间导数形式并提供每个单元的局部倒数时间步场，用局部伪时间推进到稳态。

因此，不能在标准 `simpleFoam` 算例里仅把 `steadyState` 改成 `localEuler`，就声称获得了与 Fluent 相同的 pseudo-transient 方法。求解器结构、局部时间尺度计算、残差定义和默认设置都必须分别核实；Fluent 是否启用 pseudo-transient 也取决于所选 solver 和用户设置，不能写成“稳态默认开启”。

## 判断目录是不是物理时间

依次检查：

1. `fvSchemes/ddtSchemes` 是 `steadyState`、物理时间格式，还是 local time scheme；
2. 求解器是否真的组装了 `ddt` 项；
3. `controlDict` 的停止与写出控制；
4. 求解器是否创建和更新局部时间步场；
5. 结果是否通过时间步收敛性验证。

只有采用统一物理时间步并完成时间精度检查时，数字目录才适合解释为物理时间。

## 参考

- [CFD Direct：OpenFOAM time schemes](https://doc.cfd.direct/openfoam/user-guide-v6/fvschemes)
- [OpenFOAM Foundation 13：localEulerDdtScheme](https://cpp.openfoam.org/v13/classFoam_1_1fv_1_1localEulerDdtScheme.html)
