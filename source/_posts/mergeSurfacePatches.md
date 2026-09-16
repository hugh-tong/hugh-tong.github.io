---
title: mergeSurfacePatches 用法
date: 2026-09-15 12:00:00
categories:
  - [CFD, OpenFOAM, 网格]
tags:
  - CFD/OpenFOAM/网格
  - FreeCAD
  - 网格
  - OpenFOAM
  - cfMesh
description: 将多个 surface patch 合并为单一 patch 的工具用法与应用场景。
mathjax: true
---
> "The utility allow the user to specify the patches in the surface mesh which shall be merge together."

[OpenFOAM v2406 utility reference: mergeSurfacePatches](https://www.openfoam.com/documentation/guides/v2406/man/mergeSurfacePatches.html) —— 选项和覆盖/输出行为以对应发行版手册为准


```shell
cd "$CASE_DIR"
mergeSurfacePatches -help

Usage: mergeSurfacePatches [OPTIONS] <input surface file> <new patch>
Options:
  -case <dir>       Case directory (instead of current directory)
  -keep
  -output <file name (default overwrite)>
  -patchIdRange <(start end)>
  -patchIds <list of patchIds>
  -patchNames <list of names>
  -doc              Display documentation in browser
  -help             Display short help and exit
  -help-full        Display full help and exit

(cfmesh)
Merge the supplied list of patches onto a single patch.

Using: OpenFOAM-v2406 (2406) - visit www.openfoam.com
Build: _630d60de3b-20240620
Arch:  LSB;label=32;scalar=64

```
