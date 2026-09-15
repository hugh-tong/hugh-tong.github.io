---
title: 教程阅读:OSCFD LES tutorial(占位)
date: 2026-09-15 16:10:00
categories:
  - [CFD, 论文阅读]
tags:
  - LES
  - 湍流
  - OpenFOAM
  - 占位待充实
description: OSCFD 2019 湍流模型实现教程的阅读笔记,占位待充实。
mathjax: true
---

> 本篇目前是占位页(原文较短),正文待后续用 AI 工具充实。原始笔记:

## OSCFD_tutorial


湍流在`simpleFOAM`求解器中，是靠在`simpleFoam.C`中定义：
```
#include "turbulentTransportModel.H"
```
这个文件位于`$FOAM_SRC/TurbulenceModels/incompressible/turbulentTransportModels`，见下：


`LESModel`为一个`typedef`
**[PDF 素材:OSCFD2019_ImplementTurbulenceModel.pdf]**

湍流模型在求解器`createFields.H`中，构建了一个湍流相关的指针：

**[PDF 素材:OSCFD2019_ImplementTurbulenceModel.pdf]**

上述的`laminarTransport`，由`createFields.H`中构建：

```C++
singlePhaseTransportModel laminarTransport(U,phi);
```

有这个`laminalTranpsort`的原因是，`eddy-viscosity turbulence`需要计算一个有效粘度，这个粘度包含laminar和非牛顿流体non-Newton对laminar的影响。

**[PDF 素材:OSCFD2019_ImplementTurbulenceModel.pdf]**

