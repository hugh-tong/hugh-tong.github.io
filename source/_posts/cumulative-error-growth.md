---
title: cumulative error 持续增大的排查
date: 2026-09-15 15:00:00
categories:
  - [CFD, 数值方法]
tags:
  - CFD/数值方法
  - simpleFoam
  - 持续增大
  - 数值方法
description: OpenFOAM 时间累计误差持续增大的原因分析与排查路线。
mathjax: true
---

# simpleFoam 中连续性误差（cumulative）持续增大、最终发散的常见原因与对策

在 `simpleFoam` 的迭代日志里，像下面这行来自压力校正（`p`-equation）与通量校正（`phi`）的连续性检查：

```
time step continuity errors : sum local = 2.44316043779e-09, global = -4.34080109975e-12, cumulative = -4.34080109975e-12
```

- `sum local`：各个控制体的局部质量不平衡的绝对值总和（只反映量级）。
- `global`：整个域的净质量不平衡（有符号），理想应接近 0。
- `cumulative`：全局误差的累积和（随迭代更新），如果持续偏离 0 并增大，通常预示压力-速度耦合或边界流量不匹配的问题，可能走向发散。

下面按“成因分类 → 现象 → 快速检查 → 解决策略”的方式总结。

---

## 1) 边界条件不一致或不物理

- **典型症状**
    
    - `global` 带固定符号并逐步累积（`cumulative` 单调漂移）。
    - 入口/出口设置导致总质量通量不平衡（如多个入口 `fixedValue U`，出口也用 `fixedValue U`）。
- **快速检查**
    
    - 用 `checkMesh -constant` 看是否有网格面法向/体积问题（虽不直接对应，但先排除）。
    - 检查 0 文件夹中的 `U`、`p`、`nut`、`k/epsilon/omega` 边界条件：
        - 入口常用：`U: fixedValue`、`p: zeroGradient`
        - 出口常用：`U: zeroGradient`、`p: fixedValue`（或 `totalPressure`）
        - 固壁：`U: noSlip/slip`、`p: zeroGradient`
    - 多个出口时尽量选用压力型出口（`fixedValue p` 或 `outletInlet` 等）。
- **解决策略**
    
    - 确保流量唯一由入口速度或出口压力来“决定”，避免同一方向上过度“刚性”的双定常量（入口速度 + 出口速度）。
    - 对非定常方向/多出口，采用压力出口（`fixedValue p`、`inletOutlet`、`pressureInletOutletVelocity`）。

---

## 2) 压力方程奇异/近奇异（参考压力设置不当）

- **症状**
    
    - `p` 的线性系统难以收敛，`global`/`cumulative` 漂移大。
    - 封闭域或近封闭域未设定参考压力，或参考面设置不合理。
- **快速检查**
    
    - `fvSolution` 中 `SIMPLE`/`PISO` 的 `nNonOrthogonalCorrectors`、`pRefCell/pRefValue` 是否设置。
    - 闭合域（无明确出口）场景是否设置了 `pRefCell/pRefValue`。
- **解决策略**
    
    - 在 `system/fvSolution` 的 `SIMPLE` 块设置参考压力，例如：
        
        ```text
        SIMPLE{    nNonOrthogonalCorrectors 2;    pRefCell 0;    pRefValue 0;}
        ```
        
    - 或在某一合适位置（接近出口）设置一个小面或小区域的 `fixedValue p`。

---

## 3) 离散化与数值设置过于激进（导致非物理振荡）

- **症状**
    
    - 迭代初期还稳定，随迭代出现振荡，`cumulative` 加速漂移。
    - 残差难以下降或出现锯齿型变化。
- **快速检查**
    
    - `system/fvSchemes` 中的对流项是否使用高阶且无界限格式（如 `linearUpwind`、`QUICK`）但未配合限幅。
    - `fvSolution` 的 `relaxationFactors` 是否过大（尤其是 `p`）。
- **解决策略**
    
    - 对流项改为更稳健的有界格式：
        - 标量（k/epsilon/omega/nut）：`bounded Gauss upwind` 或 `linearUpwindV limited 0.5`
        - 速度：`bounded Gauss upwind` 或 `linearUpwindV limited 0.5`
    - 增大压力校正次数、非正交修正：
        
        ```text
        SIMPLE{  
        nNonOrthogonalCorrectors 2;   // 甚至 3–5（高非正交网格）  
        pRefCell 0; 
        pRefValue 0;}
        ```
        
    - 放松因子更保守：
        
        ```text
        relaxationFactors{ 
         fields  {  
           p 0.3;         // 0.2–0.4 
            }  equations  { 
               U 0.7;        // 0.3–0.7   
               k 0.7;    
               epsilon 0.7;   // 或 omega 0.5–0.7    nut 0.7;  }}
        ```
        

---

## 4) 网格质量问题（非正交/歪斜/小面/负体积）

- **症状**
    
    - `checkMesh` 报告高非正交（> 70–80°）、高 skewness 或极小/退化单元。
    - 即使保守数值设置仍难以稳定。
- **快速检查**
    
    - `checkMesh` 重点看：
        - `Max skewness`, `Max non-orthogonality`, `Face pyramids`, `Cell determinant`
    - `snappyHexMesh` 后是否做了合理的 `snap/layer` 参数调优。
- **解决策略**
    
    - 改善网格：
        - 降低最大非正交，控制最小面角，提高近壁质量。
        - 在 `snappyHexMeshDict` 中放宽层铺展、降低过强的细化跳跃；或对几何做 `surfaceCheck/surfaceClean`。
    - 数值上增加 `nNonOrthogonalCorrectors`，对高非正交网格很重要。

---

## 5) 初始场或入口剖面与壁面粗糙/湍流模型不一致

- **症状**
    
    - 刚开始迭代 `U/p/k/epsilon(omega)` 残差跳变，连续性误差陡增。
    - 入口剖面与墙函数粗糙参数（`z0`、`nutURoughWallFunction` 等）不匹配，产生强发展段。
- **快速检查**
    
    - 入口 `U` 剖面、湍流量 `k/epsilon/omega` 是否与预期边界层一致。
    - 壁面粗糙参数是否与入口剖面的粗糙度一致；y+ 是否落在墙函数适用范围。
- **解决策略**
    
    - 用对数律/幂律一致的 ABL 入口；匹配 `k-ε` 或 `k-ω` 初值。
    - 在复杂地形/城市算例中，尽量采用足够高的顶边界和发展段长度。

---

## 6) 物性或源项设置问题

- **症状**
    
    - 非常小的黏度（高雷诺）+ 粗网格 + 激进格式 → 不稳定。
    - 体力/源项（如 `fvOptions`）设置不当，质量源或动量源不守恒。
- **快速检查**
    
    - `constant/transportProperties` 物性是否合理。
    - `system/fvOptions` 是否添加了体积流量源（`massFlowRate`、`pressureGradientExplicitSource`）而未闭合。
- **解决策略**
    
    - 在高 Re 粗网格场景，先用更保守格式与更强放松，逐步放开。
    - 审核源项的守恒性与方向符号。

---

## 7) 线性求解器/预条件器设置不合适

- **症状**
    - `p` 方程迭代次数很高、残差不下去，连续性误差跟着漂移。
- **快速检查**
    - `fvSolution` 中 `solvers` 设置是否与网格性质匹配（对称/非对称、稀疏性）。
- **解决策略**
    - 压力使用 GAMG 并合理配置：
        
        ```text
 solvers{  
        p  {   
            solver          GAMG;    
            tolerance       1e-7;   
            relTolerance    0.1;   
            smoother        DICGaussSeidel;  
            nCellsInCoarsestLevel 200;  
            agglomerator    faceAreaPair;    
            mergeLevels     1;  
           } 
        U  {    
              solver          smoothSolver;   
              smoother        symGaussSeidel;   // 或 DILU   
              tolerance       1e-8;    
              relTolerance    0.1;  
            }
         }
        ```
        
    - 对高度非正交网格，可尝试 `DIC`/`DILU` 平滑器。

---

## 建议的诊断步骤（按优先级）

1. 运行 `checkMesh`，确认网格质量门槛（非正交、skewness）。
2. 核对 0 文件夹边界条件组合是否物理、是否存在“速度+压力同时刚性定值”的出口/入口。
3. 在 `fvSolution` 中添加/确认 `pRefCell/pRefValue`（封闭域）与合理的 `nNonOrthogonalCorrectors`。
4. 采用更稳健的对流格式（bounded upwind/limited linearUpwind）和保守放松因子。
5. 检查/匹配入口边界层剖面与墙函数粗糙参数；确保 y+ 合理。
6. 审核 `fvOptions` 源项与物性；必要时先去掉源项测试。
7. 查看 `log.simpleFoam` 中 `p` 求解器的迭代与残差变化，调整 `GAMG` 参数。

---

## 小结

- `cumulative` 连续性误差持续增大，通常由边界条件不匹配、压力参考/非正交修正不足、离散化过激进或网格质量问题引起。
- 优先保证：物理一致的边界条件 + 合理网格 + 稳健数值设置（对流格式、放松、非正交修正），再逐步“解锁”精度和速度。

如果你愿意贴出你的 `fvSchemes`、`fvSolution`、关键边界条件（0/U, 0/p）以及 `checkMesh` 摘要，我可以针对你的案例给出更具体的修改建议。