---
title: 边界条件如何进入 OpenFOAM 矩阵组装
date: 2026-09-15 12:00:00
categories:
  - [CFD, OpenFOAM, 边界条件]
tags:
  - CFD/OpenFOAM/边界条件
  - 边界条件
  - 边界条件对
  - 求解过程的影响
  - OpenFOAM
  - OF
description: 从有限体积离散看边界条件对矩阵系数与源项的贡献方式。
mathjax: true
---
前言：本篇探究边界条件在`OpenFOAM`求解中的影响。



可以发现，边界条件影响求解过程的地方较多。边界条件通过影响矩阵系数值来影响求解的结果。

![别人梳理的流程](https://pic3.zhimg.com/v2-906fc0a18ed156f52c5f40958b068f86_r.jpg)