---
title: zoneGenerator 与 CFD 直接网格分区
date: 2026-09-15 12:00:00
categories:
  - [CFD, OpenFOAM, 网格]
tags:
  - CFD/OpenFOAM/网格
  - OpenFOAM
  - LES
  - DES
  - 网格
description: zoneGenerator 生成 zones 的方法及其在直接 CFD 模拟(前置分区)中的角色。
mathjax: true
---
[OpenFOAM v13更新详情-8：更优雅的网格操控之道](https://mp.weixin.qq.com/s/mW7Z34w5HjBMF0wNa3ydog)

在之前的OpenFOAM版本中，网格区域（pointZone、cellZone、faceZone）的管理往往需要多个工具配合使用，操作流程相对繁琐。v13版本全新开发的**动态区域生成系统**彻底改变了这一局面。

**核心亮点**：新的`zoneGenerator`能一键生成包含pointZone、cellZone、faceZone任意组合的`zoneSet`，再也不用手动挨个创建区域了。

具体来说，该系统包含了多个zoneGenerator，用于创建和控制动态区域。另外，faceZone的`flipMap`（方向翻转映射）也迎来了人性化调整：现在它变成可选配置了，如果后续需要调整方向，用`flipMap zone generator`就能轻松补上。再也不用为了一个可选的方向参数，在配置文件里写一堆冗余代码了。

**代码层面**的改进主要体现在commit da974812、b4339ca4和a578e1e8等提交中，引入了全新的动态区域生成架构。


# CFD direct Intro

https://cfd.direct/openfoam/free-software/dynamic-zones/

## New Design of Zones

In the new design, a zone can be _static_ or _dynamic_.  A static zone can be created as part of the meshing process, or using the new _createZones_ tool, conﬁgured through a _createZonesDict_ ﬁle.  Static zones are written to relevant  _cellZones_, _faceZones_ and _pointZones_ files in the _polyMesh_ directory, and can still update due to refinement/un-refinement of cells as before. 

Alternatively, a zone can also be generated dynamically within a utility application, e.g. _setFields_  and solver applications, i.e. _foamRun_ or _foamMultiRun_.  Dynamic zones for a CFD simulation are configured in a _zonesGenerator_ ﬁle and are regenerated during a simulation in cases where the mesh moves, or due to any topological change (unless the user can instruct them to remain unchanged).