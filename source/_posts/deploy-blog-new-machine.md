---
title: 博客新机部署实录——从空仓库到上线
date: 2026-09-15 11:15:18
categories:
  - 工具
  - Hexo
tags:
  - tttt
  - Tools
  - Deploy
description: 在一台新 Linux 工作站上从零恢复 Hexo 博客写作环境的完整记录，含 gitlink 坑的解法与每步验证结果。
---

前面两篇维护记录(恢复记录、备忘录)写的都是"怎么维护"，这篇补上"怎么从零部署"——刚在一台新机器(Ubuntu 20.04 工作站)上把整套环境跑通了，把实际执行的每一步和验证结果记下来。以后换机器照着做，半小时内能恢复写作能力。

## 目标

在空机器上恢复:克隆仓库 → 装依赖 → 补主题 → 本地预览 → 能发布上线。

## 环境快照

| 项 | 值 |
|---|---|
| 系统 | Ubuntu 20.04.6 LTS,内核 5.15.0,x86_64 |
| Node.js | v22.23.2 |
| npm | 10.9.8 |
| git | 2.25.1 |
| Hexo | 6.3.0(hexo-cli 4.3.1) |
| 主题 | Butterfly 5.7.0(npm)+ NexT v8.20.0(clone) |

前置条件只有两个:**Node.js ≥ 14 和 git**。不需要 pandoc(渲染器早已换成 hexo-renderer-marked),不需要任何全局装的 Hexo CLI(用 `npx` 即可)。

## 第一步:克隆仓库,切对分支

```bash
git clone git@github.com:hugh-tong/hugh-tong.github.io.git
cd hugh-tong.github.io
git checkout dev_tttt
```

这仓库三个分支职责完全不同:`dev_tttt` 是源码(一切修改只在这),`main` 是部署产物,`master` 是 2023 年旧残留。clone 默认检出的可能是 `master`——那是两年前的旧生成结果,不是源码,务必先切 `dev_tttt`。

## 第二步:装依赖

```bash
npm install
```

装完 266 个包。npm 末尾提示了 audit 漏洞,是 Hexo 6 老版本依赖链的已知情况,本地写作环境可以忽略。

验证:

```bash
npx hexo --version   # hexo: 6.3.0 即正常
```

## 第三步:补 NexT 主题(唯一的坑)

clone 完执行 `ls themes/next`,会发现是**空目录**。这不是 clone 坏了——`themes/next` 在仓库里是一个裸 gitlink(指向 commit 的引用,没有 `.gitmodules`),克隆时不会带下文件。此时直接 `hexo g` 会报主题找不到。

```bash
git clone https://github.com/next-theme/hexo-theme-next.git themes/next
git -C themes/next checkout v8.20.0
```

只日常用 Butterfly 的话理论上可跳过,但 `npm run build:next` 这类脚本会挂,建议照做,一分钟的事。

根治方案(改造成正规 submodule 或 npm 安装 NexT)还在待办里,在那之前换一次机器就得手动补一次。

## 第四步:验证构建

```bash
npx hexo clean
npx hexo generate          # 默认 butterfly:152 files in 1.19s
npm run build:next         # NexT:184 files in 1.88s
```

两套主题都能完整生成就说明环境没问题。生成的临时文件 `_multiconfig.yml` 是主题切换脚本的正常产物,已 gitignore。

## 第五步:本地预览

```bash
npx hexo server -p 4321
# 另开终端验证:
curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/   # 200
```

实测 HTTP 200,首页 39KB,标题正常渲染。想后台常驻:

```bash
setsid nohup npx hexo server > /tmp/hexo-server.log 2>&1 < /dev/null &
```

(用 `setsid` 是因为普通 `&` 会随终端关闭被杀,这是在 WSL 时代踩过的坑。)

## 第六步:发布上线

```bash
npx hexo clean && npm run deploy:butterfly   # 推静态页到 main
git add source/_posts/新文章.md
git commit -m "Add post: 新文章"
git push origin dev_tttt                     # 源码别忘了推
```

deploy 走 SSH,需要本机 SSH key 已注册到 GitHub。生效约 1 分钟。

## 整个流程的验证清单

- [x] `npm install`:266 包无 error
- [x] `themes/next` v8.20.0 就位
- [x] Butterfly 构建 152 文件 / NexT 构建 184 文件
- [x] 本地预览 HTTP 200
- [x] 本篇文章本身就是第六步的实测——你能在网页上看到它,说明全流程通了

## 后记

完整手册已沉淀为仓库里的 `DEPLOYMENT.md`(含环境快照、逐步命令、常见问题速查),本文是它的叙事版。以后换机器直接开 `DEPLOYMENT.md` 照抄命令即可。
