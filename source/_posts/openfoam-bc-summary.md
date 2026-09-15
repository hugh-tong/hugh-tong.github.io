---
title: OpenFOAM 边界条件速查总表
date: 2026-09-15 12:00:00
categories:
  - [CFD, OpenFOAM, 边界条件]
tags:
  - CFD/OpenFOAM/边界条件
  - 浸没边界法
  - Cpp
  - 边界条件
  - OpenFOAM
description: 常用边界条件一页速查:物理意义、典型场景、搭配关系。
mathjax: true
---
#### 设置中的Placeholder

[flowRateInletVelocity -- CFD Online Discussion Forums](https://www.cfd-online.com/Forums/openfoam-pre-processing/97966-flowrateinletvelocity.html)

OpenFOAM中存在一些继承关系带来的`placeholder`，他写在哪里，实际上没有意义。
```
inlet
{
  type        flowRateInletVelocity;
  flowRate    0.2;        // Volumetric/mass flow rate [m3/s or kg/s]
  value       uniform (0 0 0); // placeholder
}
```

The value field is a part of every boundary condition, since they derive from the same basic boundary condition. placeholder means just that. you need it in order for OF to use the boundary condition, but it doesn't really matter what you set it to.


OpenFOAM is based on C++ where new classes and libraries, such as boundary conditions can be derived from previous ones, which also means that they take input parameters and internal values with them. In this case this means that the new class flowRateInletVelocity, which is based on fixedValueFvPatchVectorField, also inherited the value component.  
  
This in turn means that the value variable is part of flowRateInletVelocity and therefore must be specified, otherwise the class is missing an input, even though the variable is never used. Just try it without the variable and you will notice that it won't run.


> NOTE: 在新版的OpenFOAM中，这些问题是否有解决？ 因为这个问题还是比较违反设置案例的物理过程。