---
title: 阻力系数(Drag Coefficient)——气动性能的终极积分指标
date: 2026-09-13 15:20:00
categories:
  - [CFD, 无量纲数]
tags:
  - 无量纲数
  - Drag Coefficient
  - OpenFOAM
  - Fluent
description: 阻力系数 Cd 是物体表面压差阻力与摩擦阻力的宏观积分总和,参考面积的选取是最易出错的环节,阻力危机则是检验湍流模型精度的最强试金石。
mathjax: true
---

阻力系数($C_d$)是与 $C_p$ 并列的核心无量纲参数。如果说 $C_p$ 描述了流场中某一点的压力状态,那么 $C_d$ 则是对物体表面所有受力情况的宏观积分总和。对于不可压缩单相流,它是评价气动/水动外形效率的终极指标。本文解析 $C_d$ 的构成、计算原理以及开发者复现时的关键细节。

## 参数速览

- **Name**: Drag Coefficient
- **Symbol**: $C_d$
- **Fluent Variable**: `drag-coefficient`
- **Setup Location**: `Report Definitions` -> `New` -> `Force Report` -> `Drag`
- **Key Configuration**: `Report` -> `Reference Values`(同样,这是 $C_d$ 计算的命门)

## 原理

### 数学定义

$$
C_d = \frac{F_d}{\frac{1}{2} \rho_{ref} v_{ref}^2 A_{ref}}
$$

- $F_d$:阻力(Drag Force),即流体作用在物体上平行于来流方向的总力;
- $\frac{1}{2} \rho_{ref} v_{ref}^2$:参考动压(Reference Dynamic Pressure);
- **$A_{ref}$**:参考面积(Reference Area)。这是最容易出错的参数。

### 物理构成:阻力的两个来源

在不可压缩粘性流动中,总阻力分解为两部分:

1. **压差阻力(Pressure Drag / Form Drag)**:
   - 来源:物体前后表面的压力差。
   - 物理机制:只要有流动分离(Flow Separation),后方形成低压尾迹区,压差阻力就会占主导。
   - 计算方式:对表面静压在阻力方向上的积分。
     $$
     F_{d,p} = \int_{Surface} (P - P_{ref}) (\vec{n} \cdot \vec{d}) dA
     $$
     其中 $\vec{n}$ 是面法向量,$\vec{d}$ 是阻力方向矢量。

2. **摩擦阻力(Viscous Drag / Skin Friction Drag)**:
   - 来源:流体粘性在壁面产生的剪切应力。
   - 物理机制:边界层内的速度梯度 $\tau_w = \mu \frac{\partial u}{\partial y}|_{wall}$。
   - 计算方式:对壁面剪切应力在阻力方向上的积分。
     $$
     F_{d,v} = \int_{Surface} (\vec{\tau}_w \cdot \vec{d}) dA
     $$

$$
C_d = C_{d, pressure} + C_{d, viscous}
$$

## 物理意义

### 1. 流动状态的指示器

- **流线型物体(Streamlined Body)**:如机翼、鱼雷。
  - 流体附着良好,分离极少。
  - 特征:$C_d$ 很小(例如 0.04),其中摩擦阻力占主导。
- **钝体(Bluff Body)**:如圆柱、垂直平板、汽车。
  - 流体在大面积区域发生分离,形成宽阔的低压尾迹。
  - 特征:$C_d$ 很大(例如 1.0 - 2.0),其中压差阻力占绝对主导(>90%)。

### 2. 雷诺数相关性

对于不可压缩流,$C_d$ 强依赖于 $Re$:

- **Stokes 区(Re < 1)**:$C_d \propto 1/Re$(纯粘性主导)。
- **亚临界区(Sub-critical)**:$C_d$ 相对稳定(如圆柱在 $Re=10^3 \sim 10^5$ 时 $C_d \approx 1.2$)。
- **阻力危机(Drag Crisis)**:当边界层从层流转捩为湍流(圆柱约在 $Re \approx 3 \times 10^5$),分离点后移,尾迹变窄,$C_d$ 突然暴跌(从 1.2 跌至 0.3)。
  - 验证要点:如果求解器能算出这个跌落,说明湍流模型和转捩预测非常准。

## 实现细节

在开发求解器时,计算 $C_d$ 实际上是一个表面积分(Surface Integration)过程。

### 积分逻辑(Numerical Integration)

不要指望直接解出一个 $C_d$ 方程。这是后处理步骤。

```cpp
// 伪代码：计算 Drag Force
Vector3 dragDir = {1.0, 0.0, 0.0}; // 假设X方向是流向
double totalPressureForce = 0.0;
double totalViscousForce = 0.0;

for (Face& f : wallFaces) {
    // 1. 获取面数据
    double P = f.pressure;        // 单元中心或面心静压
    Vector3 n = f.normal;         // 指向流体的单位法向
    double area = f.area;         // 面面积
    Vector3 tau = f.wallShearStress; // 壁面剪切矢量 (由速度梯度计算)

    // 2. 压力分量 (Pressure Drag)
    // 力 = 压力 * 面积 * (法向投影到阻力方向)
    // 注意方向：压力是指向壁面的，所以通常取反，取决于法向定义
    // Fluent中法向是指向外部的，所以压力力向量是 P * Area * n
    double f_p = P * area * dot(n, dragDir);
    totalPressureForce += f_p;

    // 3. 粘性分量 (Viscous Drag)
    // 剪切力是切向的
    double f_v = dot(tau, dragDir) * area;
    totalViscousForce += f_v;
}

double totalDrag = totalPressureForce + totalViscousForce;
```

### 参考值的陷阱(Reference Area)

这是开发者和用户最容易产生偏差的地方。

- **定义**:$A_{ref}$ 是什么?
  - 对于飞机/机翼:通常是投影面积(Planform Area)(俯视图面积);
  - 对于汽车/圆柱:通常是迎风面积(Frontal Area)(正视图面积)。
- **Fluent 默认值**:Fluent 默认 $A_{ref} = 1.0\ m^2$。它不会自动帮用户算物体的迎风面积。
  - 开发备注:在自研求解器中,要么提供工具让用户计算投影面积,要么强制用户输入 $A_{ref}$。千万不要默认使用 `Total Surface Area`(湿表面积),否则算出来的 $C_d$ 会比标准值小好几倍。

### 验证基准(Benchmarks)

1. **2D 圆柱绕流(Re = 100,层流)**:
   - 目标 $C_d \approx 1.3 \sim 1.4$;
   - 如果算出 1.0 或 1.8,检查积分逻辑或边界条件。
2. **3D 球体绕流**:
   - 标准阻力曲线图(Schlichting 图)。
3. **平板层流边界层(Blasius Solution)**:
   - $C_d = \frac{1.328}{\sqrt{Re_L}}$;
   - 这是一个纯摩擦阻力案例(压差阻力为 0),用来验证壁面剪切应力 $\tau_w$ 的计算精度。

## 小结

1. $C_d$ 是压力阻力和摩擦阻力的总和。在 Fluent 中一定要分别检查这两个分量(`Force Report` 可以分别输出),以判断阻力来源。
2. **参考面积($A_{ref}$)的选择决定了 $C_d$ 的数值大小**,必须明确定义。
3. 在不可压流中,$C_d$ 是验证湍流模型准确性(特别是分离点预测)的最强指标。

*本文整理自个人 CFD 学习笔记系列*
