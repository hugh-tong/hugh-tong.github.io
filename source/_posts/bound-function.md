---
title: OpenFOAM bound 函数(占位)
date: 2026-09-15 15:10:00
categories:
  - [CFD, 数值方法]
tags:
  - CFD/数值方法
  - 占位待充实
description: bound 函数实现的讨论线索(有奇怪操作),正文待充实。
mathjax: true
---

OpenFOAM 的 `bound` 函数用于把场限制在物理下界(如 k、ε > 0)。

## 资料索引

- [bound 函数的实现方法 - CFD-China](https://www.cfd-china.com/topic/6766/) —— 回复中提到 bound 有一些奇怪的操作

## 待补充

- [ ] 源码走读(bound 与 boundCheck)
- [ ] 与 MULES/多相限幅器的关系