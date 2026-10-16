---
title: CFD 能量方程交互教程：从焓方程到温度输运
date: 2026-10-16 18:30:00
categories:
  - [CFD, 理论, 传热传质]
tags:
  - CFD/理论/传热传质
  - 能量方程
  - 传热
  - OpenFOAM
  - 交互教程
description: 从复杂焓方程逐级简化到不可压缩温度输运，再反向拓展到可压缩、共轭传热与相变的交互式教程，含一维导热/对流/残差守恒数值实验与 OpenFOAM 有限体积实现，完整教程内嵌于本文。
mathjax: true
---

能量方程是 CFD 里最容易被"抄公式"绕晕的一章：守恒的是能量而不是温度，焓方程里压缩功、粘性耗散、压力做功各项何时能删、为什么能删，往往死记硬背。这篇交互教程把这条链路完整走了一遍——先从最一般的焓方程**逐级简化**到纯导热和不可压温度输运，再**反向加难**，每次只引入一种物理机制，配合可以直接拖动的数值实验，最后落到 OpenFOAM 的有限体积代码。教程是一个自包含的单页应用，全部内嵌在下方（手机端同样适配）：

<div class="tutorial-embed cfd-energy-embed">
  <iframe src="/tutorial/cfd-energy-equation/" title="CFD 能量方程：从焓到温度，从简单到复杂" loading="lazy" allowfullscreen></iframe>
</div>

> 如果嵌入区域加载失败（如 RSS 阅读器环境），可直接打开独立页面：**[CFD 能量方程交互教程](/tutorial/cfd-energy-equation/)**

## 教程速览

| 章节 | 内容 |
|---|---|
| 先明确对象 | 能量守恒的不是温度——为什么守恒变量是焓/内能 |
| 逐级简化 | 从复杂焓方程一步步走向纯导热，每一步删什么、凭什么 |
| 机制拆解 | 压缩功、粘性耗散、对流输运、扩散输运各自独立理解 |
| 差在哪 | 能量方程 vs 不可压温度输运方程的逐项对照 |
| 交互实验 ① | 一维平板导热：边界条件与温度分布的线性关系 |
| 交互实验 ② | 加入流动后温度分布为何不再线性（Péclet 效应） |
| 反向加难 | 从最简方程每次只加一种机制，重建完整方程 |
| 落到代码 | 从 PDE 到 OpenFOAM 有限体积实现 |
| 交互实验 ③ | 残差收敛 ≠ 能量守恒——一个容易踩的验证坑 |
| 更复杂的物理 | 共轭传热（CHT）、蒸发与冷凝进入方程后 |
| 自测 | 三个问题检查是否真正理解 |

## 技术说明

教程是一个自包含的静态页（公式为预渲染 MathJax、图为内联 SVG、交互为原生 JS，无任何外部依赖，离线可读），以 iframe 方式嵌入本文；独立版部署在博客的 `/tutorial/` 命名空间下——这是给交互式教程专设的命名空间，与参数计算类的 `/tools/` 和分析报告类的 `/report/` 区分。

<style>
.tutorial-embed {
  position: relative;
  width: 100%;
  height: 88vh;
  min-height: 560px;
  border: 1px solid var(--card-border, #dbe4ef);
  border-radius: 12px;
  overflow: hidden;
  background: #f6f8fb;
}
.tutorial-embed iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
@media (max-width: 640px) {
  .tutorial-embed { height: 70vh; min-height: 480px; border-radius: 8px; }
}
</style>
