---
title: Linux 网络笔记(占位)
date: 2026-09-15 16:10:00
categories:
  - [工具, Linux]
tags:
  - 网络
  - Linux
  - 占位待充实
description: Linux 网络命令与概念笔记占位,正文待充实。
mathjax: true
---

ClashVerge上的HTTPS的端口，得和环境变量中的一样


export HTTPS_PROXY=http://127.0.0.1:7890


查看7890端口是否被占用：
sudo netstat -nlp | grep "7890"

在终端用wget来判断，终端是否已经成功设置proxy


用下面来找一下所有的环境变量
env | grep "53"