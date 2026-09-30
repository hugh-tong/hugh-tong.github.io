---
title: 100 次训练数据分析报告
date: 2026-09-30 17:00:00
categories:
  - [工具, 数据分析]
tags:
  - 数据分析
  - 健身
  - ECharts
description: 2026 年前 9 个月共 100 次训练的交互式数据分析:训练日历、肌群平衡、强度分布、生理指标与 ACSM 科学评估,全部 ECharts 可视化。
---

从 2026-01-08 到 2026-09-30,266 天里累计训练 100 次。把这份数据整理成了一份完整的交互式分析报告,全部内嵌在下方,可以直接交互浏览(手机端同样适配):

<div class="training-report-embed">
  <iframe src="/report/training-analysis/" title="tttt个人运行100次数据分析报告" loading="lazy" allowfullscreen></iframe>
</div>

> 如果嵌入区域加载失败(如 RSS 阅读器环境),可直接打开独立页面:**[tttt个人运行100次数据分析报告](/report/training-analysis/)**

## 报告速览

| 指标 | 数值 |
|---|---|
| 训练次数 | 100 次 / 266 天 |
| 总组数 · 总次数 | 1,763 组 · 21,337 次 |
| 总容量 | 750,513 kg |
| 周均频率 | 2.63 次/周 |
| 训练一致性 | 89.7% |
| 综合评分 | 70.0 分(B) |

## 报告里有什么

- **概览与科学评估**:按 ACSM 2026 抗阻训练指南与 Schoenfeld 训练量研究逐项打分
- **训练日历**:266 天的打卡热力图
- **周/月趋势**:训练量的周期性波动
- **肌群平衡**:推/拉、上/下肢的容量配比
- **强度与超负荷**:重量区间分布、各动作的渐进超负荷轨迹
- **生理数据**:静息心率、体重、体脂变化
- **动作排行 & e1RM**:估算的一次最大重量排行

## 技术说明

报告是一个自包含的静态页(ECharts 5 渲染全部图表,无后端),以 iframe 方式嵌入本文;独立版部署在博客的 `/report/` 命名空间下。页面按视口宽度自动适配:桌面宽屏多列布局,手机端自动切换单列、压缩字号与图表高度。原始数据由训练记录导出,分析口径在报告内"公式来源"一节全部列明。

数据是自己的,报告是给同样在坚持训练的人一个参考——坚持记录,数据会说话。

<style>
.training-report-embed {
  position: relative;
  width: 100%;
  height: 88vh;
  min-height: 560px;
  border: 1px solid var(--card-border, #dbe4ef);
  border-radius: 12px;
  overflow: hidden;
  background: #0f172a;
}
.training-report-embed iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
@media (max-width: 640px) {
  .training-report-embed { height: 70vh; min-height: 480px; border-radius: 8px; }
}
</style>
