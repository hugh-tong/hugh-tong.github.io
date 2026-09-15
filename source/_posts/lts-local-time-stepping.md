---
title: LTS 局部时间步进(占位)
date: 2026-09-15 14:00:00
categories:
  - [CFD, OpenFOAM, 求解器]
tags:
  - CFD/OpenFOAM/求解器
  - 求解器
  - 占位待充实
description: Local Time Stepping 在 OpenFOAM 中的使用约束与 chtMultiRegionFoamLTS 资料索引,正文待充实。
mathjax: true
---

LTS(Local Time Stepping)让不同网格区域用不同时间步推进,可大幅加速显式/瞬态计算。本篇目前是资料占位页,正文待后续用 AI 工具充实。

## 关键约束(摘自 OpenFOAM 文档)

> 1. LTS is based on a one fluid region (region 0). Therefore, if there are multiple fluid regions, LTS time steps will be chosen based on the characteristic times of the fluid assigned to region 0. Therefore, in a multiple fluid region application where LTS will be used, one may wish to assign the most "time step sensitive" fluid region to fluid region 0.
> 2. The OpenFOAM-6 solver does not include a steady state solver (similar to the chtMultiRegionFoam solver in OpenFOAM-6).
> 3. The OpenFOAM-8 branch also includes chtMultiRegionFoamLTS, which is chtMultiRegionFoam for OpenFOAM-8 with the ability to use LTS.

## 资料索引

- [TonkomoLLC/multiRegionReactingFoam](https://github.com/TonkomoLLC/multiRegionReactingFoam) —— 含 LTS 说明的多区域求解器实现

## 待补充

- [ ] LTS 与全局时间步的收敛性差异
- [ ] ddtSchemes 里 `SLTS` 格式配置示例
