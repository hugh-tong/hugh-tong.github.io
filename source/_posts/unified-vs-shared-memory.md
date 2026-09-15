---
title: Unified Memory 与 Shared Memory
date: 2026-09-15 16:00:00
categories:
  - [CS]
tags:
  - CS
  - GPU加速
  - CS
  - CUDA
  - UnifiedMemory
description: GPU/DCU 编程中统一内存与共享内存的区别。
mathjax: true
---

这是 CUDA/GPU 计算领域的一个**高频易混概念**问题。我们来详细区分：

---

# 1. Shared memory（共享内存）

- **定义**：  
  在CUDA等GPU编程中，**Shared memory**专指**每个线程块（Block）内部所有线程独享的高速片上内存**。
- **范围/特性**：
  - 作用范围（Scope）：**仅同一个Block内**的线程可见与读写，**不同Block间不共享**。
  - 访问速度：**极快，接近寄存器速度**，远快于全局内存（global memory）。
  - 容量有限：每个SM（流处理器组）通常只有48kB或更大一点（具体随硬件）。
  - 典型用途：线程协作、数据缓存、矩阵块操作、并行归约等 Block 内部的高效并行数据交换。
- **声明**：
  ```cpp
  __shared__ float buf[256];
  ```
- **同步**：需手动使用`__syncthreads()`同步线程对shared memory的访问。

---

# 2. Unified memory（统一内存）

- **定义**：  
  Unified memory 是**NVIDIA CUDA从Kepler架构开始引入的一种机制**，它让CPU和GPU共享一块统一逻辑地址空间（Unified Virtual Address Space, UVA）。
- **范围/特性**：
  - 作用范围：CPU 和 GPU 都能直接访问这块内存，**开发者不需要手动区分主机内存和设备内存**。
  - 底层实现：物理上主机（CPU）和GPU的内存还是独立的，**“统一”是编程角度**，数据会根据需要在二者之间自动迁移。
  - 用法简便：分配统一内存用`cudaMallocManaged`，不再需要单独的`cudaMemcpy`。
  - 性能影响：自动迁移方便开发，但可能带来额外的访问延迟（比如数据在GPU需要时还在CPU，需迁移才可用）。
- **代码示例**：
  ```cpp
  float *A;
  cudaMallocManaged(&A, N * sizeof(float));
  ```
- **优势**：简化了多台CPU-GPU混合计算下的数据管理，可让数据“到处都能访问”，无需手动“拷来拷去”。

---

## 总结对比

|                  | Shared Memory                  | Unified Memory                        |
|------------------|-------------------------------|---------------------------------------|
| 存在位置         | GPU片上(每个Block独享)        | 由CUDA管理的CPU/GPU统一虚拟空间       |
| 可访问范围       | 仅Block内部线程               | 所有CPU进程和所有GPU线程              |
| 用途/意义        | Block内部线程高速协同/缓存    | 开发便捷，自动跨主机与设备迁移数据     |
| 分配与声明       | 内核内 `__shared__` 声明      | `cudaMallocManaged` 分配               |
| 速度             | 极快                          | 与实际物理存储一致（访存+迁移延迟）   |
| 开发范式         | 需显式声明、手动同步          | 无需memcpy，后台隐式同步和迁移        |
| 典型适用         | 并行算法块内优化（如矩阵乘）   | 跨设备协同开发、方便调试和原型开发     |

---

### 一句话区分

- **Shared memory** 是**线程块内部临时高速协作区**；
- **Unified memory** 是**CPU与GPU共享访问的自动同步全局内存区**，开发角度“无缝”，但速度不如片上shared快。

---

如需更细节的原理说明、典型应用区别或代码示例，可以继续提问！
