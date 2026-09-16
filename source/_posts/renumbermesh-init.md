---
title: renumberMesh 与 Cuthill–McKee：为什么重编号能降低矩阵带宽
date: 2026-09-15 14:00:00
updated: 2026-09-16 15:30:00
categories:
  - [CFD, OpenFOAM, 求解器]
tags:
  - CFD/OpenFOAM/求解器
  - 求解器
  - OpenFOAM
description: 从有限体积矩阵的单元邻接关系解释矩阵带宽，并说明 OpenFOAM Foundation 13 中 renumberMesh 的默认算法、命令行为和性能验证方法。
mathjax: true
---

> 适用范围：OpenFOAM Foundation 13。命令选项和默认方法以该版本源码为准。
> 最后核对：2026-09-16。

`renumberMesh` 改变的是网格实体的编号顺序，不改变单元几何、拓扑连接或物理模型。它的目标是让相互连接的单元在编号上尽量靠近，从而降低离散方程矩阵的带宽，并改善矩阵访问的局部性。

## 从网格编号到矩阵带宽

有限体积离散后，每个单元对应矩阵的一行。两个单元共享内部面时，它们之间通常会产生非零的非对角系数。若共享面的 owner 和 neighbour 编号相差很大，这个非零元会离主对角线很远。

可以用内部面上的最大编号差近似理解带宽：

$$
B = \max_f \left|i_{\mathrm{neighbour},f}-i_{\mathrm{owner},f}\right|.
$$

网格的物理形状不变时，重新排列单元编号就等价于同时置换矩阵的行和列。线性系统的数学解不因此改变，但存储访问顺序、缓存命中和部分预条件器的工作特征可能改变。

## Foundation 13 的默认行为

Foundation 13 源码说明，`renumberMesh` 默认使用 `bandCompression`，对应 Cuthill–McKee 重编号；只有显式提供 `-dict` 时，才读取 `system/renumberMeshDict` 选择其他方法或参数。

```bash
# 使用默认方法重编号当前案例
renumberMesh -overwrite

# 使用自定义字典
renumberMesh -dict system/renumberMeshDict -overwrite
```

命令不仅处理 cell 顺序，还要同步重排面、点、网格相关字段以及所选时间目录中的场。因此不要在求解器仍在写文件时运行；执行前应备份案例或在副本上验证。具体支持的时间、区域和覆盖选项，以当前安装版本的 `renumberMesh -help-full` 为准。

源码还会计算重编号前后的 `band` 和 `profile`。其中 band 关注最远非零元离对角线的距离，profile 则累计各行的跨度；二者下降说明编号在矩阵结构意义上更紧凑，但不等价于求解一定按同样比例加速。

## Cuthill–McKee 的直觉

Cuthill–McKee 将网格看成图：单元是顶点，共享面是边。算法从低度数顶点附近开始，按图的层次逐步访问邻居，并倾向先访问度数较低的顶点。这样可把图上相邻的顶点放到相近编号中。Reverse Cuthill–McKee 则反转访问结果，通常用于进一步降低 profile；是否反转由具体实现和字典设置决定。

## 对并行计算的影响

`renumberMesh` 与 `decomposePar` 解决不同问题：前者优化编号，后者划分处理器子域。重编号可能改善单核或每个分区内部的内存访问，但不会自动减少跨分区通信，也不能弥补不均衡分解。

判断是否值得采用，应在同一网格、同一分解、同一求解设置下对比：

1. 记录重编号前后的 band/profile。
2. 固定 MPI 进程数、分解字典和硬件绑定。
3. 分别运行若干次，比较线性求解器累计时间、每迭代耗时和总墙钟时间。
4. 确认残差历史及关键物理量一致，再讨论性能收益。

只比较一次总耗时很容易混入文件系统缓存、节点负载和 MPI 布局差异，因此本文不预设一个通用加速百分比。

## 参考资料

- [OpenFOAM Foundation v13: renumberMesh source](https://cpp.openfoam.org/v13/renumberMesh_8C_source.html) —— 官方源码注释与命令实现
- [OpenFOAM Foundation v13: CuthillMcKeeRenumber](https://cpp.openfoam.org/v13/CuthillMcKeeRenumber_8H_source.html)
- [Cuthill–McKee algorithm - Wikipedia](https://en.wikipedia.org/wiki/Cuthill%E2%80%93McKee_algorithm) —— 概念速查
- [并行效率疑问 - CFD-China](https://www.cfd-china.com/topic/757/%E5%B9%B6%E8%A1%8C%E6%95%88%E7%8E%87%E7%96%91%E9%97%AE/18) —— 社区讨论保留作经验参考
