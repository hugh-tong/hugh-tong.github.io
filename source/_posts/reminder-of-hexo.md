---
title: Hexo 备忘录
categories: 
  - 工具
  - Hexo
description: 测试、回顾和使用 Hexo 的命令备忘。
date: 2024-05-26 12:13:29
updated: 2026-09-16 18:00:00
tags: 
  - tttt
  - Tools
---
当前仓库使用 Hexo 8、npm 锁文件和 GitHub Actions artifact 发布。下面的命令都应在 `dev_tttt` 分支和仓库根目录执行。

## 首次恢复环境

```bash
nvm install
nvm use
npm ci
npm run verify
```

## 写作和预览

```bash
npx hexo new "文章标题"
npm run server:butterfly
# 或预览 NexT
npm run server:next
```

文章位于 `source/_posts/`。改配置或主题后先清理，再验证：

```bash
npm run clean
npm run verify
```

## 发布

本站不再运行 `hexo deploy`，也不向 `main` 推送生成文件。提交并推送 `dev_tttt`，等待 `Validate blog` 通过，然后在 GitHub Actions 页面手动运行 `Deploy GitHub Pages`。

详细环境约束、回滚和发布后检查以仓库根目录的 `DEPLOYMENT.md` 为准。Hexo 命令参考：[Hexo Commands](https://hexo.io/docs/commands.html)。
