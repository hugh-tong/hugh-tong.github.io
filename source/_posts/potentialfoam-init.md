---
title: potentialFoam 势流初始化(占位)
date: 2026-09-15 14:00:00
categories:
  - [CFD, OpenFOAM, 求解器]
tags:
  - CFD/OpenFOAM/求解器
  - 求解器
  - 占位待充实
description: potentialFoam 求解器与势流初始化的资料索引,正文待充实。
mathjax: true
---

potentialFoam 是 OpenFOAM 的势流求解器,常用来为其他求解器提供初始流场。本篇目前是资料占位页,正文待后续用 AI 工具充实。

## 资料索引

- [CFD: 势流算法 — OpenFOAM|CFD(dyfluid)](http://www.dyfluid.com/potentialFoam.html) —— 势流算法原理与 OpenFOAM 实现
- [用 potentialFoam 初始化流场 - 知乎](https://zhuanlan.zhihu.com/p/26498724) —— 势流方程与 potentialFoam 应用

## 一句话结论(来自资料,待展开)

> 可见,potentialFoam 和 simpleFoam 的求解结果大相径庭,对于这种流动,potentialFoam 严重失真。实际上,用 potentialFoam 提供初始流场后,simpleFoam 的迭代次数也未减少,甚至增加少许。因而,如果不是遇到难以收敛的情况,没必要使用 potentialFoam 初始化。

## 待补充

- [ ] 势流方程推导与适用条件
- [ ] potentialFoam 与 simpleFoam 初始化效果对比算例
