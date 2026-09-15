---
title: chtMultiRegionFoam 共轭传热求解器:结构与实际案例
date: 2026-09-15 13:00:00
categories:
  - [CFD, OpenFOAM, 求解器]
tags:
  - CFD/OpenFOAM/求解器
  - 求解器
  - blockMesh
  - 浸没边界法
  - 湍流
description: chtMultiRegionFoam 求解器的教程索引、官方案例目录结构与多区域设置要点。
mathjax: true
---
[chtMultiRegionFoam求解器- 文集 哔哩哔哩专栏](https://www.bilibili.com/read/readlist/rl782253?spm_id_from=333.1369.opus.module_collection.click)


# 实际案例



#### 案例典型结构


```
~/O/OpenFOAM-v23/t/heatTransfer/chtMultiRegionFoam/snappyMultiRegionHeater > tree -L 3                                                                                                                                                                                                                      17:35:59
.
├── 0.orig
│   ├── T
│   ├── U
│   ├── alphat
│   ├── epsilon
│   ├── k
│   ├── p
│   ├── p_rgh
│   └── rho
├── Allclean
├── Allrun -> Allrun-parallel
├── Allrun-parallel
├── Allrun-serial
├── constant
│   ├── bottomAir
│   │   ├── radiationProperties
│   │   ├── thermophysicalProperties
│   │   └── turbulenceProperties
│   ├── g
│   ├── heater
│   │   ├── radiationProperties
│   │   └── thermophysicalProperties
│   ├── leftSolid
│   │   ├── radiationProperties -> ../heater/radiationProperties
│   │   └── thermophysicalProperties -> ../heater/thermophysicalProperties
│   ├── regionProperties
│   ├── rightSolid
│   │   ├── radiationProperties -> ../heater/radiationProperties
│   │   └── thermophysicalProperties -> ../heater/thermophysicalProperties
│   └── topAir
│       ├── radiationProperties -> ../bottomAir/radiationProperties
│       ├── thermophysicalProperties -> ../bottomAir/thermophysicalProperties
│       └── turbulenceProperties -> ../bottomAir/turbulenceProperties
└── system
    ├── blockMeshDict
    ├── bottomAir
    │   ├── changeDictionaryDict
    │   ├── decomposeParDict -> ../decomposeParDict
    │   ├── fvSchemes
    │   └── fvSolution
    ├── controlDict
    ├── decomposeParDict
    ├── decomposeParDict.6
    ├── fvSchemes
    ├── fvSolution
    ├── heater
    │   ├── changeDictionaryDict
    │   ├── decomposeParDict -> ../decomposeParDict
    │   ├── fvSchemes
    │   └── fvSolution
    ├── leftSolid
    │   ├── changeDictionaryDict
    │   ├── decomposeParDict -> ../heater/decomposeParDict
    │   ├── fvSchemes -> ../heater/fvSchemes
    │   └── fvSolution
    ├── meshQualityDict
    ├── rightSolid
    │   ├── changeDictionaryDict
    │   ├── decomposeParDict -> ../heater/decomposeParDict
    │   ├── fvSchemes -> ../heater/fvSchemes
    │   └── fvSolution
    ├── snappyHexMeshDict
    ├── surfaceFeatureExtractDict
    └── topAir
        ├── changeDictionaryDict
        ├── decomposeParDict -> ../bottomAir/decomposeParDict
        ├── fvSchemes -> ../bottomAir/fvSchemes
        └── fvSolution

13 directories, 55 files
```



#### 案例典型执行流程


```shell 

#!/bin/sh
cd "${0%/*}" || exit                                # Run from this directory
. ${WM_PROJECT_DIR:?}/bin/tools/RunFunctions        # Tutorial run functions
#------------------------------------------------------------------------------

mkdir -p constant/triSurface

cp -f "$FOAM_TUTORIALS"/resources/geometry/geom.stl.gz constant/triSurface

rm -rf constant/polyMesh/sets

# For meshing only
decompDict="-decomposeParDict system/decomposeParDict.6"

runApplication blockMesh

runApplication surfaceFeatureExtract

runApplication $decompDict decomposePar

runParallel $decompDict snappyHexMesh -overwrite

# Restore initial fields
restore0Dir -processor

runParallel $decompDict splitMeshRegions -cellZones -overwrite

# Remove fluid fields from solid regions (important for post-processing)
for region in $(foamListRegions solid)
do
    rm -f 0/"$region"/{nut,alphat,epsilon,k,U,p_rgh}
    rm -f processor*/0/"$region"/{nut,alphat,epsilon,k,U,p_rgh}
done

for region in $(foamListRegions)
do
    runParallel $decompDict -s "$region" changeDictionary -region $region
done

# Redistribute onto fewer processors, with special treatment for heater
for region in $(foamListRegions)
do
    runParallel -np 6 -s redist-"$region" \
        redistributePar -overwrite -region "$region"
done

#-- Run in parallel
runParallel $(getApplication)

# Reconstruct
for region in $(foamListRegions)
do
    runParallel -s reconstruct-"$region" \
        redistributePar -reconstruct -region "$region"
done

#------------------------------------------------------------------------------

```



# 与multiRegionReactingFoam的区别




[TonkomoLLC/multiRegionReactingFoam: OpenFOAM transient solver for laminar or turbulent fluid flow and solid heat conduction with conjugate heat transfer between solid and fluid regions, plus combustion with chemical reactions (psi thermo model)](https://github.com/TonkomoLLC/multiRegionReactingFoam)

> The main difference with chtMultiRegionReactingFoam is the form of PEqn.H. PEqn in chtMultiRegionReactingFoam is based on PEqn from chtMultiRegionFoam, while PEqn in multiRegionReactingFoam is based on reactingFoam. One may find multiRegionReactingFoam to be better than chtMultiRegionReactingFoam for some situations, especially where there are large pressure changes during the simulation.