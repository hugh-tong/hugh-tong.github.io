---
title: 博客维护恢复记录
date: 2026-09-13 10:57:53
categories:
  - 工具
  - Hexo
tags:
  - tttt
  - Tools
---

时隔两年(上一篇还是 2024-05-26 的 Hexo 备忘录),重新把博客的维护捡起来了。这篇记录一下恢复过程中踩的坑,方便下次(希望不要隔两年)继续。

## 现状确认

- 博客是 Hexo 6.3.0 + NexT 主题,托管在 GitHub Pages(`hugh-tong.github.io`)
- 仓库有三个分支,职责完全不同:
  - `dev_tttt`:源码分支,所有文章和配置都在这里
  - `main`:`hexo d` 的部署目标,纯生成产物
  - `master`:2023 年的旧部署残留,已忽略

## 恢复过程踩的坑

### 1. 主题是裸 gitlink,克隆后目录是空的

`themes/next` 在仓库里只是一个指向 commit 的引用,没有 `.gitmodules`。切到 `dev_tttt` 后 `hexo g` 直接报错。解决:

```bash
git clone https://github.com/next-theme/hexo-theme-next.git themes/next
```

### 2. 原锁定的主题 commit 已从上游消失

gitlink 指向的 `9c8cea6` 在 next-theme 仓库的任何分支/tag 上都找不到了(force-push 所致),codeload 归档也 404。改用发布日期最接近原锁定日期(2024-05-26)的正式版 `v8.20.0`(2024-05-01 发布)。

### 3. git 克隆 GitHub 超时(GnuTLS)

WSL 里 `git clone` 报 `GnuTLS recv error` 或连接超时,但 `curl` 正常。解决:强制 git 用 HTTP/1.1:

```bash
git -c http.version=HTTP/1.1 clone https://github.com/xxx/xxx.git
```

### 4. pandoc 是硬依赖

`hexo-renderer-pandoc` 需要系统装有 `pandoc`,WSL/Debian 上:

```bash
sudo apt install pandoc
```

### 5. 站点 URL 一直是默认值

`_config.yml` 的 `url` 还是 `http://example.com`,导致 og:url / canonical / 分享链接全错。本次已改为 `https://hugh-tong.github.io`。

## 验证流程

```bash
npx hexo clean
npx hexo g
npx hexo s   # http://localhost:4000 确认渲染
npx hexo d   # force-push 到 main
```

部署后 GitHub Pages 生效有几分钟延迟。

## 后续计划

- 把 `themes/next` 改造成正规 submodule 或改用 npm 安装,根治 gitlink 问题
- 统一锁文件(删掉 `yarn.lock`,保留 npm)
- 清理 `_config.landscape.yml` 旧主题残留

