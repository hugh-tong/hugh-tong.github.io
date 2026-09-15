---
title: improveMeshQuality 工具实测
date: 2026-09-15 12:00:00
categories:
  - [CFD, OpenFOAM, 网格]
tags:
  - CFD/OpenFOAM/网格
  - 网格
  - Bash
  - cfMesh
  - OpenFOAM
description: OpenFOAM 官方 improveMeshQuality 工具的效果实测与适用场景。
mathjax: true
---
https://www.openfoam.com/documentation/guides/v2112/man/improveMeshQuality.html

```
(cfmesh)
Performs point relocations in the mesh (smoothing) in order to improve quality
measures.
```


`improveMeshQuality` 是 `cfMesh` 套件中一个非常有用的**后处理工具**。

如果把 `checkMesh` 比作**体检医生**（只告诉你哪里有病），那么 `improveMeshQuality` 就是**理疗师**（不进行大手术，而是通过按摩推拿来缓解病痛）。

参考开源代码逻辑，以下是它具体“干了什么”的深度解析：

### 1. 核心机制：节点重定位 (Point Relocation / Smoothing)

这是它最核心的功能。**它绝对不会改变网格的拓扑结构**（即：它不会增加、删除或合并网格，也不会切割网格）。

它做的仅仅是**移动网格顶点的坐标 (Move Vertices)**。

- **原理**：它构建了一个以网格质量为目标的优化函数。可以把它想象成一个物理弹簧系统，网格节点之间有弹力。
- **操作**：它会微调内部点的位置，试图让扭曲的网格变得更“正”一点。

### 2. 它主要攻击的三大“病灶”

根据 cfMesh 的源代码（主要是 `smoother` 相关的库），它主要致力于优化以下指标：

#### A. 非正交性 (Non-orthogonality) —— **首要目标**

这是 OpenFOAM 求解最怕的指标。

- **问题**：两个网格单元中心的连线，与它们公共面的法线不平行。
- **动作**：工具会移动公共面上的顶点，试图让这个面“转动”一下角度，使得面法线更指向邻居网格的中心。

#### B. 偏斜度 (Skewness)

- **问题**：面中心与两个网格单元中心连线的交点距离太远。
- **动作**：移动面上的点，试图把面的几何中心拉回到两个体心的连线附近。

#### C. 单元平滑过渡 (Smoothness)

- **问题**：相邻网格大小突变（比如一个小网格紧挨着一个大网格）。
- **动作**：它会把大网格的点往小网格那边推一点，让体积过渡更均匀。

### 3. 关键约束：表面吸附 (Surface Projection)

你可能会担心：_“如果它乱动点，会不会把我的车身形状搞坏了？”_

`improveMeshQuality` 在移动点时有严格的约束：

- **内部点**：可以在空间中自由微调。
- **边界点（Boundary Points）**：只能在几何表面（STL）上**滑动**，不能脱离表面。
- **特征线点（Feature Edges）**：只能沿着特征线滑动，绝不会把尖锐的棱角磨圆。

### 4. 什么时候使用它？

通常在以下两种情况使用：

1. **救急**：你用 `cartesianMesh` 生成完网格，发现 `checkMesh` 报错，说有几个网格非正交性达到了 85 度（导致求解发散）。这时候运行一下 `improveMeshQuality`，可能刚好能把它降到 75 度，救活这个算例。
2. **多次迭代**：有时候一遍不够，需要多跑几遍：
    
    ```bash
    improveMeshQuality -count 5
    ```
    
    （尝试迭代优化 5 次）

### 5. 局限性（不要神话它）

虽然它叫“Improve”，但它不是魔法：

1. **无法修复拓扑错误**：如果网格本身就有负体积，或者 STL 表面有大破洞导致的极度扭曲，它是修不好的。
2. **拆东墙补西墙**：有时候为了降低非正交性，可能会稍微牺牲一点长宽比（Aspect Ratio）。
3. **效率递减**：通常第一遍运行效果最好，跑得多了网格质量就不会再有明显提升了。

### 总结

`improveMeshQuality` 就是一个**基于优化的平滑算法**。它读取现有的 `polyMesh`，在保持几何外形不变的前提下，通过**挪动节点位置**，尽力把那些“歪瓜裂枣”的网格拉得更正一点。


### 20251204，实操结果


![](/images/improveMeshQuality/20251204_improveMeshQuality_result.png)