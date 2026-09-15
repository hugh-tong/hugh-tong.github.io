---
title: castellatedMeshControls 与 baffle 生成代码解读
date: 2026-09-15 12:00:00
categories:
  - [CFD, OpenFOAM, 网格]
tags:
  - CFD/OpenFOAM/网格
  - snappyHexMesh
  - LES
  - OpenFOAM
  - 网格
description: snappyHexMesh 网格细化与 baffle 生成的源码级解读笔记。
mathjax: true
---
来源：https://www.openfoam.com/news/main-news/openfoam-v2312/pre-processing

> snappyHexMesh: writing faces from the automatic leak path closure

https://develop.openfoam.com/Development/openfoam/-/blob/master/src/mesh/snappyHexMesh/meshRefinement/meshRefinementBaffles.C

## AIRef解读


好的，这是按照您要求整理的 `src_mesh_snappyHexMesh_meshRefinement_meshRefinementBaffles.C` 文件主要函数列表：

### **核心挡板生成与处理**

| 函数名                       | 作用                                                                  |
| :------------------------ | :------------------------------------------------------------------ |
| **`createBaffles`**       | **通用挡板生成入口**。根据传入的面列表，通过拓扑变化将这些内部面切开，转换为成对的边界面（挡板）。                 |
| **`createZoneBaffles`**   | **基于 FaceZone 生成挡板**。查找位于指定 `faceZone` 内的面，并将它们转换为挡板。常用于处理薄壁结构。     |
| **`freeStandingBaffles`** | **孤立挡板检测**。返回所有“孤立”的挡板面索引。所谓孤立是指那些没有连接到其他边界或挡板的悬空面（类似悬空的纸片）。        |
| **`mergeBaffles`**        | **挡板缝合/移除**。`createBaffles` 的逆操作。尝试将成对的边界面（挡板）重新缝合成内部面，用于移除不再需要的挡板。 |

### **区域划分 (Zonify) 与搜索**

| 函数名                        | 作用                                                                                         |
| :------------------------- | :----------------------------------------------------------------------------------------- |
| **`zonify`**               | **区域染色/划分**。核心算法，基于封闭的 `faceZone` 边界，使用泛洪填充（flood-fill）将连通区域标记为不同的 `cellZone`（如区分内流场/外流场）。 |
| **`getIntersections`**     | **相交检测**。计算网格面与几何表面的交点，用于判断哪些面穿过了几何边界，辅助区域划分。                                              |
| **`findZoneFaces`**        | **寻找区域边界**。在 `zonify` 过程中，搜索并识别构成特定区域物理边界的面。                                               |
| **`markFacesOnDiffZones`** | **边界标记**。标记那些位于两个不同 `cellZone` 之间的面（即区域分界线），这些面通常随后会被转换为挡板。                                |

### **区域形态学操作**

| 函数名 | 作用 |
| :--- | :--- |
| **`growCellZone`** | **区域生长**。将当前 `cellZone` 向外扩展一层，吞并邻居单元。用于填补缝隙或微调区域范围。 |
| **`erodeCellZone`** | **区域腐蚀**。将当前 `cellZone` 的最外层单元剥离，缩小区域。常与 `growCellZone` 配合使用以平滑边界。 |

### **拓扑修复与质量控制**

| 函数名 | 作用 |
| :--- | :--- |
| **`handleSnapProblems`** / **`baffleAndSplitMesh`** | **坏点隔离**。在网格捕捉（snapping）阶段，如果单元质量太差且无法移动，则引入挡板将其切开或隔离，防止计算发散。 |
| **`dupNonManifoldPoints`** | **非流形点修复**。检测并复制非流形点，解耦几何上连接但不合法的拓扑（如“蝴蝶结”式连接），确保网格拓扑合法。 |
| **`consistentOrientation`** | **法向一致性**。强制统一 `faceZone` 中所有面的法向量方向。如果方向反了则翻转，这对后续物理计算（如流量统计）至关重要。 |
| **`checkZoneFaces`** | **一致性检查**。验证 `faceZone` 的完整性，检查是否有遗漏的面或错误的连接关系。 |