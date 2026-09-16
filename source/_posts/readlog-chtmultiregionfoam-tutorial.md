---
title: 教程阅读:chtMultiRegionFoam 4 区域实战
date: 2026-09-15 16:00:00
categories:
  - [阅读, 论文笔记]
tags:
  - 阅读/论文
  - blockMesh
  - 浸没边界法
  - 论文笔记
  - OpenFOAM
description: chtMultiRegionFoam 四区域教程的跟读笔记。
mathjax: true
---

## crash_course

整个`chtMultiRegionFoam`的流程
**[PDF 素材:TUT_chtmultiregionfoam4regiontutorial.pdf]**

案例的几何结构，（采用`blockMesh`生成）
**[PDF 素材:TUT_chtmultiregionfoam4regiontutorial.pdf]**



> [!PDF|yellow] TUT_chtmultiregionfoam4regiontutorial, p.7
> > To do so a subset of cells within the domain is selected to form a so-called cellSet.
> 
> 这里可以看到，`cellSet=Random selection of cells from domain`，`zone=coherent subset of cells which finally can be used to define a region`

图中的四个区域，用`topoSet`中的`setSet`来实现（具体名字可能有变，因为这个教程基于较老的OpenFOAM-2.0.0）

- 这个`setSet`工具在`v2306`中的解释
```shell
$FOAM_SOLVERS/heatTransfer/chtMultiRegionFoam > setSet -help-full

Usage: setSet [OPTIONS]
Options:
  -batch <file>     Process in batch mode, using input from specified file
  -case <dir>       Case directory (instead of current directory)
  -constant         Include the 'constant/' dir in the times list
  -debug-switch <name=val>
                    Set named DebugSwitch (default value: 1).
                    [Can be used multiple times]
  -decomposeParDict <file>
                    Alternative decomposePar dictionary file
  -fileHandler <handler>
                    Override the file handler type
  -hostRoots <((host1 dir1) .. (hostN dirN))>
                    Per-subprocess root directories for distributed running.
                    The host specification can be a regex.
  -info-switch <name=val>
                    Set named InfoSwitch (default value: 1).
                    [Can be used multiple times]
  -latestTime       Select the latest time
  -lib <name>       Additional library or library list to load.
                    [Can be used multiple times]
  -loop             Execute batch commands for all timesteps
  -mpi-threads      Request use of MPI threads
  -no-libs          Disable use of the controlDict 'libs' entry
  -noFunctionObjects
                    Do not execute function objects
  -noSync           Do not synchronise selection across coupled patches
  -noVTK            Do not write VTK files
  -noZero           Exclude the '0/' dir from the times list
  -opt-switch <name=val>
                    Set named OptimisationSwitch (default value: 1).
                    [Can be used multiple times]
  -parallel         Run in parallel
  -region <name>    Specify alternative mesh region
  -roots <(dir1 .. dirN)>
                    Subprocess root directories for distributed running
  -time <ranges>    List of ranges. Eg, ':10,20 40:70 1000:', 'none', etc
  -world <name>     Name of the local world for parallel communication
  -doc              Display documentation in browser
  -doc-source       Display source code in browser
  -help             Display short help and exit
  -help-man         Display full help (manpage format) and exit
  -help-notes       Display help notes (description) and exit
  -help-full        Display full help and exit

Manipulate a cell/face/point Set or Zone interactively.

Using: OpenFOAM-v2306 (2306) - visit www.openfoam.com
Build: _fbf00d6bf2-20230626
Arch:  LSB;label=32;scalar=64
```


多区域求解器需要一些额外的工具，且`reconstructPar`这些工具也需要加入一些额外的参数来满足多区域的要求。

1. 区别于常规的求解器，物性需要在不同的文件夹中设置。
2. 采用`changeDictionary`来设置不同区域的边界条件

一些特有的字典文件：
```
regionPropertie：Assign physical phase to each region, either fluid or solid


```

creating files for paraview post-processing:
```shell
paraFoam -touch -region $i
```
