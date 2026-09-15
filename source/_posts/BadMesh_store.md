---
title: 坏网格图鉴(BadMesh Store)
date: 2026-09-15 12:00:00
categories:
  - [CFD, OpenFOAM, 网格]
tags:
  - CFD/OpenFOAM/网格
  - 网格
  - BadMesh
description: 网格加密层不匹配、尺寸突变、曲率不匹配等典型坏网格案例图集,配合 surfaceCheck 的实际输出。
mathjax: true
---
20251203，以下情况是因为网格加密在同一层没有对于设置，导致出现的“一对多”情况。
![](/images/BadMesh_store/20251203_badMesh_oneToMultiMesh.png)



![](/images/BadMesh_store/20251203_badMesh_SizeChangeInduced.png)


![](/images/BadMesh_store/20251203_badMesh_curvature.png)



![](/images/BadMesh_store/20251204_surfaceCheck_badSurface.png)



