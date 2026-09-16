---
title: 博客新机恢复实录：从克隆到 GitHub Pages 发布
date: 2026-09-15 11:15:18
updated: 2026-09-16 18:00:00
categories:
  - 工具
  - Hexo
tags:
  - tttt
  - Tools
  - Deploy
description: 按当前 Hexo 8、npm 双主题和 GitHub Actions artifact 流程，在新机器恢复博客写作、验证与发布环境。
---

> 本文已按 2026-09-16 的仓库状态更新。当前发布不使用 `hexo deploy`，也不向 `main` 推送生成文件。

## 当前架构

| 项 | 当前约束 |
|---|---|
| 源码分支 | `dev_tttt` |
| Node.js | `>=20.19.0 <23`，以 `.nvmrc` 为准 |
| Hexo | 8.1.2 |
| 包管理 | npm，使用 `package-lock.json` |
| 主题 | Butterfly 5.7.0、NexT 8.29.0，均由 npm 安装 |
| 发布 | GitHub Actions artifact → GitHub Pages |

`main` 和 `master` 只保留历史静态产物，不再是发布目标。

## 从零恢复

```bash
git clone git@github.com:hugh-tong/hugh-tong.github.io.git
cd hugh-tong.github.io
git checkout dev_tttt
nvm install
nvm use
npm ci
```

这里使用 `npm ci`，让依赖严格按照锁文件恢复。NexT 已经是普通 npm 依赖，不需要再手工克隆 `themes/next`。

## 验证两套主题

```bash
npm run verify
```

该命令会检查文章元数据和本地链接，随后分别 clean build Butterfly 与 NexT，并检查生成站点的关键路由和站内资源。

如需交互预览：

```bash
npm run server:butterfly
# 或
npm run server:next
```

浏览器中至少抽查首页、文章页、分类、标签、搜索、公式、代码块和移动端布局。

## 保存源码

```bash
git status --short
git add -- source/_posts/新文章.md
git commit -m "Add post: 新文章"
git push origin dev_tttt
```

提交前只暂存本次修改的路径，不使用 `git add .` 把无关文件一起带入。

## 发布上线

1. 等待 GitHub Actions 中的 `Validate blog` 通过。
2. 打开 Actions → `Deploy GitHub Pages`。
3. 选择 `dev_tttt`，点击 `Run workflow`。
4. 等待 build 和 deploy 两个 job 成功。
5. 检查首页、404、sitemap、feed 和本次修改的文章 URL。

发布 workflow 生成 `public/` 并上传 Pages artifact，不会提交生成 HTML，也不会改写任何分支。

## 回滚

错误发布从源码历史回滚：

```bash
git revert <bad-commit>
git push origin dev_tttt
```

等待验证通过后重新触发 Pages workflow。不要直接修改线上生成文件。

## 信息源

仓库根目录 `DEPLOYMENT.md` 是当前操作手册；`package.json` 和 `.github/workflows/` 是版本与自动化行为的最终依据。本文只提供叙事版速查。
