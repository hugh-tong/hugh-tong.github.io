---
title: redistributePar 与 reconstructPar：按发行版选择并行数据工具
date: 2026-09-15 12:00:00
updated: 2026-09-16 18:00:00
categories:
  - [CFD, OpenFOAM, 网格]
tags:
  - CFD/OpenFOAM/网格
  - 网格
  - OpenFOAM
  - 并行计算
description: 区分 reconstructPar 的结果重构与 redistributePar 的并行重分布，并说明 Foundation、OpenCFD 发行线之间的命令差异。
mathjax: true
---

> 适用范围：命令示例以 OpenCFD 文档中的 `redistributePar` 为主，并对照 OpenFOAM Foundation 13 源码。两个发行线的选项并不完全相同，执行前必须以本机 `-help-full` 为准。

## 核心区别

| 需求 | 首选工具 | 说明 |
|---|---|---|
| 将 `processor*` 中的场重构到未分解目录 | `reconstructPar` | 传统的结果重构工具，常用于后处理和归档 |
| 按新的 `decomposeParDict` 重新划分已有网格和场 | `redistributePar` | 并行读取、映射和写出新的分布 |
| 用一个并行工具完成分解或重构 | OpenCFD `redistributePar -decompose/-reconstruct` | 这些模式和参数应按 OpenCFD 对应版本文档使用 |

`redistributePar` 不是“更高级所以总该使用”的替代品。只需要重构少量结果时，`reconstructPar -latestTime` 更直接；需要改变分区或避免串行重构工作流时，才考虑 `redistributePar`。

## 常见命令

传统重构：

```bash
reconstructPar -latestTime
```

OpenCFD 文档给出的并行模式包括：

```bash
# 并行分解
mpirun -np 8 redistributePar -decompose -parallel

# 按当前 decomposeParDict 重分布
mpirun -np 8 redistributePar -parallel

# 并行重构
mpirun -np 8 redistributePar -reconstruct -parallel
```

改变处理器数量时，要先修改 `system/decomposeParDict` 的 `numberOfSubdomains`，再按对应版本文档选择启动的 MPI 进程数。不要从另一发行线复制命令后直接用于生产算例。

## `-overwrite` 需要谨慎

不能笼统说 `reconstructPar` “默认创建一个新时间步”或“需要 `-overwrite` 才能覆盖”。不同工具和版本对已有时间目录、mesh instance 与 `-newTimes`/`-overwrite` 的处理不同。

Foundation 13 的 `redistributePar` 源码中，非 overwrite 模式会推进写出 instance，而 overwrite 模式会写回原 instance。它改变的是网格和场的写出位置，不只是一个无害的输出选项。操作重要算例前应：

```bash
redistributePar -help-full
reconstructPar -help-full
```

并先复制一个小算例验证目录变化。

## 不再采用的说法

- `reconstructPar` 并非天然“不支持 AMR”。动态网格能否重构取决于版本、各时间的 processor mesh 和拓扑数据是否完整。
- 没有基准数据时，不能断言 `redistributePar` 一定更快或一定更省主节点内存；网格、字段数量、文件处理器和存储系统都会影响结果。
- ParaView 可以直接读取分解算例，因此“看结果”不总是必须先重构。
- `redistributePar` 的功能和参数在 Foundation 与 OpenCFD 发行线之间存在差异，不能混成一套通用命令。

## 选择流程

1. 只需查看分解结果：先尝试 ParaView 直接读取。
2. 需要完整场用于归档/后处理：使用 `reconstructPar`，并限定需要的时间范围。
3. 需要改变分区或处理器数：使用当前发行版的 `redistributePar` 工作流。
4. 动态网格、AMR 或超大算例：先在副本上验证 mesh、fields、lagrangian 数据和重启能力，再处理原算例。

## 参考

- [OpenCFD：redistributePar](https://doc.openfoam.com/2606/tools/parallel/redistributePar/)
- [OpenCFD：parallel tools overview](https://doc.openfoam.com/2312/tools/parallel/)
- [OpenFOAM Foundation 13：redistributePar source](https://cpp.openfoam.org/v13/redistributePar_8C_source.html)
