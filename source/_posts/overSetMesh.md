---
title: overset 重叠网格在 OpenFOAM 中的计算流程(v2406)
date: 2026-09-15 12:00:00
categories:
  - [CFD, OpenFOAM, 网格]
tags:
  - CFD/OpenFOAM/网格
  - blockMesh
  - 网格
  - MPI
  - OpenFOAM
description: oversetMesh 从挖洞、插值到求解的完整流程,附双旋翼算例演示图。
mathjax: true
---
# v2406-overset整体计算流程

## twoSimpleRotor


### Allrun.pre

```shell
#!/bin/sh
cd "${0%/*}" || exit                                # Run from this directory
. ${WM_PROJECT_DIR:?}/bin/tools/RunFunctions        # Tutorial run functions
#------------------------------------------------------------------------------

runApplication blockMesh

# Select cellSets
runApplication -s 1 topoSet

runApplication subsetMesh box -patch hole -overwrite

# Select cellSets
runApplication -s 2 topoSet

restore0Dir

# Use cellSets to write zoneID
runApplication setFields

#------------------------------------------------------------------------------

```


### Allrun

```
#!/bin/sh
cd "${0%/*}" || exit                                # Run from this directory
. ${WM_PROJECT_DIR:?}/bin/tools/RunFunctions        # Tutorial run functions
#------------------------------------------------------------------------------

canCompile || exit 0    # Dynamic code

./Allrun.pre

# Serial
#runApplication $(getApplication)

# Parallel
runApplication decomposePar -cellDist

runParallel  $(getApplication)

#------------------------------------------------------------------------------
```


### overset在数值配置文件上需要额外设置的地方

例如，`fvSchemes`：

```
oversetInterpolation
{
    method         cellVolumeWeight;
}
//...
oversetInterpolationSuppressed
{
    grad(p_rgh);
    surfaceIntegrate(phiHbyA);
}

```

`fvSolution`

```
    cellDisplacement
    {
        solver          PCG;
        preconditioner  DIC;
        tolerance       1e-06;
        relTol          0;
        maxIter         100;
    }
```



# v2406-overset网格处理流程

该脚本展示了在 OpenFOAM 中构建重叠网格（Overset Mesh）的一种特定策略：**基于单块网格的区域分割法**。它不是生成两个独立网格再合并，而是生成一个网格，修剪它，然后通过 ID 区分不同区域。


## 流程步骤（blockMesh+topoSet+subsetMesh，工程上难以适用)

### 1. 生成基底 (`blockMesh`)

- **操作**: `runApplication blockMesh`
- **目的**: 创建一个覆盖全域的初始六面体网格块。

### 2. 定义几何形状 (`topoSet -s 1`)

- **操作**: 运行 `topoSet` 选择一组特定的网格单元（CellSet）。
- **目的**: 标记出计算域的实际几何范围（例如，标记出一个名为 `box` 的集合）。


注：可以用`foamToVTK -cellSet setName`（-cellSet选项仅在基金会版本中有），然后用paraview来读取VTK来看不同的set。.com版本，可以用命令`setsToZone`，把sets变为cellZone，在paraview中`read zone`然后再`extract blocks`。

### 3. 网格修剪与边界重命名 (`subsetMesh`)

- **操作**: `runApplication subsetMesh box -patch hole -overwrite`
- **目的**:
    - **保留**: 仅保留上一步选中的 `box` 集合内的网格，删除其余部分。
    - **补丁**: 将切割产生的裸露面（原内部面）命名为边界补丁 `hole`。
    - **意义**: 这一步确定了网格的最终拓扑结构。在重叠网格中，这个 `hole` 边界通常后续会被指定为 `overset` 边界类型。

### 4. 标记重叠区域 (`topoSet -s 2`)

- **操作**: 再次运行 `topoSet`。
- **目的**: 在修剪后的网格中，根据空间位置区分出不同的功能区域。例如，分别选中“背景区域”和“转子区域”，并将它们存为不同的 `cellSet`。

### 5. 初始化 ZoneID (`setFields`)

- **操作**: `runApplication setFields`
- **目的**: **核心步骤**。
    - 利用上一步生成的 `cellSet`，修改 `zoneID` 场（一个 `volScalarField`，实际存储整数）。
    - **Zone 0**: 通常设为背景网格。
    - **Zone 1, 2...**: 设为运动部件（转子）。
    - `overInterFoam` 求解器依赖此 ID 来识别哪些网格单元作为一个刚体整体进行运动。




## topoSet

在OpenFOAM-v2406中，`regionsToCell`依赖于controlDict中的：

```
libs            (overset fvMotionSolvers);
```

没有上述，将会：
```

--> FOAM FATAL IO ERROR: (openfoam-2406)
Unknown topoSetSource type regionsToCell

Valid topoSetSource types :

60
(
boundaryToCell
boundaryToFace
boxToCell
boxToFace
```


### topoSet example

```
/*--------------------------------*- C++ -*----------------------------------*\
| =========                 |                                                 |
| \\      /  F ield         | OpenFOAM: The Open Source CFD Toolbox           |
|  \\    /   O peration     | Version:  v2406                                 |
|   \\  /    A nd           | Website:  www.openfoam.com                      |
|    \\/     M anipulation  |                                                 |
\*---------------------------------------------------------------------------*/
FoamFile
{
    version     2.0;
    format      ascii;
    class       dictionary;
    object      topoSetDict;
}
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

actions
(
    {
        name    c0;
        type    cellSet;
        action  new;
        source  regionsToCell;
        insidePoints ((0.001 0.001 0.001));
    }

    {
        name    c1;
        type    cellSet;
        action  new;
        source  cellToCell;
        set     c0;
    }

    {
        name    c1;
        type    cellSet;
        action  invert;
    }

    {
        name    c2;
        type    cellSet;
        action  new;
        source  regionsToCell;
        insidePoints ((0.0116 0.00151 0.001));
        set     c1;
    }

    {
        name    c1;
        type    cellSet;
        action  subtract;
        source  cellToCell;
        set     c2;
    }

    // Select box to remove from region 1 and 2
    {
        name    box;
        type    cellSet;
        action  new;
        source  cellToCell;
        set     c1;
    }

    {
        name    box;
        type    cellSet;
        action  add;
        source  cellToCell;
        set     c2;
    }

    {
        name    box;
        type    cellSet;
        action  subset;
        source  boxToCell;
        boxes
        (
            (0.0025 0.0045 -100)(0.0075 0.0055 100)
            (0.0125 0.0025 -100)(0.0135 0.0075 100)
        );
    }

    {
        name    box;
        type    cellSet;
        action  invert;
    }
);


// ************************************************************************* //

```


## 核心逻辑总结

1. **画** (BlockMesh) -> **选** (TopoSet) -> **切** (SubsetMesh) -> **分** (TopoSet) -> **赋ID** (SetFields)。
2. 最终结果是一个包含多个不连续（或逻辑上分离）区域的网格文件，每个区域通过 `zoneID` 进行区分，准备好进行重叠网格计算。
这是一个 OpenFOAM 重叠网格（Overset Mesh）案例的完整工作流程整理。该流程通过分步生成子网格，最后在一个主背景网格中合并并计算。



## 总体流程概览（blockMesh,snappyHexMesh,mergeMesh,topoSet）


### 网格剖分结果

![](/images/overSetMesh/20251201_overset_hull_show_process.png)


整个模拟分为三个主要部分并行准备，最后统一汇总：

1. **生成部件 1 网格 (overset-1)**：通常是一个独立的运动物体（如船体 Hull）。
2. **生成部件 2 网格 (overset-2)**：通常是另一个独立的运动物体（如螺旋桨/旋转区域）。
3. **背景网格与求解 (background)**：生成背景流场，合并上述两个部件，进行重叠区域标记，最后并行计算。

---

### 子网格生成：Overset-1 (船体)

该步骤在 `overset-1` 文件夹下进行，目的是生成包含第一个物体的独立网格。

1. **准备几何文件**：
    - 创建 `constant/triSurface` 目录。
    - 拷贝几何文件 `HULL.obj.gz` 到该目录。
2. **生成基础网格**：
    - 运行 `blockMesh` 生成背景块。
3. **特征提取**：
    - 运行 `surfaceFeatureExtract` 提取几何的特征边（用于网格加密）。
4. **并行网格划分 (SnappyHexMesh)**：
    - `decomposePar`：将区域进行并行分解。
    - `snappyHexMesh -overwrite`：并行运行网格划分工具，生成贴体网格。
5. **网格重组与优化**：
    - `redistributePar -reconstruct -constant -overwrite`：将并行生成的网格合并回 `constant` 目录。
    - `renumberMesh -constant -overwrite`：优化网格编号以提高读取和计算效率。

---

### 子网格生成：Overset-2 (推进器/旋转部件)

该步骤在 `overset-2` 文件夹下进行，流程与 Overset-1 几乎完全一致，只是几何不同。

1. **准备几何文件**：
    - 创建 `constant/triSurface` 目录。
    - 拷贝几何文件 `BLADES.obj.gz`, `HUB.obj.gz`, `MRF_REGION.obj.gz`。
2. **生成基础网格**：
    - 运行 `blockMesh`。
3. **特征提取**：
    - 运行 `surfaceFeatureExtract`。
4. **并行网格划分**：
    - `decomposePar`：并行分解。
    - `snappyHexMesh -overwrite`：生成贴体网格。
5. **网格重组与优化**：
    - `redistributePar -reconstruct -constant -overwrite`：合并网格。
    - `renumberMesh -constant -overwrite`：优化网格。

---

### 背景网格准备 (Background Pre-processing)

该步骤在 `background` 文件夹下进行，目的是生成最外层的流场区域。

1. **生成背景基础网格**：
    - 运行 `blockMesh` 生成大的计算域。
2. **背景网格细化**（可选但常见）：
    - 运行 `snappyHexMesh -overwrite` 对背景关注区域进行加密（通常不包含具体几何，只是加密空间）。

---

### 网格合并与模拟运行 (Background Main Run)

这是最关键的步骤，将所有子网格整合并开始计算。

1. **初始化**：
    - `restore0Dir`：恢复初始场文件（0文件夹）。
2. **合并网格 (Merge Meshes)**：
    - `mergeMeshes . ../overset-1 -overwrite`：将 **overset-1** 的网格合并到当前背景网格中。
    - `mergeMeshes . ../overset-2 -overwrite`：将 **overset-2** 的网格合并到当前背景网格中。
    - _注：此时网格虽然在同一个算例里，但物理上还是重叠且互不连通的。_
3. **创建重叠边界 (Patch Creation)**：
    - `createPatch -overwrite`：根据字典配置，将特定的面（通常是 merged 进来的子网格的外边界）转换为 `overset` 类型的边界条件。
4. **区域标记与场设置 (Zone & Fields)**：
    - `topoSet` (第一次)：创建 cellSet，用于标记特定的区域（如初始液面位置或特定的重叠区域）。
    - `setFields`：根据 `topoSet` 的结果或其他几何，初始化流场数据（如 alpha.water 相分数，或初始速度场）。
    - `topoSet` (第二次, 可选)：使用 `topoSetDict.cHullProp`，可能用于标记船体或螺旋桨特定的计算域属性。
5. **并行计算**：
    - `decomposePar -force`：将合并后的巨大网格进行区域分解，准备并行。
    - `runParallel $(getApplication)`：运行主求解器（如 `overInterDyMFoam` 或 `overPimpleDyMFoam`）。求解器会在第一步自动进行 **Hole Cutting**（挖洞），确定哪些网格参与计算，哪些被屏蔽。
6. **结果重组**：
    - `redistributePar -reconstruct -overwrite`：计算完成后，将分散的并行结果合并回主文件夹以便后处理。

### 流程总结

{% mermaid %}


flowchart TB
    %% 定义样式
    classDef subMesh fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef bgMesh fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef merge fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef process fill:#f5f5f5,stroke:#333,stroke-width:1px;

    %% 总流程入口
    Start((Start)) --> Parallel_Gen

    %% 并行生成子网格部分
    subgraph Parallel_Gen [并行生成独立网格]
        direction LR
        
        %% Overset-1 分支
        subgraph Overset1 [Component 1 Hull]
            direction TB
            O1_Geo[拷贝几何 HULL.obj] --> O1_BM[blockMesh]
            O1_BM --> O1_SFE[surfaceFeatureExtract]
            O1_SFE --> O1_Decomp[decomposePar]
            O1_Decomp --> O1_SHM[snappyHexMesh]
            O1_SHM --> O1_Recon[redistributePar -reconstruct]
            O1_Recon --> O1_Renumber[renumberMesh]
        end
        
        %% Overset-2 分支
        subgraph Overset2 [Component 2 Propeller]
            direction TB
            O2_Geo[拷贝几何 BLADES/HUB.obj] --> O2_BM[blockMesh]
            O2_BM --> O2_SFE[surfaceFeatureExtract]
            O2_SFE --> O2_Decomp[decomposePar]
            O2_Decomp --> O2_SHM[snappyHexMesh]
            O2_SHM --> O2_Recon[redistributePar -reconstruct]
            O2_Recon --> O2_Renumber[renumberMesh]
        end

        %% Background 分支 (Pre)
        subgraph BackgroundPre [Background Mesh]
            direction TB
            BG_BM[blockMesh] --> BG_SHM[snappyHexMesh]
        end
    end

    %% 连接各部分到合并阶段
    O1_Renumber --> Merge_Process
    O2_Renumber --> Merge_Process
    BG_SHM --> Merge_Process

    %% 合并与求解设置
    subgraph Merge_Process [合并与装配 Background Dir]
        direction TB
        M1[mergeMeshes: 引入 Overset-1]:::merge
        M2[mergeMeshes: 引入 Overset-2]:::merge
        CP[createPatch: 定义 overset 边界]:::process
        TS1[topoSet: 标记流体区域]:::process
        SF[setFields: 初始化物理场]:::process
        TS2[topoSet: 标记部件属性]:::process
        
        M1 --> M2 --> CP --> TS1 --> SF --> TS2
    end

    %% 求解与后处理
    TS2 --> Final_Calc
    
    subgraph Final_Calc [求解]
        direction TB
        DecompFinal[decomposePar]:::process
        Solver[运行并行求解器<br>自动进行 Hole Cutting]:::merge
        ReconFinal[redistributePar -reconstruct]:::process
        
        DecompFinal --> Solver --> ReconFinal
    end

    ReconFinal --> End((End))

    %% 应用样式
    class Overset1,Overset2 subMesh;
    class BackgroundPre bgMesh;


{% endmermaid %}


