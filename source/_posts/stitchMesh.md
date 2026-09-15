---
title: stitchMesh 官方案例流程
date: 2026-09-15 12:00:00
categories:
  - [CFD, OpenFOAM, 网格]
tags:
  - CFD/OpenFOAM/网格
  - blockMesh
  - OpenFOAM
  - 网格
description: 用官方案例跑通 stitchMesh 缝合两侧 patch 的完整流程与坑。
mathjax: true
---
https://www.openfoam.com/news/main-news/openfoam-v1712/pre-processing
> `stitchMesh`


The stitchMesh utility stitches two volumetric meshes by manipulating the interfacing faces to create topologically conformal interface.
stitchMesh 工具通过调整相接面的网格面来拼接两个体网格，以创建在拓扑上相容的接口。

Use of the utility is limited on situation with simple patches, as the only information processed are the faces, no edges or line elements are taken into the account.
由于该实用工具仅处理面信息，而忽略了边和线元素，因此它仅适用于简单的补丁情况。


Further user should make sure the stitched patches have no or very little (case sensitive) gap otherwise the algorithm will either result in sliver edges or too large deformation of the mesh.
此外，用户应确保拼接的区块之间没有或几乎没有（区分大小写）间隙，否则算法会导致产生细小边缘或网格的过度变形。


# stitchMesh官方案例流程


`simple-cube1`

```shell

blockMesh

topoSet 

subsetMesh final -patch outer -resultTime 0

rm -f constant/polyMesh/{cellZones,faceZones,pointZones}

topoSet -dict system/topoSetDict.patches

createPatch -overwrite

stitchMesh -overwrite

checkMesh

```