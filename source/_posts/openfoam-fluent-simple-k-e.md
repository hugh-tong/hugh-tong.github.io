---
title: OpenFOAM和fluent的SIMPLE计算设置对比【还没写完】
date: 2023-08-24 23:11:34
tags: OpenFOAM
---



### 预备知识

- (Dynamic viscosity)动力粘度：$\mu$ $，这个$$\mu$与牛顿内摩擦公式有关：$\tau = \mu du/ dy$， 单位为$Pa\cdot s$或$N\cdot s/m^2$
- (Kinematic viscosity)运动粘度：$\nu = \mu / \rho$  ，单位为$m^2/s$

在OpenFOAM中，一般设置运动粘度：
```
nu [ 0 2 -1 0 0 0 0 ] 0.01;
```

[theory.pdf (dyfluid.com)](http://www.dyfluid.com/theory.pdf)
对于simpleFoam来说，OpenFOAM求解的方程是这样的：

$$
\begin{align} 
\nabla\cdot\bf{U}=0 \\
\nabla \cdot (\mathbf{U}\mathbf{U})-\nabla \cdot(\nu \nabla \mathbf{U})=-\nabla p

\end{align}
$$
对于不可压流体时，OpenFOAM对上述方程整个除了密度$\rho$ 。所以会在边界条件的p文件内看到p的量纲是$m^2/s^2$：

```
dimensions      [0 2 -2 0 0 0 0];
```
压力$p$ 原量纲为：$kg / m\cdot s^2$ ，除以密度$kg/m^3$


### $k-\epsilon$ 模型

对于求解采用$k-\epsilon$ 模型时，湍流粘度$\nu_{t}$ 与湍动能$k$ 和湍流耗散率$\epsilon$ 结合，有公式：
$$
\nu_t = C_{\mu} \frac{k^2}{\epsilon}
$$
标准 k-ε 模型：
常数：
$$
\begin{align} 
C_{mu} = 0.0 \\
C_1 = 1.44 \\
C_2 = 1.92 \\
α_k = 1 \\
α_ε = 0.76923
\end{align}
$$

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

