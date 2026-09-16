---
title: 边界条件如何进入 OpenFOAM 矩阵组装
date: 2026-09-15 12:00:00
updated: 2026-09-16 18:00:00
categories:
  - [CFD, OpenFOAM, 边界条件]
tags:
  - CFD/OpenFOAM/边界条件
  - 边界条件
  - OpenFOAM
description: 从有限体积离散解释边界条件如何修改矩阵对角项、非对角项和源项；正文推导尚未完成。
published: false
mathjax: true
---

> 状态：草稿。原页面只有两句结论和一张来源、许可均不清晰的知乎热链图片，无法支撑标题，现已停止公开并移除图片。

正式发布前需要完成：

- [ ] 从一维扩散方程推导 Dirichlet、Neumann 和 mixed 条件对离散矩阵的贡献；
- [ ] 对照 `fvPatchField`、`valueInternalCoeffs()` 和 `valueBoundaryCoeffs()` 的固定版本源码；
- [ ] 用一个最小网格打印 `fvMatrix`，核对对角项、非对角项和源项；
- [ ] 区分显式边界贡献、隐式系数和 coupled patch；
- [ ] 使用自制示意图，并标明 OpenFOAM 发行版、commit 和验证日期。
