---
title: OpenFOAM 与 Fluent 的 SIMPLE/k-ε 设置对比
date: 2023-08-24 23:11:34
updated: 2026-09-16 18:00:00
categories:
  - [CFD, OpenFOAM, Fluent]
tags:
  - OpenFOAM
  - Fluent
  - SIMPLE
  - 湍流
description: 对照 OpenFOAM 与 Fluent 中不可压缩 SIMPLE 计算的压力、黏度和标准 k-ε 模型参数；当前算例对照尚未完成。
published: false
---

> 状态：草稿。已修正量纲和标准 k-ε 常数，但尚未完成同一算例的跨软件验证，因此暂不公开。


### 预备知识

- 动力黏度（dynamic viscosity）：$\mu$，牛顿流体中 $\tau = \mu \partial u/\partial y$，单位为 $\mathrm{Pa\cdot s}$。
- 运动黏度（kinematic viscosity）：$\nu = \mu / \rho$，单位为 $\mathrm{m^2/s}$。

在OpenFOAM中，一般设置运动粘度：
```
nu [ 0 2 -1 0 0 0 0 ] 0.01;
```

[theory.pdf (dyfluid.com)](http://www.dyfluid.com/theory.pdf)
对常密度不可压缩流，动量方程除以常数密度后可写成：

$$
\begin{align} 
\nabla\cdot\mathbf{U}=0, \\
\nabla \cdot (\mathbf{U}\mathbf{U})-\nabla \cdot(\nu \nabla \mathbf{U})=-\nabla (p/\rho).

\end{align}
$$
经典不可压缩 OpenFOAM 求解器中的 `p` 通常存储运动压力 $p/\rho$，因此量纲是 $\mathrm{m^2/s^2}$：

```
dimensions      [0 2 -2 0 0 0 0];
```
这不是说物理压力失去量纲，而是求解变量已经除以参考密度。与 Fluent 对照时必须先确认比较的是静压、表压还是运动压力。


### $k-\epsilon$ 模型

对于求解采用$k-\epsilon$ 模型时，湍流粘度$\nu_{t}$ 与湍动能$k$ 和湍流耗散率$\epsilon$ 结合，有公式：
$$
\nu_t = C_{\mu} \frac{k^2}{\epsilon}
$$
OpenCFD 文档给出的标准 k-ε 默认常数为：
$$
\begin{align} 
C_{\mu} = 0.09 \\
C_1 = 1.44 \\
C_2 = 1.92 \\
\sigma_k = 1.0 \\
\sigma_\epsilon = 1.3
\end{align}
$$

有些软件界面使用扩散系数的倒数表示法，因此可能显示 $1/\sigma_\epsilon\approx0.76923$；比较两套软件时要先核对参数定义，不能只比较数值。

[OpenFOAM 标准 k-ε 模型说明](https://doc.openfoam.com/2212/tools/processing/models/turbulence/ras/linear-evm/rtm/kEpsilon/)

[Turbulence dissipation rate -- CFD-Wiki, the free CFD reference (cfd-online.com)](https://www.cfd-online.com/Wiki/Turbulence_dissipation_rate)
湍流耗散率单位：$m^2/s^3$


### 关于边界flowRateInletVelocity
[flowRateInletVelocity value uniform (0 0 0) -- CFD Online Discussion Forums (cfd-online.com)](https://www.cfd-online.com/Forums/openfoam-pre-processing/237183-flowrateinletvelocity-value-uniform-0-0-0-a.html)
[OpenFOAM: API Guide: flowRateInletVelocityFvPatchVectorField Class Reference](https://www.openfoam.com/documentation/guides/v2112/api/classFoam_1_1flowRateInletVelocityFvPatchVectorField.html)
- Example of the boundary condition specification for a **volumetric flow** rate:
```
    <patchName>
    {
        type                flowRateInletVelocity;
        volumetricFlowRate  0.2;
        extrapolateProfile  yes;
        value               uniform (0 0 0);
    }

```

- example of the boundary condition specification for a **mass flow rate**:
```
    <patchName>
    {
        type                flowRateInletVelocity;
        massFlowRate        0.2;
        extrapolateProfile  yes;
        rho                 rho;
        rhoInlet            1.0;
        value               uniform (0 0 0);
    }
```



- 检测入口和出口处的流量相同的
[Difference between specified and calculated mass flow rate -- CFD Online Discussion Forums (cfd-online.com)](https://www.cfd-online.com/Forums/openfoam-solving/225969-difference-between-specified-calculated-mass-flow-rate.html)



### 边界条件的$k-\epsilon$ 模型该怎么取

[calculation of k, epsilon and omega -- CFD Online Discussion Forums (cfd-online.com)](https://www.cfd-online.com/Forums/openfoam-pre-processing/81498-calculation-k-epsilon-omega.html)

[Turbulence free-stream boundary conditions -- CFD-Wiki, the free CFD reference (cfd-online.com)](https://www.cfd-online.com/Wiki/Turbulence_free-stream_boundary_conditions)

- 看Henry等人写的关于这部分的内容

[Notes on CFD: General Principles - 7.3 Inlet turbulence](https://doc.cfd.direct/notes/cfd-general-principles/inlet-turbulence#x197-2430003)

- 看这里的估算方法

[Calculator for the estimation of turbulence properties values (boundary and initial conditions) (wolfdynamics.com)](http://www.wolfdynamics.com/tools.html?id=110)
