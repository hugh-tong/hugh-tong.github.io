---
title: createPatch 用法详解
date: 2026-09-15 15:00:00
categories:
  - [CFD, OpenFOAM, 工具]
tags:
  - CFD/OpenFOAM/工具
  - 工具
  - Cpp
  - OpenFOAM
  - RANS
description: createPatch 从 faceSet/createPatchDict 生成新 patch 的用法与注意事项。
mathjax: true
---

`createPatch` 是 OpenFOAM 中的一个实用工具，用于**将某些 patch（边界面）合并、细分或修改**，常见于切割网格、把周期性边界/内部面分开形成新边界等场景。常配合 `createPatchDict` 配置文件使用。

---

## 使用流程

### 1. 制作或编辑系统字典文件

在你的算例目录下（如 `case/system`）创建或编辑 `createPatchDict`：

路径：  
```
system/createPatchDict
```

**常见结构和参数说明**：

```foam
patches
(
    {
        name newPatchName;     // 要生成的新 patch 名
        patchInfo
        {
            type patch;        // 新 patch 类型（如 patch，wall，cyclic，symmetryPlane 等）
        }yon
        constructFrom patches; // 来源，可以是patches或set
        patches (origPatch1 origPatch2); // 被合并/拆分的原始 patch 列表
    }
);

set
(
    // 如果 constructFrom 设为 set，要写这里的 set 名
);

// 其它全局控制选项:
pointSync false; // 是否需要点同步（通常默认 false 即可）
```

20250707，一个真实的例子：

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
    object      createPatchDict;
}
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

// Do a synchronisation of coupled points after creation of any patches.
// Note: this does not work with points that are on multiple coupled patches
//       with transformations (i.e. cyclics).
pointSync false;

__settings
{
    patchInfo { type patch; }
    constructFrom set;
}

// Patches to create.
patches
(
    {
        name            vaporInlet;
        ${__settings};
        set  inletFaceSet;
    }

    {
        name            outlet;
        ${__settings};
        set  outletFaceSet;
    }

);


// ************************************************************************* //
```


**简单示例：合并两个 patch 为一个新 patch**
```foam
patches
(
    {
        name    combinedWall;
        patchInfo
        {
            type wall;
        }
        constructFrom patches;
        patches (wall1 wall2);
    }
);
```

**示例2：将内部面（如用于周期性或 AMI）抽成 patch**
```foam
patches
(
    {
        name    periodicPatch;
        patchInfo
        {
            type patch;
        }
        constructFrom patches;
        patches (defaultFaces);
    }
);
```

---

### 2. 执行 createPatch 工具

在 case 根目录下运行：
```bash
createPatch -overwrite
```
- `-overwrite`：直接覆盖旧的 polyMesh/boundary 文件
- 不加参数会生成 `polyMesh/boundary.new`，需要手动替换

---

### 3. 检查效果

运行后，网格的 `constant/polyMesh/boundary` 文件中的 Patch section 会更新。  
可用 `checkMesh` 检查网格，或用 paraFoam/其它查看边界。

---

## 应用场景

- 合并若干 patch 成一个新 patch
- 拆分 patch、给定 patch 赋予新类型
- 将内部面（cutFace、defaultFaces等）变成外部 patch 作周期性或 AMI 边界
- 删改分区网格的冗余 patch

---

## 常见问题和技巧

- patch 类型要和后续物理边界条件对应（如 `wall`、`patch`、`inlet`、`cyclic` 等）。
- 如果只需要重命名 patch，可以直接在 boundary 文件和 0 文件的 U、p等里同步修改名即可，createPatch 用于更复杂场景。
- `constructFrom` 也可以用 set，通过 `faceSet`等提前选择。

---

## 更多官方参考

- [OpenFOAM 官方说明（英文）](https://www.openfoam.com/documentation/guides/latest/doc/command-createpatch.html)
- [其他案例参考](https://openfoamwiki.net/index.php/CreatePatch)

