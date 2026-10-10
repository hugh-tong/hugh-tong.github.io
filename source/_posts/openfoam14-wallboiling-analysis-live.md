---
title: OpenFOAM-14 wallBoiling 源码核验报告
date: 2026-10-10 17:30:00
categories:
  - [CFD, OpenFOAM, 求解器]
tags:
  - CFD/OpenFOAM/求解器
  - wallBoiling
  - 多相流
  - 沸腾传热
  - CHT
  - 源码阅读
description: 基于 OpenFOAM-14 C++ 源码逐项核验 multiRegion/CHT/wallBoiling：RPI 热流分解的 A₁/A₂/A₂E、壁面温度二分迭代、两类相变的质量源项与跨区域耦合，完整交互式报告内嵌于本文。
mathjax: true
---

`multiRegion/CHT/wallBoiling` 是 OpenFOAM 教程里少有的"一个案例串起四个模型"的算例：固体导热（CHT）、Euler–Euler 两流体、壁面核态沸腾（RPI）、流体内部气液相变。把它的 C++ 源码逐行核验了一遍，整理成一份完整的单页报告，全部内嵌在下方，可以直接阅读和交互（手机端同样适配）：

<div class="report-embed wallboiling-report">
  <iframe src="/report/openfoam14-wallboiling/" title="OpenFOAM-14 wallBoiling 源码核验报告" loading="lazy" allowfullscreen></iframe>
</div>

> 如果嵌入区域加载失败（如 RSS 阅读器环境），可直接打开独立页面：**[OpenFOAM-14 wallBoiling 源码核验报告](/report/openfoam14-wallboiling/)**

## 报告速览

| 核验项 | 结论 |
|---|---|
| 研究对象 | DEBORA 算例：R12 竖直管亚冷流动沸腾，2.62 MPa、3.5 m 加热段 |
| 热流输入方式 | 固体外壁给热流（66,919.2 W/m²，按内外壁面积换算），**不是**液体壁面直接给 |
| RPI 分解 | 源码实际用 A₁（对流）、A₂（淬冷）、A₂E（蒸发）面积系数，存在截断与归一 |
| 壁面温度 | 不是随手代入——用二分法迭代闭合壁面热流平衡 |
| 两类相变 | `wallBoiling` 壁面成汽 ≠ `heatTransferLimitedPhaseChange` 体积相变，质量源项各自独立 |
| 跨区域耦合 | 湍流热扩散率边界条件回写热流，流体侧双温度场（T.liquid / T.gas） |

## 报告里有什么

- **00 一页读懂**：先说结论——源码并不是简单的"三项热流相加"，实现里有面积系数截断、体积化质量源项与壁温迭代；
- **01 物理结构**：DEBORA 几何（9.6 mm 内径 + 1 mm 壁厚 wedge 网格）、参数表、外壁热流的面积换算解释；
- **02 求解架构**：双区域、双相、两套相变模型的实际数据依赖关系图；
- **03 RPI 源码公式**：逐项核验 A₁/A₂/A₂E 的推导与源码对应，含交互式公式；
- **04 壁面温度迭代**：二分法如何闭合壁面热流；
- **05–06 相间相变与闭式关系**：气泡直径/频率闭式曲线的交互绘制，不用跑 CFD 也能检查趋势；
- **07–10**：常见"公式看着对、源码对不上"的简化误区、v14 历史演化（含相关 commit）、复现检查清单与源码索引。

## 技术说明

报告是一个自包含的静态页（内置 SVG 图与轻量交互脚本，无外部依赖，离线可读），以 iframe 方式嵌入本文；独立版部署在博客的 `/report/` 命名空间下。全部公式与结论按 OpenFOAM-14 源码逐项核对，源码链接直达 GitHub 对应文件与 commit。

<style>
.report-embed {
  position: relative;
  width: 100%;
  height: 88vh;
  min-height: 560px;
  border: 1px solid var(--card-border, #dbe4ef);
  border-radius: 12px;
  overflow: hidden;
  background: #f6f8fb;
}
.report-embed iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
@media (max-width: 640px) {
  .report-embed { height: 70vh; min-height: 480px; border-radius: 8px; }
}
</style>
