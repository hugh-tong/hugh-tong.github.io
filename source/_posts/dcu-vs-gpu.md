---
title: DCU(深度计算单元)与 GPU 的区别
date: 2026-09-15 16:00:00
categories:
  - [CS]
tags:
  - CS
  - GPU加速
  - CS
  - Computing
  - Unit
description: 国产 DCU 加速卡与 GPU 的架构定位差异。
mathjax: true
---

在“面向DCU的OpenFOAM并行加速研究”中，DCU通常指的是数据处理单元（Data Compute Unit ）。 在计算机硬件领域，DCU是一种专门设计用于高效处理数据密集型计算任务的芯片或硬件模块。与传统的CPU（中央处理器）和GPU（图形处理器）不同，DCU针对特定的数据处理任务进行了优化，比如在大规模数据处理、机器学习和高性能计算等领域有着广泛的应用。 在OpenFOAM的语境下，OpenFOAM是一款用于计算流体动力学（CFD）等工程模拟的开源软件。使用DCU对OpenFOAM进行并行加速研究，目的是利用DCU强大的并行计算能力，加速OpenFOAM模拟过程中的计算，提高计算效率 ，从而更快速地完成复杂的流体动力学模拟等任务。

## DCU（Deep Computing Unit）与GPU的区别

> 这里的DCU的D是Data还是该是Deep？
> - 确认是deep
> 
> DCU 加速卡是一种协处理器，其架构类似于GPU，具有相似的特性，本文
通过在新型国产超算平台上安装OpenFOAM，并在单节点实现了多块DCU 加速卡
与OpenFOAM 的结合，创建了全新的基于DCU 加速卡的求解器DCUsolver。并对
其进行编译封装，使其通过OpenFOAM 的controlDict 和fvSolution 两个文件进行调
用。测试了相关性能，有着可观的性能加速，并通过热点分析，确定OpenFOAM
的算法热点，进行了一定程度的优化。在OpenFOAM-2.2.x 实现了混合精度的处理，
大约有1.5 倍的性能加速。

这里谈的DCU，应该就是GPGPU吧



## 海光DCU


[V100的全面国产替代 ——海光DCU Z100L 面向人工智能的GPGPU加速卡 - 知乎](https://zhuanlan.zhihu.com/p/627707065)