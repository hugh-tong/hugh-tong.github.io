---
title: 历史实录：MacBook 博客环境恢复测试
date: 2026-09-15 11:30:00
updated: 2026-09-16 18:00:00
tags:
  - hexo
  - Deploy
categories:
  - [工具, 博客维护]
description: 记录一次 macOS 环境恢复测试，并说明该实录与当前 Hexo 8、npm 主题和 GitHub Actions 发布流程的差异。
---

> 历史说明：这次实测发生在仓库升级前。原流程中的 Hexo 6.3.0、NexT 裸 gitlink 和本机分支部署都已废止。当前可执行步骤见仓库 `DEPLOYMENT.md` 和文章《博客新机恢复实录》。

## 当时验证了什么

这次测试确认了 Intel Mac 上可以完成依赖安装、两套主题构建和本地 HTTP 预览，也暴露了三个维护问题：

1. 主题来源不统一，NexT 需要额外手工克隆。
2. Linux 专用的后台命令不能直接照搬到 macOS。
3. 本地部署命令同时承担构建和改写发布分支，难以审计和回滚。

这些问题随后已经在仓库层面解决：两个主题统一由 npm 和锁文件管理，构建由 `npm run verify` 验证，发布改为 GitHub Actions artifact。

## 当前 macOS 恢复命令

```bash
git clone git@github.com:hugh-tong/hugh-tong.github.io.git
cd hugh-tong.github.io
git checkout dev_tttt
nvm install
nvm use
npm ci
npm run verify
```

本地预览使用：

```bash
npm run server:butterfly
```

发布时先推送 `dev_tttt`，等待 CI 通过，再从 GitHub Actions 手动触发 `Deploy GitHub Pages`。不需要在 Mac 上运行 `hexo deploy`，也不需要准备用于推送生成分支的 SSH 凭据。

## 保留这篇历史记录的原因

这篇文章不再充当操作手册，只记录“从手工部署迁移到可复现流水线”的过程。以后环境再次变化时，应更新当前手册，而不是继续在历史实录上叠加新命令。
