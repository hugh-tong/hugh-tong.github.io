---
title: Ur Courant Number:相对库朗数的含义与公式
date: 2026-09-15 13:00:00
categories:
  - [CFD, OpenFOAM, 求解器]
tags:
  - CFD/OpenFOAM/求解器
  - 求解器
  - CourantNumber
  - OpenFOAM
  - Ur
description: 你提供的代码片段展示了 OpenFOAM 中用于计算 “Ur Courant number” 的方式。下面从概念、公式推导到物理/数值意义做系统整理。
mathjax: true
---
# Ur Courant Number：含义、公式与意义

你提供的代码片段展示了 OpenFOAM 中用于计算 “Ur Courant number” 的方式。下面从概念、公式推导到物理/数值意义做系统整理。

## Ur 的含义

- **Ur** 在这里可以理解为：由两相（或两速度场）通量差异引入的“相对（relative）”或“更新（update）”驱动的有效 Courant 数。
- 与常规 Courant 数（由单一对流通量 `phi` 决定）不同，**Ur Courant number** 用的是两股通量之差 `phi1 - phi2`，用来度量在一个时间步内，由两者差异引起的穿越单元尺度的有效“推进幅度”。

_直观理解_：如果 `phi1` 与 `phi2` 代表两相或两组分的界面/相对流动，`Ur Co` 衡量的是它们的相对输运强度对时间步长稳定性的约束。

## 代码对应的数学表达

代码核心：

```cpp
scalar UrCoNum = 0.5*gMax
(
    fvc::surfaceSum(mag(phi1 - phi2))().primitiveField()/mesh.V().field()
)*runTime.deltaTValue();
```

逐项解释：

- `mag(phi1 - phi2)`：面通量的幅值（两通量的差）。单位通常为 [量/时间]，例如体积通量为 [m^3/s]。
- `fvc::surfaceSum(...)`：将面量对每个单元进行面求和，得到每个单元的总“相对通量”规模。
- `/ mesh.V().field()`：除以单元体积，得到每单元的“相对通量/体积”，类似于一个特征频率或速率 [1/s]。
- `* runTime.deltaTValue()`：乘以时间步长 Δt，得到无量纲数。
- `gMax(...)`：对全场（全部单元）取最大值。
- `0.5*`：经验或理论稳定性系数（相当于更保守地估计稳定时间步，减半）。

将其写成对每个单元 c 的中间量：
$$\tilde{U}_r(c) = \frac{\displaystyle \sum_{f\in \partial c} \left|(\phi_1 - \phi_2)_f\right|}{V_c}$$
然后全局取最大值并乘以 Δt 与 1/2：
$$\mathrm{UrCoNum} = \frac{1}{2}\,\max_{c}\left(\tilde{U}_r(c)\right)\,\Delta t$$

因此，完整公式可表述为：
$$\boxed{
\mathrm{UrCoNum}
=
\frac{1}{2}\,\Delta t\;\max_{c}
\left(
\frac{\displaystyle \sum_{f\in \partial c} \big|(\phi_1 - \phi_2)_f\big|}{V_c}
\right)
}$$

并在输出时：
```cpp
Info<< "Max Ur Courant Number = " << UrCoNum << endl;
CoNum = max(CoNum, UrCoNum);
```
将其与已有的 `CoNum` 做上确界，表明整体时间步稳定性要同时受普通 Co 数与 Ur Co 数的约束。

## 与标准 Courant 数的对比

- 标准 Courant 数（对单一通量 `phi`）：
  $$\mathrm{Co} =
  \Delta t\;\max_{c}\left(
  \frac{\displaystyle \sum_{f\in \partial c} \left|\phi_f\right|}{V_c}
  \right)$$
- Ur Courant 数：
  $$\mathrm{UrCo} =
  \frac{1}{2}\,\Delta t\;\max_{c}\left(
  \frac{\displaystyle \sum_{f\in \partial c} \left|(\phi_1 - \phi_2)_f\right|}{V_c}
  \right)$$

二者形式类似，但 Ur 使用的是通量之差，并带有 0.5 系数，体现了不同的数值稳定性约束来源。

## 意义与作用

- **数值稳定性约束**：UrCoNum 以相对通量为基准，给出时间步长应满足的 CFL 类型限制。若 UrCoNum 过大，意味着两通量差导致的场量更新在单步内“跨越”过多单元尺度，可能引发不稳定或振荡。
- **自适应时间步控制**：通常会据此调小 Δt，使得 `UrCoNum ≤ UrCoMax`（经验上与常规 `CoMax` 同量级，典型 < 1，常见更保守）。
- **多相/多场相对输运**：在两相流、组分迁移、或多速度群模型里，通量差反映相间相对运动。UrCo 限制可防止界面/相对输运在数值上“超前”。
- **保守性因子 0.5**：半系数可视作额外的安全裕度，具体来源可能与离散格式、分裂策略或理论推导的保守界有关。

## 小结

- **Ur 的含义**：基于通量差的相对 Courant 数，用于刻画两通量（例如两相）相对输运对时间积分稳定性的约束。
- **公式**：
  $$\mathrm{UrCoNum}
  =
  \frac{1}{2}\,\Delta t\;\max_{c}
  \left(
  \frac{\sum_{f\in \partial c} |(\phi_1 - \phi_2)_f|}{V_c}
  \right)$$
- **意义**：辅助时间步选择；在多相或多速度群问题中与普通 Courant 数一起限制 Δt，保证数值稳定与物理一致性。
