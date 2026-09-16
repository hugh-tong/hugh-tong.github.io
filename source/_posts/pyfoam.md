---
title: PyFoam 工具集(占位)
date: 2026-09-15 15:10:00
published: false
categories:
  - [CFD, OpenFOAM, 工具链]
tags:
  - CFD/OpenFOAM/工具链
  - 占位待充实
description: PyFoam 的安装与命令行工具集资料索引,正文待充实。
mathjax: true
---

PyFoam 是 OpenFOAM 的 Python 工具集(采样绘图、case 构建、并行管理等)。

## 资料索引

- [Contrib/PyFoam - OpenFOAMWiki](https://openfoamwiki.net/index.php/Contrib/PyFoam)

## 安装记录(2025)

`python setup.py install` 后大量 `pyFoam*.py` 脚本装入 `/usr/local/bin`(pyFoamSamplePlot、pyFoamCaseBuilder、pyFoamClusterTester 等)。

## 待补充

- [ ] 常用子命令速查(plotRunner/prepareCase 等)
- [ ] 与 OpenFOAM 原生 postProcess -func 的分工
