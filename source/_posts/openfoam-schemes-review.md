---
title: OpenFOAM 离散格式选型指南
date: 2026-09-13 14:30:00
categories:
  - [CFD, OpenFOAM]
tags:
  - CFD/数值方法
  - Schemes
  - OpenFOAM
  - RANS
description: 从时间项到梯度项的 fvSchemes 选型速查:各格式的精度、稳定性权衡,高非正交网格的参数设置,以及 upwind 数值粘性的数学推导。
mathjax: true
---

离散格式(`fvSchemes`)是 OpenFOAM 案例配置里最影响结果质量的一环。这篇笔记整理时间项、对流项、拉普拉斯项、梯度项的选型逻辑,配 Wolfdy 教程和补充技巧文档的原始幻灯片,并附两段数学推导(upwind 的人工粘性、三种梯度格式对比)。

## 时间离散格式速查

| Scheme | Order | Formulation | Advantages | When to Use |
| :--- | :---: | :--- | :--- | :--- |
| **First Order Implicit** | 1st | $\frac{\phi^{n+1}-\phi^n}{\Delta t} = F(\phi^{n+1})$; solved iteratively. | Unconditionally stable; simple. | Quick transients: when accuracy is not critical. |
| **Second Order Implicit** | 2nd | $\frac{3\phi^{n+1}-4\phi^n+\phi^{n-1}}{2\Delta t} = F(\phi^{n+1})$. | Higher temporal accuracy. | Accurate unsteady flows; requires storage of previous time levels. |
| **Bounded Second Order Implicit** | 2nd | Similar to second order but with bounding to prevent oscillations. | Stable for LES/DES; prevents extrema. | Large eddy or detached eddy simulations. |
| **Explicit** | 1st | $\phi^{n+1} = \phi^n + \Delta t F(\phi^n)$; CFL-limited. | Accurate for wave propagation (e.g., shocks). | Density based solver; compressible transients with small time steps. Not for incompressible. |

**Euler** 格式 robust 但只有一阶:

![Wolfdy 教程 p616 时间格式](/images/openfoam-schemes-review/wolf-p616-time-schemes.png)

## 对流项格式

这部分内容与「工程化 OpenFOAM」的实践直接相关。

### Robust, but too diffusive

![一阶迎风:robust 但耗散强](/images/openfoam-schemes-review/tips-p25-robust-diffusive.png)

### Accurate and stable numerical scheme

![精度与稳定性兼顾的格式](/images/openfoam-schemes-review/tips-p26-accurate-stable.png)

### Accurate but oscillatory scheme

![高精度但易振荡的格式](/images/openfoam-schemes-review/tips-p27-accurate-oscillatory.png)

## 拉普拉斯项格式

A robust setup:

![拉普拉斯项的稳健设置](/images/openfoam-schemes-review/wolf-p761-laplacian-robust.png)

如果网格全正交:

![全正交网格的设置](/images/openfoam-schemes-review/tips-p29-orthogonal-limited.png)

也可以用调参的那种:

![带限制器参数的设置](/images/openfoam-schemes-review/tips-p29-tuned-limiter.png)

![limited 系数说明](/images/openfoam-schemes-review/tips-p30-laplacian-blend.png)

#### Accurate on orthogonal meshes (very good mesh quality with uniform cell size)

![正交均匀网格上的高精度设置](/images/openfoam-schemes-review/tips-p32-orthogonal-accurate.png)

#### Accurate on non-uniform orthogonal meshes

![非均匀正交网格的高精度设置](/images/openfoam-schemes-review/tips-p33-nonuniform-orthogonal.png)

#### Less accurate numerical scheme valid on non-uniform non-orthogonal meshes

![非均匀非正交网格上仍有效的格式](/images/openfoam-schemes-review/tips-p34-nonorthogonal-valid.png)

## 梯度项格式

OpenFOAM 的 leastSquares 有一个已知问题——在四面体网格上容易振荡:

![leastSquares 在 tet 网格上的振荡倾向](/images/openfoam-schemes-review/tips-p35-leastsquares-issue.png)

这一点说明:OpenFOAM 不能像 Fluent 一样默认用最小二乘来处理 bad mesh。

gradient limiters:

![梯度限制器设置](/images/openfoam-schemes-review/tips-p36-gradient-limiters.png)

## 高非正交网格的工程化参数

> NOTE: 类似这种高非正交网格的参数设置,可以视为「工程化参数」。解决这类工程计算问题,是 OpenFOAM 走向工业应用的重要方向。

![高非正交网格的格式组合](/images/openfoam-schemes-review/tips-p40-high-nonorth-settings.png)

### Non-orthogonality 70~85

`nNonOrthgonalCorrectors 3;`

![70~85 度的推荐配置](/images/openfoam-schemes-review/tips-p41-nonorth-70-85.png)

### Non-orthogonality 60~70

`nNonOrthgonalCorrectors 2;`

![60~70 度的推荐配置](/images/openfoam-schemes-review/tips-p42-nonorth-60-70.png)

### Non-orthogonality 40~60

`nNonOrthgonalCorrectors 1;`

![40~60 度的推荐配置](/images/openfoam-schemes-review/tips-p43-nonorth-40-60.png)

## 深入理解:upwind 的人工粘性

一阶迎风(`Gauss upwind`)为什么稳?为什么"糊"?答案是截断误差分析:它的截断误差中,包含了一个数学形式上与物理扩散项完全一致的二阶导数项。

### 1. 建立模型方程

只看一维纯对流方程,常速度 $u > 0$,输运标量 $\phi$:

$$ \frac{\partial \phi}{\partial t} + u \frac{\partial \phi}{\partial x} = 0 $$

解析解的波形应一直向右平移,形状不变(无扩散)。

### 2. 有限体积离散

一维均匀网格(间距 $\Delta x$),对控制体中心 $P$ 和上游节点 $W$($i-1$),一阶迎风认为界面值等于上游网格中心值:

$$ \phi_f \approx \phi_W $$

对流项离散(等效后向差分):

$$ \frac{\partial \phi}{\partial x}\Bigg|_P \approx \frac{\phi_P - \phi_W}{\Delta x} $$

### 3. 泰勒级数展开(核心步骤)

将 $\phi_W = \phi(x - \Delta x)$ 在点 $P$(即 $x$)处展开:

$$ \phi_W = \phi_P - \Delta x \left( \frac{\partial \phi}{\partial x} \right)_P + \frac{(\Delta x)^2}{2} \left( \frac{\partial^2 \phi}{\partial x^2} \right)_P - \frac{(\Delta x)^3}{6} \left( \frac{\partial^3 \phi}{\partial x^3} \right)_P + O(\Delta x^4) $$

### 4. 推导截断误差

代入第 2 步的离散公式:

$$
\begin{aligned}
\frac{\phi_P - \phi_W}{\Delta x} &= \frac{\phi_P - \left[ \phi_P - \Delta x \frac{\partial \phi}{\partial x} + \frac{\Delta x^2}{2} \frac{\partial^2 \phi}{\partial x^2} - \dots \right]}{\Delta x} \\
&= \frac{\partial \phi}{\partial x} \underbrace{- \frac{\Delta x}{2} \frac{\partial^2 \phi}{\partial x^2} + O(\Delta x^2)}_{\text{截断误差 (Truncation Error)}}
\end{aligned}
$$

### 5. 修正方程 (The Modified Equation)

把含误差的离散形式带回物理方程,看计算机实际在解什么:

$$ \frac{\partial \phi}{\partial t} + u \frac{\partial \phi}{\partial x} = \underbrace{\left( \frac{u \Delta x}{2} \right)}_{\nu_{num}} \frac{\partial^2 \phi}{\partial x^2} $$

右边多出来的这一项:

1. **数学形式**:$\frac{\partial^2 \phi}{\partial x^2}$,二阶空间导数——正是**扩散/粘性**项的形式。
2. **系数量纲**:$\nu_{num} = \frac{u \Delta x}{2}$;$u$ 的单位 $[L/T]$ 乘 $\Delta x$ 的 $[L]$ 得 $[L^2/T]$——**正是运动粘度 $\nu$ 的单位**。

### 6. 物理与工程解释

用 `Gauss upwind` 离散对流项,实际上是在解一个带"数值粘度"的对流扩散方程:

$$ \nu_{num} = \frac{u \Delta x}{2} $$

这意味着:

1. **与网格有关**:网格越粗($\Delta x$ 越大),数值粘度越大——粗网格流场特别"糊"的原因。
2. **与流速有关**:$u$ 越大,数值粘度越大。
3. **稳定性的来源**:物理粘度很小时(高雷诺数),$\nu_{num}$ 像强力减震器,把数值波动全部抹平。

### 7. 对比:为什么中心差分 (Gauss linear) 不糊但易崩?

对 `Gauss linear`(二阶中心差分)做同样的泰勒展开,首项误差是 $\frac{\partial^3 \phi}{\partial x^3}$(三阶导数):

- 奇数阶导数导致**色散 (Dispersion)**——波纹和振荡,而非扩散
- 所以 `Gauss linear` 没有数值粘度,精度高,但大梯度处不配限制器会发散

**一句话总结**:「将对流项设置为 Gauss upwind」在数学上等价于「向 N-S 方程添加了一个系数为 $\frac{u \Delta x}{2}$ 的额外粘度项」。计算初期用一阶格式,本质是用数学误差产生的虚假粘度人为增加系统阻尼,换取收敛稳定性。

## 深入理解:DEShybrid 混合格式

高雷诺数 DES 模拟中,`DEShybrid` 是 OpenFOAM 最关键的对流项格式。DES 的尴尬在于:全用二阶上风(`linearUpwind`),数值耗散会把瞬态小涡抹平,DES 退化回 RANS;全用中心差分(`linear`),高雷诺数对流占优区域会数值振荡直接崩溃。`DEShybrid` 通过物理准则在两者间动态切换。

### 数学原理:混合权重

$$
\phi_f = (1 - \sigma)\cdot \phi_{CD}+\sigma \phi_{LU}
$$

- $\sigma \to 0$:中心差分(`linear`),无数值耗散,LES 区域捕捉涡结构
- $\sigma \to 1$:二阶上风(`linearUpwind`),数值稳定,RANS 区域(近壁面)

切换判据基于局部网格分辨率与湍流长度尺度的比值,实现中关联于 $C_{DES} \Delta$ 与壁面距离 $d$ 的关系。

### 字典配置(v2406)

```cpp
divSchemes
{
    default         none;

    // 针对速度 U 的对流项
    div(phi,U)      Gauss DEShybrid
                    linear                      // 方案1:中心差分 (LES区使用)
                    linearUpwind grad(U)        // 方案2:二阶上风 (RANS区使用)
                    0.65                        // CDES 系数,需与湍流模型匹配
                    delta                       // 过滤宽度定义,通常为 delta
                    30                          // C_blending (混合控制常数)
                    2                           // n (混合因子幂次)
                    0.01;                       // b (限制器小量)
}
```

参数物理意义:

1. **`linear`**:LES 区域使用的低耗散格式
2. **`linearUpwind grad(U)`**:壁面 RANS 区域或流场剧变区的稳定格式
3. **`0.65` (CDES)**:DES 模型核心常数,必须与 `momentumTransport` 里的设置一致,否则切换点物理错位
4. **`30` (C_blending)**:切换陡峭程度,越大切换越快
5. **`2` (n)**:混合函数随网格变化的衰减速度幂次
6. **`0.01` (b)**:阈值,防止极小速度或奇点处的数学异常

### 为什么泄洪道模拟必须用它

泄洪道(Spillway)流场呈显著层级特征:

- **近壁面粘性底层/对数律层(RANS 区域)**:剪切极强。中心差分会让壁面应力因数值振荡失真,`DEShybrid` 自动识别 RANS 屏蔽区,切到 `linearUpwind` 保证壁面应力平滑
- **水舌/掺气/回流区(LES 区域)**:大尺度涡发育,需要捕捉能量级串。`DEShybrid` 识别到网格尺度远小于壁面距离,切到 `linear`,让动能不被离散格式"吃掉"

### 调试建议

1. **计算崩溃 (Floating Point Exception)**:减小 `C_blending`(如降到 20),或把 `linear` 暂换成 `limitedLinear 1.0` 增加鲁棒性
2. **流场太"秃"(看不到细碎小涡)**:数值耗散过重。检查主流区网格是否太粗,导致 `DEShybrid` 错误地一直停留在 `linearUpwind` 模式
3. `linearUpwind` 对网格正交性敏感,圆管段非正交角高时,`nNonOrthogonalCorrectors` 建议设 **2** 配合使用

## 深入理解:梯度格式对比(GGCB / GGNB / LSCB)

Fluent 的 Gradient 选项里,Green-Gauss Cell Based、Green-Gauss Node Based、Least Squares Cell Based 在数学实现上的本质差异,直接决定通量重构质量。GUI 位置:`Solution Methods → Spatial Discretization → Gradient`。

### Green-Gauss 系列方法

基于格林-高斯定理,体积分转面积分:

$$ \int_V \nabla \phi dV = \oint_{\partial V} \phi \vec{n} dA $$

离散形式:

$$ \nabla \phi_{c0} = \frac{1}{V_{c0}} \sum_{f} \bar{\phi}_f \vec{A}_f $$

关键区别在面心值 $\bar{\phi}_f$ 的求法:

**Green-Gauss Cell Based (GGCB)**:面心值 = 相邻两单元中心的算术平均

$$ \bar{\phi}_f = \frac{\phi_{c0} + \phi_{c1}}{2} $$

物理缺陷:该假设仅在均匀正交网格上成立。非结构网格中面心不在两体心连线上(Skewness),或两体心到面心距离不等,算术平均引入零阶误差,导致发散或伪扩散。

**Green-Gauss Node Based (GGNB)**:先算节点值 $\phi_{node}$,面心值 = 面上节点平均

$$ \bar{\phi}_f = \frac{1}{N_{nodes}} \sum_{n \in f} \phi_{n} $$

节点值通过周围共享该节点的单元中心值加权平均求得。节点天然位于几何角点,即使网格倾斜严重,节点插值的面心值也比体心平均准确得多。

### Least Squares Cell Based (LSCB)

不使用格林-高斯定理,基于泰勒级数展开。对任意相邻单元 $i$:

$$ \phi_i = \phi_{c0} + \nabla \phi_{c0} \cdot (\vec{r}_i - \vec{r}_{c0}) + O(\Delta r^2) $$

忽略高阶项,找梯度向量使加权误差平方和最小:

$$ \min \sum_{i}^{neighbors} w_i \cdot E_i^2 $$

实际是解一个 $3 \times 3$ 线性方程组(3D)。

### 数值行为与实现难度对比

| 方法 | 数值行为 | 实现要点 |
|---|---|---|
| **GGCB** | 极不稳定(除非完美六面体网格);非结构网格上二阶迎风降级,精度甚至不如一阶 | Fluent 保留仅为兼容旧版,**不要作为对标基准** |
| **GGNB** | 高扭曲度网格上最稳定 | 节点加权算法(IDW)是关键难点,具体加权形式属未公开细节,难以完美对标 |
| **LSCB** | Fluent 默认;多面体/非结构网格上精度成本最佳平衡;不产生棋盘格压力场,严格二阶 | 数学定义"硬",只需正确构建几何矩阵 |

### LSCB 实现细节(对标 Fluent)

1. **权重因子**:标准实现 $w_i = \frac{1}{\|\vec{r}_i - \vec{r}_{c0}\|^2}$,近邻权重更大,增强对角占优。Fluent 具体形式可能是 $1/r$ 或 $1/r^2$,建议从 $1/r^2$ 起步
2. **矩阵预计算**:静止网格的几何矩阵 $[M] = (H^T W H)^{-1} H^T W$ 只算一次,求解循环里梯度 = 矩阵向量乘 $\nabla \phi = [M] \cdot \Delta \Phi$,比每次重构节点的 GGNB 快得多
3. **扩展邻居**:Fluent 默认仅面相邻;标准验证请严格基于面相邻单元实现
4. **边界处理**:边界面中心视为一个"邻居",$\phi_{face}$ 依边界条件(Dirichlet/Neumann)而定;Neumann 约束通过 Lagrange 乘子或直接代入矩阵

### 选型结论

1. **首选 LSCB**:Fluent 默认、现代 CFD 主流、数学定义封闭、易复现
2. **次选 GGNB**:仅当网格极差(Skewness > 0.85)且 LSCB 振荡时;但节点权重黑盒,完全对标困难
3. **避免 GGCB**:过时,不适合现代非结构求解器

---

*来源:Wolfdy OpenFOAM 教程(2020)及 supplement "Tips and tricks in OpenFOAM" 幻灯片,叠加个人笔记与 AI 对话整理的数学推导。*
