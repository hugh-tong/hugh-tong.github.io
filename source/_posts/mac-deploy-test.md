---
title: 部署手册实测:MacBook 环境从零到上线
date: 2026-09-15 11:30:00
tags:
  - hexo
  - Deploy
categories:
  - [工具, 博客维护]
---

今天在 MacBook(macOS 12.7.4, Intel)上把博客环境从零跑通了一遍,顺手把过程沉淀成仓库里的 `DEPLOYMENT.md`。这篇是当日实录的快照,备忘 + 验证部署链路。

## 环境

| 项 | 值 |
|---|---|
| 系统 | macOS 12.7.4 (Monterey), Intel x86_64 |
| Node.js | v22.23.2(nvm) |
| npm | 10.9.8 |
| git | 2.37.1(Apple Git) |
| Hexo | 6.3.0(仓库锁定) |

## 踩过的坑(按顺序)

### 1. `themes/next` 是空的

裸 gitlink 问题,克隆仓库不带文件。补:

```bash
git clone https://github.com/next-theme/hexo-theme-next.git themes/next
git -C themes/next checkout v8.20.0
```

### 2. macOS 没有 `setsid`

后台常驻预览在 Mac 上用 `nohup npx hexo server ... &` 即可,不需要(也没有)`setsid`。

### 3. SSH key 是 Gitee 的

同一把 ed25519 公钥可以同时注册在 Gitee 和 GitHub,不冲突。注册完 `ssh -T git@github.com` 出现 `Hi xxx!` 即通。

## 验证结果

- Butterfly 构建:152 files / 1.29s
- NexT 构建:163 files / 2.61s
- 本地预览:HTTP 200,首页 39KB

## 一句话总结

仓库的 `DEPLOYMENT.md` 已更新为双机实录(Mac + Ubuntu 工作站),换新机器照着跑即可。眼睛就是 CI:本地预览过一遍再上线。
