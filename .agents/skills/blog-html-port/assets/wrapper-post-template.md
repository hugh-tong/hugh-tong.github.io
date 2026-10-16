---
title: <页面标题（从原 HTML <title>/<h1> 提炼）>
date: <YYYY-MM-DD HH:MM:00 固定日期>
categories:
  - <按现有分类树选，如 [CFD, 理论, 传热传质] / [工具, 数据分析] / [CFD, OpenFOAM, 求解器]>
tags:
  - <路径式主标签，如 CFD/理论/传热传质>
  - <其余具体标签 3~6 个>
description: <一句话：页面是什么 + 内嵌于本文，60 字内>
mathjax: true   <!-- 仅当正文含公式时保留；纯叙述可删 -->
---

<2~3 段导语：这个页面解决什么问题、内容主线是什么、为什么值得读。结尾说明"全部内嵌在下方，可以直接交互（手机端同样适配）"。>

<div class="<namespace>-embed <slug>-embed">
  <iframe src="/<namespace>/<slug>/" title="<页面标题>" loading="lazy" allowfullscreen></iframe>
</div>

> 如果嵌入区域加载失败（如 RSS 阅读器环境），可直接打开独立页面：**[<页面标题>](/<namespace>/<slug>/)**

## <速览 | 报告速览 | 教程速览>

| <章节/核验项> | <内容/结论> |
|---|---|
| <从原页面 <h2>/<h3> 提取，读原文不要凭空编> | ... |

## 技术说明

<1 段：自包含性（预渲染公式/内联 SVG/无外部依赖、离线可读）、iframe 嵌入方式、部署命名空间及定位、（如有）数据或结论的来源口径。>

<style>
.<namespace>-embed {
  position: relative;
  width: 100%;
  height: 88vh;
  min-height: 560px;
  border: 1px solid var(--card-border, #dbe4ef);
  border-radius: 12px;
  overflow: hidden;
  background: #f6f8fb;   <!-- 与嵌入页背景一致，避免加载闪白 -->
}
.<namespace>-embed iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
@media (max-width: 640px) {
  .<namespace>-embed { height: 70vh; min-height: 480px; border-radius: 8px; }
}
</style>
