---
title: renumberMesh 与 Cuthill–McKee 重编号(占位)
date: 2026-09-15 14:00:00
categories:
  - [CFD, OpenFOAM, 求解器]
tags:
  - CFD/OpenFOAM/求解器
  - 求解器
  - 占位待充实
description: renumberMesh 降低矩阵带宽的原理(Cuthill–McKee 算法)与并行效率资料索引,正文待充实。
mathjax: true
---

renumberMesh 用于对网格重新编号以降低系数矩阵带宽、提升求解效率。本篇目前是资料占位页,正文待后续用 AI 工具充实。

## 资料索引

- [Cuthill–McKee algorithm - Wikipedia](https://en.wikipedia.org/wiki/Cuthill%E2%80%93McKee_algorithm) —— 重新编号降带宽的经典算法
- [并行效率疑问 - CFD-China](https://www.cfd-china.com/topic/757/%E5%B9%B6%E8%A1%8C%E6%95%88%E7%8E%87%E7%96%91%E9%97%AE/18) —— renumberMesh 对并行效率影响的讨论
- [OpenFOAM Foundation v13: renumberMesh source](https://cpp.openfoam.org/v13/renumberMesh_8C_source.html) —— 官方源码注释与命令实现
- [renumberMesh(1) manual](https://manpages.debian.org/testing/openfoam/renumberMesh.1.en.html) —— 选项与命令行行为速查

## 待补充

- [ ] 矩阵带宽与重编号的直觉解释
- [ ] renumberMesh 前后 bandwidth/矩阵对角带宽对比实例
