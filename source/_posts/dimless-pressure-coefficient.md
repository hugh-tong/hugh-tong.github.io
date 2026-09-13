---
title: 压力系数(Pressure Coefficient)——CFD 验证的通用货币
date: 2026-09-13 15:20:00
categories:
  - [CFD, 无量纲数]
tags:
  - 无量纲数
  - Pressure Coefficient
  - OpenFOAM
  - Fluent
description: 压力系数 Cp 把当地静压归一化为与工况无关的无量纲量,驻点 Cp=1 是不可压流动的铁律,而参考值设置则是后处理中最常见的陷阱。
mathjax: true
---

压力系数($C_p$)是一个非常基础但极其重要的无量纲参数。对于 CFD 开发者而言,它是求解器验证(Validation)时的"通用货币":无论在 OpenFOAM 还是 Fluent 中计算,也无论风洞吹的模型是 1:1 还是 1:10,只要雷诺数相似,$C_p$ 的分布曲线必须重合。如果不重合,说明求解器算错了。本文针对不可压缩单相流展开。

## 参数速览

- **Name**: Pressure Coefficient
- **Symbol**: $C_p$
- **Fluent Variable**: `pressure-coefficient`
- **Key Configuration**: `Report` -> `Reference Values`(这是计算 $C_p$ 的命门)

## 原理

### 数学定义

对于不可压缩流动,压力系数定义为:

$$
C_p = \frac{P - P_\infty}{q_\infty} = \frac{P_{static} - P_{ref}}{\frac{1}{2} \rho_{ref} v_{ref}^2}
$$

- $P_{static}$:某一点(如机翼表面)的静压;
- $P_{ref}$($P_\infty$):远场(自由流)的参考静压;
- $q_\infty$:远场(自由流)的参考动压。

### 物理意义:压力的"归一化"

为什么需要 $C_p$?因为帕斯卡(Pa)这个单位太依赖具体工况了。

如果把入口速度从 $10 \text{ m/s}$ 增加到 $20 \text{ m/s}$,物体表面的静压 $P$ 会变成原来的 4 倍(动能正比于 $v^2$)。但是,$C_p$ 保持不变。

它衡量的是:当地压力相对于自由流压力的变化量,占自由流动能的比例。

### 标杆值(验证基准)

检查求解器结果时,有三个关键的 $C_p$ 值必须对上:

1. **$C_p = 1.0$:滞止点(Stagnation Point)**
   - 位置:气流直冲物体的点(如机翼前缘驻点)。
   - 物理:速度 $v=0$,所有动能转化为压力势能。
   - 验证要点:如果 CFD 结果中前缘驻点的 $C_p$ 只有 0.95 或 1.05,说明动能转换计算有误,或者边界层网格有问题。

2. **$C_p = 0.0$:恢复点**
   - 物理:当地压力等于自由流压力($P = P_\infty$)。

3. **$C_p < 0.0$:吸力区 / 加速区**
   - 物理:当地流速 $v > v_\infty$。根据伯努利方程,速度增加,压力降低。
   - 例子:机翼上表面通常是负压区($C_p$ 为负),提供升力。

## 实现细节

在 Fluent 和自研求解器中,$C_p$ 的计算逻辑完全一致,但有一个巨大的陷阱。

### 那个著名的"陷阱":Reference Values

Fluent 求解器本身并不知道什么是"远场",也不知道什么是"参考速度"。它只知道解方程。

$C_p$ 只是一个后处理(Post-processing)变量。

- **Fluent 实现机制**:
  请求显示 `pressure-coefficient` 时,Fluent 会去读取 `Report -> Reference Values` 面板中的值:
  - `Reference Pressure`($P_{ref}$)
  - `Reference Density`($\rho_{ref}$)
  - `Reference Velocity`($v_{ref}$)

  然后代入公式计算。

- **常见错误**:
  很多用户算了一个 $100 \text{ m/s}$ 的赛车,结果 Reference Values 里默认还是 $1 \text{ m/s}$。导致算出来的 $C_p$ 只有 $0.0001$,或者巨大无比。

- **开发备注**:如果在开发代码,不要尝试自动推断参考值。必须让用户在输入文件(如 `controlDict` 或单独的 `refValues`)中明确指定 $P_\infty$ 和 $V_\infty$。

### 数值计算逻辑(伪代码)

在自研求解器后处理模块中,计算 $C_p$ 的函数应该这样写:

```cpp
// 用户输入的参考值 (Global Constants)
double P_inf = 0.0;      // 通常 Gauge Pressure 为 0
double rho_inf = 1.225;
double V_inf = 30.0;     // 远场速度
double q_inf = 0.5 * rho_inf * V_inf * V_inf; // 预计算参考动压

// 遍历边界面 (或流场单元)
for (int i = 0; i < nFaces; i++) {
    double P_local = pressure[i]; // 求解器解出的静压 (Gauge)

    // 【关键】防止除以零
    if (std::abs(q_inf) < 1e-12) {
        Cp[i] = 0.0;
    } else {
        Cp[i] = (P_local - P_inf) / q_inf;
    }
}
```

### 伯努利方程的验证(Ideal Flow Check)

对于无粘(Inviscid)不可压流动,$C_p$ 与速度有直接的代数关系:

$$
C_p = 1 - \left( \frac{v_{local}}{v_{\infty}} \right)^2
$$

开发验证建议:如果先开发了一个 Euler 求解器(无粘),算一个圆柱绕流:

- 前驻点:$v=0 \rightarrow C_p = 1$;
- 顶部最快点:对于圆柱,理论解 $v=2v_\infty \rightarrow C_p = 1 - 4 = -3$;
- 如果求解器能算出这个分布,说明对流项离散正确;
- 对于粘性流(RANS),由于有总压损失,这个公式不再严格成立,但趋势一致。

## 小结

1. **$C_p$ 是静压的无量纲替身**。
2. **$C_p = 1$ 是铁律**:在不可压流动的滞止点,必须等于 1。
3. **参考值决定一切**:在 Fluent 中,必须手动设置 `Reference Values`,否则 $C_p$ 数据毫无意义。在自研代码中,也要设计相应的输入接口。

*本文整理自个人 CFD 学习笔记系列*
