---
title: p 与 p_rgh:静水压力处理的两条路线
date: 2026-09-15 12:00:00
categories:
  - [CFD, OpenFOAM, 边界条件]
tags:
  - CFD/OpenFOAM/边界条件
  - 多相流
  - simpleFoam
  - 浸没边界法
  - RANS
description: OpenFOAM 中 p 与 p_rgh 的关系、静水压力扣除的动机与求解器选择。
mathjax: true
---
# 101

[OpenFOAM: User Guide: Hydrostatic pressure effects](https://www.openfoam.com/documentation/guides/latest/doc/guide-applications-solvers-variable-transform-p-rgh.html)

For cases that the hydrostatic pressure contribution

ρ(g∙h)

is important, e.g. for buoyant and multiphase cases, it is numerically convenient to solve for an alternative pressure defined by

p′=p−ρ(g∙h).

In OpenFOAM solver applications the p′ pressure term is named `p_rgh`. The momentum equation

∂∂t(ρu)+∇∙(ρu⊗u)−∇∙(μeff∇u)=−∇p+ρg

is transformed to use p′:

p′=p−ρ(g∙h).

After the following substititions:

−p−∇p=−p′−ρ(g∙h)=−∇(p′)−∇(ρ(g∙h))=−∇(p′)−ρg∙∇h−h∙∇(ρg)=−∇(p′)−ρg∙I−g∙h∇(ρ)−ρh∙∇(g)0=−∇(p′)−ρg−g∙h∇ρ

where, for CFD meshes the term ∇h is given by the gradient of the cell centres, which equates to the tensor I, the momentum equation becomes:

∂∂t(ρu)+∇∙(ρu⊗u)−∇∙(μeff∇u)=−∇p′−g∙h∇ρ

For constant density applications this can be further simplified to

∂∂t(ρu)+∇∙(ρu⊗u)−∇∙(μeff∇u)=−∇p′





[question on the physical meaning of p_rgh -- CFD Online Discussion Forums](https://www.cfd-online.com/Forums/openfoam-solving/142249-question-physical-meaning-p_rgh.html)

p_rgh 没有任何物理意义，它只是一个方便的数值技巧。

表达式不是关于 h，而是关于 z 的：

p_rgh = p - rho_g_z

这意味着如果某个单元位于 z = 0，那么 p_rgh = p。

此外，正如你指出的，如果在某一时刻单元位于水中，p_rgh = p - rhoWater_g_z；而在下一时间步它位于空气中：p_rgh = p - rhoAir_g_z，这可能会在 p_rgh 上引入相当大的变化。

简而言之，p_rgh 不是静水压力，因为它考虑的是某一点发生的情况，而不是上方所有点的影响。希望这能让问题更清楚一些。



[0001170: p_rgh formulation - OpenFOAM Issue Tracking](https://bugs.openfoam.org/view.php?id=1170)
带浮升力的p_rgh存在的问题。







# 在 OpenFOAM 中将 simpleFoam 的压力场用于弱可压求解器（含 `p` 与 `p_rgh`）的处理方法


下述过程：不可压结果到弱可压

Q：在采用OpenFOAM进行CFD计算中，我用simpleFoam计算得到了一个稳态的结果。得到压力场p在-790到1000之间。我现在要把这些结果，弄到另外一个需要用到p和prgh的弱可压求解器中，对于压力场，需要做什么处理？


你目前在 `simpleFoam`（不可压稳态）里得到的压力场范围为 $-790 \sim 1000$（单位通常为 Pa）。现在要把结果转到一个弱可压（weakly-compressible）的求解器，并且该求解器使用 `p` 和 `p_rgh`。关键在于明确这两个压力字段在不同物理模型下的定义与转换关系。

## 核心概念与差异

- **`simpleFoam` 的 `p`（不可压）：**
  - 在不可压求解器中，`p` 常常是“动力学压力”或“相对压力”意义上的变量（具体取决于版本与设置），它通过泊松方程用于满足连续性，绝对值常常只在一个常数上不唯一（可加常数）。
  - 很多不可压算例中，`p` 可以是“以密度归一化的压力”（即 `p = p_phys/ρ`，单位为 m²/s²），也可能是以 Pa 表示的动态压力；需以你的 `0/p`、`thermophysicalProperties` 和求解器版本为准。
  - 范围 $-790 \sim 1000$ Pa 看上去像是相对压力（相对某参考压力）的波动量。

- **弱可压求解器中的 `p` 与 `p_rgh`：**
  - 弱可压求解器通常解决能量方程，`p` 是物理压力（Thermo pressure），即绝对压力或相对参考的“热力学压力”，参与状态方程（例如 barotropic 或弱可压 EoS）。
  - `p_rgh` 定义为去除了重力静水柱的压力：
    - $p_{rgh} = p - \rho g h$
    - 其中 $h$ 为重力方向上的几何高度（例如相对某参考面 $z$），$g$ 为重力加速度标量（或向量投影），$\rho$ 为密度。
  - 在可压类求解器里，`p` 与 `p_rgh` 的相互转换随密度场变化而变化。

因此，直接把 `simpleFoam` 的 `p` 原样当作弱可压求解器的 `p` 或 `p_rgh` 往往是不对的，需要做一致化处理。

## 应做的处理步骤

1. **确认 `simpleFoam` 的 `p` 含义与单位**
   - 查看 `0/p` 的 `dimensions`。若为 `[0 2 -2 0 0 0 0]`（m²/s²），说明是压强除以密度的形式（kinematic pressure，`p/ρ`）；若为 `[1 -1 -2 0 0 0 0]`（Pa），则是以帕计的压力。
   - 检查 `transportProperties` 与求解器设置，确认是否使用密度归一化。多数不可压求解器在方程中用的是 kinematic pressure。

2. **把 `simpleFoam` 的 `p` 转换为物理压力 `p_phys`（若需要）**
   - 若 `simpleFoam` 的 `p` 是 kinematic（`p/ρ`），需乘以密度：  
     - $ p_{phys} = \rho \, p_{kin} $
     - 对不可压流，$\rho$ 为常数，可直接乘。
   - 若已经是 Pa，则这步可略。

3. **施加（或移除）静水压力以得到 `p` 与 `p_rgh`**
   - 你的弱可压求解器需要两个字段：
     - `p`：物理（热力学）压力
     - `p_rgh = p - \rho g h`
   - 根据你要在新算例中使用的重力方向和参考高度场 $h$（通常 `h = (ĝ·x)` 或 `z`），以及介质密度场 `rho`：
     - 若你的 `simpleFoam` 结果是相对压力（未包含静水项），则将其作为扰动压力叠加到参考热力学压力上：  
       - 选择一个参考绝对压力 $p_{ref}$（如 101325 Pa），定义  
         $p = p_{ref} + p'$（其中 $p'$ 为你的已转换后的相对压力）。  
       - 然后计算  
         $p_{rgh} = p - \rho g h$。
     - 若你希望保持当前相对水平（不关心绝对压），也可以选择在新算例中使用同一参考：  
       - 给定 `p` 的平均值加上一个常数使其在入场或边界处达到所需热力学压力水平，再用上式得到 `p_rgh`。

4. **一致化边界条件与参考压力**
   - 在弱可压求解器中，通常 `p_rgh` 采用零梯度或固定值，`p` 在状态方程与能量方程中使用。确保边界条件与 `g`、`h` 的定义一致。
   - 对开口边界（如 `pressureOutlet`/`totalPressure` 等），要明确是对 `p` 还是对 `p_rgh` 施加条件，避免把静水项重复或遗漏。
   - 如果你的新求解器使用 `p_rgh` 作为主求解变量（常见于重力主导流动），则在初始场给 `p_rgh`，并由求解器恢复 `p`；这时你需要根据上述关系从旧场构造 `p_rgh`。

5. **密度场的一致性**
   - 弱可压需要 `rho`（由温度、压力、EoS 给出或由 `thermophysicalProperties` 指定）。若你从不可压转入，需要提供合适的 `rho` 初值或模型参数，使 `p_rgh` 与 `p` 的关系自洽。
   - 若采用恒定密度的弱可压近似，转换更简单；若 `rho` 随空间变化，构造 `p_rgh` 时应使用同一 `rho` 场。

## 实用配方

- 情形 A：simpleFoam 的 `p` 为 kinematic（单位 m²/s²），不可压密度为常数 `rho0`，你要在弱可压中用绝对热力学压力并设参考 $p_{ref}=101325$ Pa：
  1) `p_phys = rho0 * p_simple`  
  2) `p = p_ref + p_phys`  
  3) `p_rgh = p - rho(x) * g * h(x)`（若初期取 `rho=rho0`，则用常数）

- 情形 B：simpleFoam 的 `p` 已为 Pa，表示相对压力（均值约 0），要转为 `p_rgh` 初场：
  1) 选参考绝对压力 `p_ref`，令 `p = p_ref + p_simple`  
  2) `p_rgh = p - rho * g * h`

- 情形 C：你希望新算例直接以 `p_rgh` 为主变量，并维持与旧流场的动压分布一致：
  - 直接设定  
    `p_rgh = (p_ref + p_simple_phys) - rho*g*h`  
    其中 `p_simple_phys` 为按需要从 kinematic 转回 Pa 的压力扰动。
  - `p` 将由求解器从 `p_rgh + rho*g*h` 恢复。

## 常见坑与检查

- **常数偏移不影响速度场，但影响热力学压力**：不可压的 `p` 可加常数；可压求解器中这个常数决定了热力学状态，需选物理合理的 `p_ref`。
- **单位不匹配**：确保是否为 `p/ρ`。若错把 m²/s² 当 Pa，会差一个 $\rho$ 倍。
- **重力方向和高度定义**：检查 `constant/g` 与网格坐标，确认 $h$ 取值方向一致。
- **边界条件一致性**：开口边界对 `p` 与 `p_rgh` 的 BC 不可混用。
- **Z 夸张/坐标缩放**：若你的几何或 `g` 与真实单位不一致，会直接影响 `ρ g h` 的量级。

---

如果你提供：
- 你的 `0/p` 的 `dimensions`，`constant/g`，`rho` 的设定方式（恒定或由 EoS），以及目标弱可压求解器名称，
- 以及重力参考面（如何定义 `h`），

我可以给出精确的字段转换命令（例如用 `foamCalc` 或 `funkySetFields` 的具体操作步骤与脚本）。
