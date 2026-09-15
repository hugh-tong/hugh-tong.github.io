---
title: OpenFOAM 边界条件整理(2026)
date: 2026-09-15 12:00:00
categories:
  - [CFD, OpenFOAM, 边界条件]
tags:
  - CFD/OpenFOAM/边界条件
  - foam-extend
  - interFoam
  - simpleFoam
  - 边界条件整理
description: 全部常用边界条件的分类速查:固定值/梯度/混合/入口出口与特殊条件。
mathjax: true
---
在 OpenFOAM 的不可压缩流体模拟中（如 `simpleFoam`, `pisoFoam`, `interFoam`），边界条件的设置直接决定了计算的收敛性和物理准确性。针对**管内流动/室内通风**场景，以下是单相流与两相流（VOF）的压力与速度边界条件总结。

---

## 一、 单相不可压缩流动 (Single-Phase)
**适用求解器：** `simpleFoam` (稳态), `pisoFoam` / `pimleFoam` (瞬态)
**核心注意：** 压力场 `p` 的量纲通常是 $m^2/s^2$（即 $P/\rho$）。

| 边界位置            | 速度场 (**U**)                   | 压力场 (**p**)                          | 说明                               |
| :-------------- | :---------------------------- | :----------------------------------- | :------------------------------- |
| **入口 (Inlet)**  | `fixedValue`                  | `zeroGradient` 或 `fixedFluxPressure` | 给定已知流速（如 `uniform (1 0 0)`）。     |
| **出口 (Outlet)** | `zeroGradient`                | `fixedValue`                         | 通常设出口压力为 0（参考压）。                 |
| **壁面 (Wall)**   | `noSlip`                      | `zeroGradient` 或 `fixedFluxPressure` | `fixedFluxPressure` 在高非正交网格下更稳定。 |
| **压力入口**        | `pressureInletOutletVelocity` | `totalPressure`                      | 适用于已知室内外压差，而非已知流速的场景。            |

---

## 二、 两相不可压缩流动 (Two-Phase / VOF)
**适用求解器：** `interFoam`, `interIsoFoam`, `pimpleIbFoam` (foam-extend)
**核心注意：** 使用 `p_rgh` ($p - \rho gh$) 代替静压 `p`，以方便处理重力引起的静水压。

| 边界位置 | 速度场 (**U**) | 动压力 (**p_rgh**) | 相分率 (**alpha.water**) |
| :--- | :--- | :--- | :--- |
| **入口 (Inlet)** | `fixedValue` | `fixedFluxPressure` | `fixedValue` (1 为全水, 0 为全气) |
| **出口 (Outlet)** | `zeroGradient` 或 `inletOutlet` | `fixedValue` (通常设为 0) | `inletOutlet` (防止出口回流导致相场崩溃) |
| **壁面 (Wall)** | `noSlip` | `fixedFluxPressure` | `zeroGradient` 或 `alphaContactAngle` |
| **大气/开口** | `pressureInletOutletVelocity` | `totalPressure` | `inletOutlet` (通常 inletValue 为 0) |

---

## 三、 关键边界条件详解

### 1. 压力场中的 `fixedFluxPressure`
* **用途：** 专门用于壁面和已知速度的入口。
* **原理：** 它根据速度边界条件计算压力梯度，确保压力梯度的设置与速度通量一致。
* **建议：** 在 `interFoam` 和高版本 OpenFOAM 中，壁面尽量使用此条件代替 `zeroGradient`。

### 2. 出口处的 `inletOutlet`
* **用途：** 提高计算稳定性。
* **原理：** 当流体流出时，它是 `zeroGradient`；一旦发生回流，它自动切换为 `fixedValue`。
* **配置示例：**
    ```cpp
    type            inletOutlet;
    inletValue      uniform (0 0 0); // 回流时的速度
    value           uniform (0 0 0);
    ```

### 3. 两相流中的 `alpha.water` 出口设置
* **痛点：** 若出口设为 `zeroGradient`，回流可能把“虚无”的相带入域内导致发散。
* **方案：** 必须使用 `inletOutlet`，并将 `inletValue` 设为 0（空气），确保回流进来的只有空气。

---

## 四、 针对室内/管内流动的进阶设置

### 1. 室内通风（已知压差）
如果模拟空调送风或自然通风，有时不知道精确流速，只知道风机压头：
* **Inlet U:** `pressureInletOutletVelocity`
* **Inlet p:** `totalPressure` (设定 `p0` 为风机静压)

### 2. 浸没边界法 (IBM) 特殊处理
既然你在研究 `foam-extend` 的 IBM 功能，注意在 `0/U` 和 `0/p` 中对浸没物体的处理：
* **U:** `immersedBoundary` (配合 `v` 指定物体速度，如 `(0 0 0)`)
* **p:** `immersedBoundary` (通常内部逻辑处理为类似 `zeroGradient`)

---

## 五、 总结配置模板（以单相流管内流动为例）

**0/U:**
```cpp
boundaryField {
    inlet  { type fixedValue; value uniform (1 0 0); }
    outlet { type inletOutlet; inletValue uniform (0 0 0); value uniform (1 0 0); }
    walls  { type noSlip; }
}
```

**0/p:**
```cpp
boundaryField {
    inlet  { type fixedFluxPressure; value uniform 0; }
    outlet { type fixedValue; value uniform 0; }
    walls  { type fixedFluxPressure; value uniform 0; }
}
```

---

**下一步建议：**
针对你的水库库区模拟（含管道），由于库区通常有自由液面，建议出口使用 **两相流设置**。如果管道出口完全淹没在水下，则可以简化为 **单相流固定速度出口**。

你想让我为你生成一个完整的 `interFoam` 求解器的 `0/` 文件夹配置脚本（包含 `alpha`, `U`, `p_rgh`）吗？