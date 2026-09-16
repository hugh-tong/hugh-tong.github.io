---
title: 博客维护恢复记录：从旧手工流程到可复现发布
date: 2026-09-13 10:57:53
updated: 2026-09-16 18:00:00
categories:
  - 工具
  - Hexo
tags:
  - tttt
  - Tools
description: 回顾博客恢复维护时发现的主题、依赖和发布问题，以及它们如何被 npm 锁文件、自动验证和 GitHub Pages artifact 部署解决。
---

时隔两年重新维护博客时，仓库仍停留在 Hexo 6、手工补主题和本机部署的状态。这篇保留问题发现过程，并记录后续解决结果；当前操作命令以仓库 `DEPLOYMENT.md` 为准。

## 当时发现的问题

### 1. 三个分支职责混乱

源码位于 `dev_tttt`，`main` 和 `master` 是不同时期的静态生成结果。旧流程依靠本机部署插件改写 `main`，默认分支又曾指向 `master`，很容易在错误分支白做工作。

**现状：** 默认分支已经改为 `dev_tttt`，GitHub Pages Source 改为 GitHub Actions。两个生成分支只保留历史，不再参与发布。

### 2. NexT 是缺少 `.gitmodules` 的裸 gitlink

新克隆无法自动恢复主题，而且原 commit 已从上游消失。这使构建依赖一个未记录的手工步骤。

**现状：** Butterfly 和 NexT 都由 npm 安装，并由 `package-lock.json` 锁定；不再手工克隆主题。

### 3. Markdown 渲染依赖系统 Pandoc

旧的 `hexo-renderer-pandoc` 让不同机器的构建结果依赖系统包。

**现状：** 已改用 `hexo-renderer-marked`，不需要安装 Pandoc。

### 4. 站点 URL 和维护规则没有自动检查

站点 URL 曾保留默认示例值，文章元数据、站内链接和两套主题也没有流水线验证。

**现状：** URL 已修正，`npm run verify` 会检查源码并分别构建 Butterfly 与 NexT；push/PR 到 `dev_tttt` 时运行同样的 CI。

## 当前恢复与验证流程

```bash
git checkout dev_tttt
nvm install
nvm use
npm ci
npm run verify
```

本地预览：

```bash
npm run server:butterfly
# 或
npm run server:next
```

## 当前发布流程

提交并推送 `dev_tttt`，等待 `Validate blog` 通过，然后在 GitHub Actions 中手动运行 `Deploy GitHub Pages`。workflow 生成并上传 Pages artifact，不再使用本机部署插件，也不修改 `main`。

## 这次恢复留下的原则

- 源码、依赖锁定和发布配置必须在同一条可审计链路中；
- 新机器恢复只能依赖仓库中已经记录的步骤；
- 两套主题都应进入自动构建，而不是等切换时才发现损坏；
- 历史实录可以保留，但必须清楚标出当前入口，不能继续充当操作手册。

