---
title: splitMesh 与 splitMeshRegions
date: 2026-09-15 12:00:00
categories:
  - [CFD, OpenFOAM, 网格]
tags:
  - CFD/OpenFOAM/网格
  - LES
  - 网格
  - 浸没边界法
  - OpenFOAM
description: 按 region/zone 拆分网格的工具:单区域内拆 zone 与拆多区域网格的区别。
mathjax: true
---
[OpenFOAM: Manual Pages: splitMesh](https://www.openfoam.com/documentation/guides/latest/man/splitMesh.html)

[OpenFOAM v2506 API: splitMeshRegions](https://api.openfoam.com/2506/splitMeshRegions_8C.html)


[02 chtMultiRegionFoam求解器- splitMesh - 哔哩哔哩](https://www.bilibili.com/opus/874133021354098706)



`OpenFOAM-v2406`采用`splitMeshRegions`的一个例子。

```shell
$ splitMeshRegions -cellZones
/*---------------------------------------------------------------------------*\
| =========                 |                                                 |
| \\      /  F ield         | OpenFOAM: The Open Source CFD Toolbox           |
|  \\    /   O peration     | Version:  2406                                  |
|   \\  /    A nd           | Website:  www.openfoam.com                      |
|    \\/     M anipulation  |                                                 |
\*---------------------------------------------------------------------------*/
Build  : _630d60de3b-20240620 OPENFOAM=2406 version=v2406
Arch   : "LSB;label=32;scalar=64"
Exec   : splitMeshRegions -cellZones
Date   : Jun 29 2025
Time   : 16:14:21
Host   : example-host
PID    : 464597
I/O    : uncollated
Case   : $CASE_DIR
nProcs : 1
trapFpe: Floating point exception trapping enabled (FOAM_SIGFPE).
fileModificationChecking : Monitoring run-time modified files using timeStampMaster (fileModificationSkew 5, maxFileModificationPolls 20)
allowSystemOperations : Allowing user-supplied system call operations

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
Create time

Create mesh for time = 0

Creating single patch per inter-region interface.

Trying to match regions to existing cell zones.


Number of regions:5

Writing region per cell file (for manual decomposition) to "$CASE_DIR/constant/cellToRegion"

Writing region per cell as volScalarField to "$CASE_DIR/0/cellToRegion"

Region  Cells
------  -----
0       3952
1       1040
2       640
3       1040
4       3300

Region  Zone    Name
------  ----    ----
0       (4)     bottomAir
1       (2)     leftSolid
2       (0)     heater
3       (1)     rightSolid
4       (3)     topAir

Sizes of interfaces between regions:

Interface       Region  Region  Faces
---------       ------  ------  -----
0               0       3       520
1               3       4       520
2               0       1       520
3               2       4       160
4               2       3       40
5               1       2       40
6               0       2       368
7               1       4       520

Reading volScalarField: T alphat cellToRegion epsilon k p p_rgh rho
Reading volVectorField: U


Adding patches


Adding patches

For interface between region bottomAir and rightSolid added patches
    6   bottomAir_to_rightSolid
    7   rightSolid_to_bottomAir
For interface between region rightSolid and topAir added patches
    8   rightSolid_to_topAir
    9   topAir_to_rightSolid
For interface between region bottomAir and leftSolid added patches
    10  bottomAir_to_leftSolid
    11  leftSolid_to_bottomAir
For interface between region heater and topAir added patches
    12  heater_to_topAir
    13  topAir_to_heater
For interface between region heater and rightSolid added patches
    14  heater_to_rightSolid
    15  rightSolid_to_heater
For interface between region leftSolid and heater added patches
    16  leftSolid_to_heater
    17  heater_to_leftSolid
For interface between region bottomAir and heater added patches
    18  bottomAir_to_heater
    19  heater_to_bottomAir
For interface between region leftSolid and topAir added patches
    20  leftSolid_to_topAir
    21  topAir_to_leftSolid

Region 0
--------
Creating mesh for region 0 bottomAir
Mapping fields
Mapping field T
Mapping field alphat
Mapping field cellToRegion
Mapping field epsilon
Mapping field k
Mapping field p
Mapping field p_rgh
Mapping field rho
Mapping field U
Deleting empty patches
Writing new mesh
Writing addressing to base mesh
Writing map pointRegionAddressing from region0 points back to base mesh.
Writing map faceRegionAddressing from region0 faces back to base mesh.
Writing map cellRegionAddressing from region0 cells back to base mesh.
Writing map boundaryRegionAddressing from region0 boundary back to base mesh.

Region 1
--------
Creating mesh for region 1 leftSolid
Mapping fields
Mapping field T
Mapping field alphat
Mapping field cellToRegion
Mapping field epsilon
Mapping field k
Mapping field p
Mapping field p_rgh
Mapping field rho
Mapping field U
Deleting empty patches
Writing new mesh
Writing addressing to base mesh
Writing map pointRegionAddressing from region1 points back to base mesh.
Writing map faceRegionAddressing from region1 faces back to base mesh.
Writing map cellRegionAddressing from region1 cells back to base mesh.
Writing map boundaryRegionAddressing from region1 boundary back to base mesh.

Region 2
--------
Creating mesh for region 2 heater
Mapping fields
Mapping field T
Mapping field alphat
Mapping field cellToRegion
Mapping field epsilon
Mapping field k
Mapping field p
Mapping field p_rgh
Mapping field rho
Mapping field U
Deleting empty patches
Writing new mesh
Writing addressing to base mesh
Writing map pointRegionAddressing from region2 points back to base mesh.
Writing map faceRegionAddressing from region2 faces back to base mesh.
Writing map cellRegionAddressing from region2 cells back to base mesh.
Writing map boundaryRegionAddressing from region2 boundary back to base mesh.

Region 3
--------
Creating mesh for region 3 rightSolid
Mapping fields
Mapping field T
Mapping field alphat
Mapping field cellToRegion
Mapping field epsilon
Mapping field k
Mapping field p
Mapping field p_rgh
Mapping field rho
Mapping field U
Deleting empty patches
Writing new mesh
Writing addressing to base mesh
Writing map pointRegionAddressing from region3 points back to base mesh.
Writing map faceRegionAddressing from region3 faces back to base mesh.
Writing map cellRegionAddressing from region3 cells back to base mesh.
Writing map boundaryRegionAddressing from region3 boundary back to base mesh.

Region 4
--------
Creating mesh for region 4 topAir
Mapping fields
Mapping field T
Mapping field alphat
Mapping field cellToRegion
Mapping field epsilon
Mapping field k
Mapping field p
Mapping field p_rgh
Mapping field rho
Mapping field U
Deleting empty patches
Writing new mesh
Writing addressing to base mesh
Writing map pointRegionAddressing from region4 points back to base mesh.
Writing map faceRegionAddressing from region4 faces back to base mesh.
Writing map cellRegionAddressing from region4 cells back to base mesh.
Writing map boundaryRegionAddressing from region4 boundary back to base mesh.
End

```
