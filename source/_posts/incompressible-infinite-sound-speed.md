---
title: 不可压问题为什么默认声速无限大
date: 2026-10-10 12:00:00
categories:
  - [CFD, 理论, 不可压缩流动]
tags:
  - CFD/理论/不可压缩流动
  - OpenFOAM
  - 声速
  - 马赫数
  - Poisson方程
description: 从热力学声速定义与低马赫渐近推导出发，证明不可压缩假设在数学上等价于声速无穷大，并逐行对照 OpenFOAM-13 源码、用 cavity 算例实测验证。
mathjax: true
---

# 不可压问题为什么默认声速无限大

初学 CFD 的人常听到一句话："不可压缩流动里声速是无穷大的"。这句话听起来像物理描述，其实它是一个**数学模型的推论**，而不是真实流体的性质——20 °C 的水中声速约 1481 m/s，空气约 343 m/s，都是有限的。本文要回答三个问题：

1. "不可压 ⇔ 声速无穷大" 这个等价关系在数学上如何严格成立（热力学定义、低马赫渐近、方程类型分析）；
2. OpenFOAM-13 的源码把这件事编码在了哪里（`psi`、压力 Poisson 方程、Courant 数）；
3. 用 `cavity` 算例实跑验证：一个时间步内压力扰动就"瞬时"传遍整个计算域。

---

## 1 声速的热力学定义：介质刚度的度量

声速的标准定义来自等熵过程小扰动的传播速度：

$$
a^2=\left(\frac{\partial p}{\partial \rho}\right)_s
\tag{1}\label{eq:def-a}
$$

引入等熵体积模量（isentropic bulk modulus）$K_s=\rho\left(\dfrac{\partial p}{\partial \rho}\right)_s$，式 \eqref{eq:def-a} 可以改写为 Newton–Laplace 公式：

$$
a=\sqrt{\frac{K_s}{\rho}}
\tag{2}\label{eq:newton-laplace}
$$

它把声速解释为**介质抗拒压缩的刚度**除以惯性（密度）。这个视角立刻给出两个经典结论：

- **理想气体**：$a^2=\gamma p/\rho=\gamma R T$，其中 $\gamma=c_p/c_v$。牛顿当年用玻意耳定律（等温关系 $K_T=p$）计算，得到 $a=\sqrt{p/\rho}$，比实测少了 $\sqrt{\gamma}$ 倍——因为他弄错了扰动的刚度（等温 vs 等熵），拉普拉斯修正了这一点。
- **不可压缩介质**：不可压的定义是密度不随压力变化，对任意 $dp$ 都有 $d\rho=0$，即

$$
\left(\frac{\partial \rho}{\partial p}\right)_s = 0
\quad\Longrightarrow\quad
K_s=\infty
\quad\Longrightarrow\quad
a=\infty
\tag{3}\label{eq:incomp-a}
$$

所以"声速无限大"并不是说真有什么东西跑得比声波快，而是说：**在这个模型里，密度对流体压力的刚度被取为无穷大**。介质"无限硬"，任何压力扰动不需要时间就能传遍全场——压力场不再是"传播"出来的，而是每一时刻由约束条件**整体求解**出来的。

反过来读式 \eqref{eq:incomp-a} 同样重要：声速描述的是状态方程里 $p$ 与 $\rho$ 的耦合刚度；说"不可压 = 声速无穷大"，等价于说"状态方程对压力不再提供任何约束"。下文会看到，这正是 OpenFOAM 里 `psi = 0` 的含义。

---

## 2 严格推导之一：低马赫渐近——压力方程退化成约束

第 1 节是热力学层面的论证。更严格地，应当从可压缩 Navier–Stokes 方程出发，证明 $M\to 0$（$M=U/a$，马赫数）时方程组**结构性地**退化为不可压形式。这是低马赫渐近（low-Mach asymptotics）的标准内容（Majda & Bertozzi, 2002）。

### 2.1 压力—密度耦合进入连续性方程

考虑正压（barotropic）流动 $\rho=\rho(p)$。沿流体质点：

$$
\frac{D\rho}{Dt}=\frac{d\rho}{dp}\frac{Dp}{Dt}=\frac{1}{a^2}\frac{Dp}{Dt}
\tag{4}\label{eq:drho}
$$

代入连续性方程 $\dfrac{D\rho}{Dt}+\rho\nabla\cdot\boldsymbol{U}=0$，得到**压力演化方程**：

$$
\boxed{\ \frac{1}{a^2}\frac{Dp}{Dt}+\rho\,\nabla\cdot\boldsymbol{U}=0\ }
\tag{5}\label{eq:p-evolve}
$$

这个式子是全文的枢纽：它说明可压缩流动中，压力通过状态方程"记住"了密度的变化率，$1/a^2$ 正是这份记忆的强度。**声速有限 ⇔ 压力有自己的演化方程**。

### 2.2 无量纲化与马赫数展开

取特征量：长度 $L$、速度 $U$、时间 $L/U$、参考密度 $\rho_0$、参考声速 $a_0$，并定义马赫数 $M=U/a_0$。关键一步：动力学压力用**动压尺度** $\rho_0 U^2$ 无量纲化，$p=p_{\mathrm{ref}}+\rho_0U^2\,\hat p$（参考值 $p_{\mathrm{ref}}$ 为常数，不参与物质导数）。代入式 \eqref{eq:p-evolve}：

$$
\frac{1}{a_0^2}\cdot\frac{\rho_0U^2}{L/U}\frac{D\hat p}{D\hat t}+\rho_0\frac{U}{L}\hat\rho\,\hat{\nabla}\cdot\hat{\boldsymbol{U}}=0
\tag{6}
$$

两边除以 $\rho_0 U/L$，并注意 $a_0=U/M$：

$$
\boxed{\ M^2\frac{D\hat p}{D\hat t}+\hat\rho\,\hat{\nabla}\cdot\hat{\boldsymbol{U}}=0\ }
\tag{7}\label{eq:nondim}
$$

马赫数作为唯一的奇异参数出现了。取极限 $M\to 0$：

$$
\nabla\cdot\boldsymbol{U}=0
\tag{8}\label{eq:divfree}
$$

散度约束出现，而压力的时间导数项**整项消失**。这就是"声速无穷大"在方程组结构上的体现：$M\to 0$ 与 $a\to\infty$ 是同一件事的两种说法（固定 $U$ 时 $M=U/a$）。压力不再由式 \eqref{eq:p-evolve} 演化，而是退化为一个**代数/椭圆约束**的乘子（见第 3 节）。

### 2.3 压力的双重角色被拆开

把压力按马赫数做渐近展开（以热力学尺度 $\rho_0 a_0^2$ 无量纲化）：

$$
p = p^{(0)}(t)+M^2p^{(2)}(\boldsymbol{x},t)+O(M^4)
\tag{9}\label{eq:split}
$$

展开的结论是（推导见 Majda & Bertozzi 或 Klein 的综述）：

- **$p^{(0)}(t)$：热力学压力**。空间均匀、只随时间变化（封闭系统中由总质量守恒确定），它通过状态方程 $\rho=\rho(p^{(0)},T)$ 决定密度水平，但空间均匀意味着 $\nabla p^{(0)}=0$，**不进入动量方程**。
- **$p^{(2)}(\boldsymbol{x},t)$：动力学压力**。才是动量方程里 $\nabla p$ 的来源，它不由状态方程决定，而是充当散度约束 \eqref{eq:divfree} 的**拉格朗日乘子**。

也就是说，$M\to 0$ 时压力的两个角色——"热力学量"与"力学量"——**彻底解耦**。声速本来度量的是热力学角色中 $p\text{-}\rho$ 耦合的刚度；解耦之后这份刚度不再出现，等效于 $a=\infty$。这解释了一个新手常见困惑：**不可压求解器算出来的压力是相对量（gauge）**，它的绝对水平没有任何热力学意义，因为热力学压力 $p^{(0)}$ 已经被分离出去了。

### 2.4 M < 0.3 判据从哪来

展开式 \eqref{eq:nondim} 同时给出密度的相对变化量级 $\Delta\rho/\rho=O(M^2)$。用等熵滞止关系可以算得更精确：

$$
\frac{\rho}{\rho_0}=\left[1+\frac{\gamma-1}{2}M^2\right]^{-\frac{1}{\gamma-1}}
=1-\frac{M^2}{2}+O(M^4)
\tag{10}\label{eq:m03}
$$

取 $M=0.3$、$\gamma=1.4$：$\Delta\rho/\rho\approx 4.4\%$。这就是工程上"$M<0.3$ 可按不可压处理"的来源——密度变化被压到百分之几以下。对水这样的液体，$K_s\approx2.2\ \mathrm{GPa}$，同样 $300\ \mathrm{m/s}$ 的流速对应 $M\approx0.2$，日常水流几乎总是不可压的。

---

## 3 严格推导之二：波动方程退化为泊松方程

第 2 节证明约束如何出现。这一节从方程类型（数学结构）上论证"无穷大传播速度"。

### 3.1 可压缩：线性化给出波动方程（双曲，有限速度）

一维无粘流动，均匀背景 $(p_0,\rho_0)$ 上叠加小扰动 $(p',\rho',u')$。线性化连续性方程、动量方程和等熵状态方程：

$$
\frac{\partial\rho'}{\partial t}+\rho_0\frac{\partial u'}{\partial x}=0,
\qquad
\rho_0\frac{\partial u'}{\partial t}+\frac{\partial p'}{\partial x}=0,
\qquad
p'=a_0^2\rho'
\tag{11}\label{eq:linear}
$$

对第一式求 $\partial/\partial t$，利用第二式消去 $u'$，再用第三式消去 $\rho'$：

$$
\frac{\partial^2\rho'}{\partial t^2}
=-\rho_0\frac{\partial^2 u'}{\partial x\partial t}
=+\frac{\partial^2 p'}{\partial x^2}
=a_0^2\frac{\partial^2\rho'}{\partial x^2}
\quad\Longrightarrow\quad
\boxed{\ \frac{\partial^2 p'}{\partial t^2}=a_0^2\nabla^2 p'\ }
\tag{12}\label{eq:wave}
$$

波动方程，**双曲型**，扰动的传播速度严格等于 $a_0$，信息沿特征锥传播、有因果结构。这是"声"的数学本体。

### 3.2 不可压：取散度给出泊松方程（椭圆，瞬时）

现在做不可压假设。对（已除以 $\rho$ 的）动量方程取散度，常密度 $\rho$：

$$
\frac{\partial(\nabla\cdot\boldsymbol{U})}{\partial t}
+\nabla\cdot\big[(\boldsymbol{U}\cdot\nabla)\boldsymbol{U}\big]
=-\frac{1}{\rho}\nabla^2 p
+\nu\underbrace{\nabla^2(\nabla\cdot\boldsymbol{U})}_{=0}
\tag{13}\label{eq:div-mom}
$$

粘性项恒消失：$\nabla^2(\nabla\cdot\boldsymbol{U})=\nabla\cdot(\nabla^2\boldsymbol{U})$，而对无散场 $\nabla\cdot\boldsymbol{U}\equiv0$ 处处成立，其对时间的导数同样为零。于是：

$$
\boxed{\ \nabla^2 p=-\rho\,\nabla\cdot\big[(\boldsymbol{U}\cdot\nabla)\boldsymbol{U}\big]
=-\rho\,\frac{\partial u_i}{\partial x_j}\frac{\partial u_j}{\partial x_i}\ }
\tag{14}\label{eq:poisson}
$$

这是**泊松方程，椭圆型**。对比式 \eqref{eq:wave} 与式 \eqref{eq:poisson}：

| | 可压缩 | 不可压 |
|---|---|---|
| 压力满足的方程 | $\partial_t^2 p=a^2\nabla^2 p$（波动） | $\nabla^2p=f(\boldsymbol{U})$（泊松） |
| 方程类型 | 双曲 | 椭圆 |
| 时间导数 | 二阶 | **没有** |
| 压力由什么决定 | 初值 + 传播 | **当前速度场的约束，瞬时全域求解** |
| 扰动传播速度 | $a$（有限） | $\infty$ |

椭圆方程的解依赖**整个边界和全域源项**，一点的变化瞬间反映到所有点——数学上没有传播过程，等效传播速度就是无穷大。这就是"声速无限大"最精确的表述：**不可压模型里根本不存在波动方程，压力不是传播量，而是每一步重解一次的全局约束的乘子**。附带一个漂亮的推论：若流动还是无旋的，$(\boldsymbol{U}\cdot\nabla)\boldsymbol{U}=\nabla(|\boldsymbol{U}|^2/2)$，式 \eqref{eq:poisson} 化为 $\nabla^2\!\left(p/\rho+|\boldsymbol{U}|^2/2\right)=0$，即微分形式的伯努利方程。

### 3.3 数值视角：显式格式的死路与 Chorin 的人工可压缩

从数值分析看，这件事有一个著名的表现。对双曲系统做显式时间推进，稳定性要求（声学 CFL）：

$$
\Delta t\le\frac{\Delta x}{|u|+a}
\tag{15}\label{eq:cfl}
$$

若 $a=\infty$，**任何有限步长都违反 CFL**——显式推进不可压压力在原理上不可能。这就是为什么不可压流动必须每个时间步解一次椭圆泊松问题（投影法 / SIMPLE / PISO），而不能像可压缩流那样"一步一推进"。

反过来，Chorin（1967）的**人工可压缩法**（artificial compressibility）从反面证明了"不可压 = 声速无穷大"：既然式 \eqref{eq:p-evolve} 在 $1/a^2\to0$ 时退化为约束，那就人为给它加回一个有限的"声速" $\beta$，在伪时间 $\tau$ 上推进：

$$
\frac{\partial p}{\partial\tau}+\beta\,\nabla\cdot\boldsymbol{U}=0
\tag{16}\label{eq:chorin}
$$

$\beta$ 是人为压缩率。稳态时 $\partial p/\partial\tau\to0$ 恢复 $\nabla\cdot\boldsymbol{U}=0$。这个方法之所以叫"人工"可压缩，正是因为它**虚构了一个有限声速**来换取双曲性——承认了被不可压模型扔掉的声速本来就是无穷大。

---

## 4 OpenFOAM-13 源码对照

理论讲完了，现在看 OpenFOAM-13（OpenFOAM Foundation 版）怎么把这件事写进代码。13 版已用模块化求解器：统一入口 `foamRun`，由 `system/controlDict` 里的 `solver` 关键字选择模块。不可压缩流动对应 `incompressibleFluid`（取代了旧的 `icoFoam`/`pisoFoam`/`pimpleFoam` 等单一用途求解器）。

### 4.1 动量方程：运动学形式，p 的量纲就是证据

`applications/modules/incompressibleFluid/momentumPredictor.C:37-52`：

```cpp
tUEqn =
(
    fvm::ddt(U) + fvm::div(phi, U)
  + MRF.DDt(U)
  + momentumTransport->divDevSigma(U)
 ==
    fvModels().source(U)
);
...
solve(UEqn == -fvc::grad(p));
```

整个方程**除以过 $\rho$**：没有密度、没有能量方程、没有状态方程。案例文件 `cavity/0/p` 里压力的量纲是：

```
dimensions      [0 2 -2 0 0 0 0];   // m²/s²
```

这是**运动学压力** $p/\rho$，单位 m²/s²——第 2.3 节"热力学角色被剥离"的直接物证：这里连热力学压力的量纲都没给。

### 4.2 压力方程：一个没有时间导数的纯泊松问题

`applications/modules/incompressibleFluid/correctPressure.C:89-91`（非正交修正循环内）：

```cpp
fvScalarMatrix pEqn
(
    fvm::laplacian(rAtU(), p)
 ==
    fvc::div(phiHbyA)
  - p_rghEqnSource
);
```

矩阵左端只有 `laplacian`（隐式椭圆算子），**没有任何 `ddt` 项**。它正是式 \eqref{eq:poisson} 的离散 Rhie–Chow 形式。推导对应关系：把动量方程的离散写成

$$
A_P\boldsymbol{U}_P=H(\boldsymbol{U})-\nabla p
\quad\Longrightarrow\quad
\boldsymbol{U}=\underbrace{r_A H(\boldsymbol{U})}_{\boldsymbol{HbyA}}-r_A\nabla p
\tag{17}\label{eq:rhie}
$$

其中 $r_A=1/A_P$（代码里的 `rAU`）。代入散度约束 \eqref{eq:divfree}：

$$
\nabla\cdot(r_A\nabla p)=\nabla\cdot\boldsymbol{HbyA}
\tag{18}\label{eq:of-poisson}
$$

左端即 `fvm::laplacian(rAtU(), p)`，右端即 `fvc::div(phiHbyA)`——与式 \eqref{eq:poisson} 逐项对应。对比可压缩求解器（下节）就能看出：**"声学项"被整项删除，而不是被隐式化**。

随后 `phi = phiHbyA - pEqn.flux()`（`correctPressure.C:107`）和 `U = HbyA - rAtU*fvc::grad(p)`（`:116`）完成投影，`continuityErrors()` 打印的 "time step continuity errors" 就是约束残差的度量。

### 4.3 可压缩对照：`psi` 项就是被删掉的那一项

`applications/modules/isothermalFluid/correctPressure.C:177-187`（非跨声速分支）：

```cpp
fvScalarMatrix pDDtEqn
(
    fvc::ddt(rho) + psi*correction(fvm::ddt(p))
  + fvc::div(phiHbyA)
 ==
    fvModels().sourceProxy(rho, p)
);

fvScalarMatrix pEqn(pDDtEqn - fvm::laplacian(rhorAAtUf, p));
```

对比 4.2：多出的 `psi*correction(fvm::ddt(p))` 与 `fvc::ddt(rho)` 合起来正是物质导数 $D\rho/Dt$ 的离散——即式 \eqref{eq:p-evolve} 里那个 $\frac{1}{a^2}\frac{Dp}{Dt}$ 项。**当 `psi = 0`，这个方程逐项退化成 4.2 的纯泊松方程**。也就是说，`incompressibleFluid` 的压力方程 = `isothermalFluid` 的压力方程取 $\psi\to0$ 极限。"不可压 = 声速无穷大"在 OpenFOAM 里被编码为"压力方程删去 $\psi\,\partial p/\partial t$ 项"。

### 4.4 `psi` 的定义：字面意义上就是 1/a²

`psi` 是 OpenFOAM 对**等温压缩率**的记号（`src/thermophysicalModels/basic/fluidThermo/fluidThermo.H:106` 注释 `Compressibility [s^2/m^2]`）。对完全气体（`src/thermophysicalModels/specie/equationOfState/perfectGas/perfectGasI.H:111`）：

```cpp
return 1.0/(this->R()*T);   // psi = 1/(R*T)
```

由理想气体状态方程 $\rho=p/(RT)$ 直接求偏导：

$$
\psi\equiv\left(\frac{\partial\rho}{\partial p}\right)_T=\frac{1}{RT}
=\frac{1}{a_T^2}
\quad\Longrightarrow\quad
a^2=\gamma a_T^2=\frac{\gamma}{\psi}
\tag{19}\label{eq:psi}
$$

注意量纲：$\psi$ 的单位是 $\mathrm{s^2/m^2}$——**$\psi$ 就是（等温）声速平方的倒数**。于是"不可压 ⇔ $\psi=0$ ⇔ 声速无穷大"三个陈述完全等价：

$$
\left(\frac{\partial\rho}{\partial p}\right)_s=0
\;\Longleftrightarrow\;
\psi=0
\;\Longleftrightarrow\;
a=\infty
\tag{20}\label{eq:equiv}
$$

更有说服力的是，OpenFOAM 甚至提供了一个状态方程把这个等价关系**显式写死**——`incompressiblePerfectGas`（密度只随温度变：$\rho=p_{\mathrm{ref}}/(RT)$，`src/thermophysicalModels/specie/equationOfState/incompressiblePerfectGas/incompressiblePerfectGasI.H:146-151`）：

```cpp
template<class Specie>
inline Foam::scalar Foam::incompressiblePerfectGas<Specie>::psi
(
    scalar p,
    scalar T
) const
{
    return 0;   // psi ≡ 0  ⇔  声速无穷大
}
```

`return 0;`——低马赫热流（如自然对流）想要密度随温度变化但**不随压力变化**时，就用它：热力学上保留浮力，声学上依然是无限声速。

### 4.5 Courant 数：流动 CFL 有，声学 CFL 无

不可压缩模块的库朗数在基类里（`applications/modules/fluidSolver/fluidSolver.C:106-123`）：

```cpp
const scalarField sumPhi
(
    fvc::surfaceSum(mag(phi))().primitiveField()/rho.primitiveField()
);
CoNum_ = 0.5*gMax(sumPhi/mesh.V().primitiveField())*runTime.deltaTValue();
```

即 $Co=\dfrac{\Delta t}{2V_P}\sum_f|\boldsymbol{U}_f\cdot\boldsymbol{S}_f|$——**只含流速**。对比激波求解器 `shockFluid`（继承自旧 `rhoCentralFoam`，`applications/modules/shockFluid/shockFluid.C:50-63` 与 `fluxPredictor.C:116-125`）：

```cpp
aphiv_pos = surfaceScalarField::New("aphiv_pos", phiv_pos - aSf());
aphiv_neg = surfaceScalarField::New("aphiv_neg", phiv_neg + aSf());
...
correctCoNum(max(mag(aphiv_pos()), mag(aphiv_neg())));
```

`aSf` 是声速通量 $a|\boldsymbol{S}|$，所以每面的波速是 $|\boldsymbol{U}\cdot\boldsymbol{n}|+a$——**声学库朗数**，正是式 \eqref{eq:cfl} 的形式。而不可压求解器里 $a=\infty$，声学 CFL 无从定义也无须满足：压力波不是被"推进"的，是在一个时间步内由线性求解器（GAMG）全局解出的。时间步长只受流动 Courant 数和精度约束。

### 4.6 压力参考值：绝对水平不确定的又一物证

`correctPressure.C` 里的 `pEqn.setReference(pressureReference.refCell(), pressureReference.refValue())`：当边界全部是 `zeroGradient`（Neumann）时，泊松问题 \eqref{eq:poisson} 的解相差一个任意常数，必须在某一点钉一个参考值。这正是第 2.3 节的结论在数值上的体现——**不可压压力是拉格朗日乘子，只有梯度有意义**，与状态方程完全解耦，自然没有绝对水平。

---

## 5 实跑验证：cavity 算例

理论归理论，跑一遍看结果。把 OpenFOAM-13 的标准教程 `cavity` 原样复制出来运行，未做任何物理修改：

```bash
cp -r ~/OpenFOAM/OpenFOAM-13/tutorials/incompressibleFluid/cavity ./cavity
cd cavity
blockMesh
foamRun          # controlDict: solver incompressibleFluid
```

算例参数：$0.1\times0.1$ m 方腔、$20\times20$ 网格、lid 速度 1 m/s、$\nu=10^{-5}\ \mathrm{m^2/s}$（$Re=10^4$，RAS $k$–$\epsilon$）、$\Delta t=0.005$ s，共 2000 步跑完（3 秒钟墙钟时间）。

### 5.1 日志证据

`log.foamRun` 每个时间步的输出（截取第一步）：

```text
Courant Number mean: 0 max: 0
Time = 0.005s

smoothSolver:  Solving for Ux, ...
GAMG:  Solving for p, Initial residual = 1, Final residual = 0.0378382, No Iterations 2
time step continuity errors : sum local = 5.90272e-06, global = -4.09454e-21
GAMG:  Solving for p, Initial residual = 0.0371368, Final residual = 6.05335e-07, No Iterations 10
time step continuity errors : sum local = 2.15891e-10, global = -1.18002e-21, cumulative = -1.18002e-21
```

三个可读出的信息：

1. **Courant Number 只有流动分量**（4.5 节源码所述），$\Delta t$ 的合法性从不涉及声速；
2. **压力是 GAMG 线性求解器解出来的**（泊松方程），不是显式推进的；
3. `continuity errors` 在一次投影内从 $5.9\times10^{-6}$ 压到 $2.2\times10^{-10}$，2000 步累计仅 $1.2\times10^{-17}$——散度约束由椭圆解每步强制成立，这是式 \eqref{eq:divfree} 作为约束（而非演化方程）的数值形态。

### 5.2 一个时间步内压力传遍全域

更直接的实验（cavity 的单步变体：仅把 `endTime` 改为 `0.005`、`writeInterval` 改为 1，即**只算一步就写出**）：lid 从 $t=0$ 起动，$t=0.005$ s（一个时间步）时的压力场统计：

```text
n = 400                     # 20×20 个单元
min = -0.00835483, max = 0.00941083
cells with |p|>1e-6: 399 / 400
bottom row (j=0,  离 lid 最远):  max|p| = 0.00835   # 与顶行同量级！
top    row (j=19, 紧贴 lid):    max|p| = 0.00941
```

**一步之内，压力扰动出现在所有 400 个单元里**，包括离 lid 最远的底边（幅值与 lid 附近同量级）。把这一步的压力场渲染出来（pyvista 读取 OpenFOAM 原始输出）：

![第一个时间步后的压力场](/images/incompressible-sound-speed/20261010_cavity_p_firststep.png)

**图 1**　仅一个时间步（$t=0.005$ s）后的压力场。lid 前缘高压、右侧角区低压的整体格局已经完整出现——这个场不是从 lid 附近"扩散"出来的，而是一步泊松解直接铺满全域。

对比 2000 步之后的末态压力场：

![末态压力场](/images/incompressible-sound-speed/20261010_cavity_p_final.png)

**图 2**　$t=10$ s（2000 步）末态压力场。空间格局与图 1 同构（量级增大、细节充分发展），印证图 1 的"一步场"已经是全域椭圆解，而不是局部扰动的雏形。

对比真实物理：若介质是空气（$a\approx343$ m/s），扰动穿过 0.1 m 需要 $L/a\approx2.9\times10^{-4}$ s；若是水（$a\approx1481$ m/s）需要 $6.8\times10^{-5}$ s。当然两者都小于 $\Delta t$，真实声波在这一步里也早已往返多次——但关键区别在于：真实物理里压力是**往返传播、多次反射后**才平衡的，而模型里根本没有传播过程，$t=0^+$ 时刻泊松方程就把扰动"铺"到了全域。模型的等效传播速度是 $L/\Delta t$，$\Delta t$ 减半它就翻倍，$\Delta t\to0$ 时趋于无穷——它不受任何有限声速的约束，这正是 $a=\infty$ 的离散表现。

### 5.3 末态流场参考

![末态速度场](/images/incompressible-sound-speed/20261010_cavity_U_final.png)

**图 3**　$t=10$ s 末态速度场（矢量箭头按速度方向定向、颜色为 $|\boldsymbol{U}|$）。$|\boldsymbol{U}|_{\max}=1.0$ m/s 恰为 lid 速度，方腔主涡结构清晰——这是流动尺度 $L/U=0.1$ s 上充分发展后的形态，与图 1 的"第一步"形成对照：**流动结构需要上千步演化，压力约束却在每一步瞬时全域成立**。

### 5.4 时间尺度自洽条件

把分析写成判据形式。不可压模型有意义，要求时间步**分辨流动、不分辨声波**：

$$
\frac{L}{a}\;\ll\;\Delta t\;\lesssim\;\frac{L}{U}
\qquad\Longleftrightarrow\qquad
M\ll1
\tag{21}\label{eq:timescale}
$$

即声学穿越时间被当作零（每步内完成无限次声学弛豫），流动时间被正确分辨。$M=U/a$ 是"想忽略声波"和"想看清流场"这两个要求能同时成立的唯一小参数——与第 2 节的渐近分析殊途同归。

---

## 6 适用边界：什么时候不能假装声速无穷大

理解了假设，就能说清它什么时候失效：

- **声学与波传播问题**（噪声、声共振、超声）不可压求解器原理上无法模拟——没有波动方程就没有波。需要 `shockFluid` 等可压缩模块。
- **水锤（water hammer）**：快速关阀产生的压力波，Joukowsky 公式 $\Delta p=\rho\,a\,\Delta U$。若取 $a=\infty$，公式给出无穷大压力峰值——不可压模型外推到这个场景直接荒谬，必须用有限声速的可压缩（或弱可压缩）模型。
- **低马赫可压缩流动的数值刚性**：显式格式受式 \eqref{eq:cfl} 限制，$\Delta t\sim\Delta x/a$，比流动时间小 $1/M$ 倍。OpenFOAM 的做法是用压力基可压缩求解器（`isothermalFluid`/`fluid` 模块）保留有限 $\psi$ 但隐式处理 $\psi\,\partial p/\partial t$ 项——介于"删项"与"显式受声速限制"之间，兼得精度与效率。
- **自然对流的 Boussinesq 近似**：$\rho=\rho_0[1-\beta(T-T_0)]$，密度只随温度变、不随压力变——仍是 $\psi=0$、仍是无限声速。想要"密度随温度变但不产生声波"的更一般做法就是 4.4 节的 `incompressiblePerfectGas`。

一句话总结：**"默认声速无限大"不是疏忽，而是不可压模型的核心内容**——它删掉了状态方程对压力的刚度（$\psi=0$），删掉了压力的时间演化（波动方程→泊松方程），换来的是每步一个椭圆解、时间步长只受流动约束。什么时候这买卖划算，由式 \eqref{eq:timescale} 也就是马赫数决定。

## 7 总结

| 对比项 | 可压缩（`isothermalFluid`/`shockFluid`） | 不可压（`incompressibleFluid`） |
|---|---|---|
| 状态方程耦合 | $\rho=\rho(p,T)$，$\psi=(\partial\rho/\partial p)_T>0$ | $\psi=0$（`incompressiblePerfectGas::psi()` 返回 0） |
| 声速 | $a=\sqrt{\gamma/\psi}$，有限 | $a=\infty$ |
| 压力方程 | 含 $\psi\,\partial p/\partial t$ 项（波动型贡献） | 纯泊松 `laplacian == div(phiHbyA)` |
| 方程类型 | 双曲成分（波传播） | 椭圆（全局瞬时约束） |
| 压力角色 | 热力学量 + 力学量（Pa） | 仅拉格朗日乘子（m²/s²，相对值） |
| 时间步限制 | 声学 CFL：$\Delta t\le\Delta x/(|u|+a)$（显式类） | 仅流动 Courant 数 |
| 能量/温度方程 | 耦合 | 解耦，可后算 |

本文涉及的前置话题可参考旧文：压力-速度耦合算法总览（[SIMPLE/PISO/PIMPLE](/2026/09/15/simple-piso-pimple-algorithms/)）、[Rhie-Chow 插值](/2026/09/15/rhie-chow-interpolation/)、静水压力的 [p 与 p_rgh](/2026/09/15/p_vs_prgh/)，以及库朗数的展开讨论（[Ur Courant Number](/2026/09/15/ur-courant-number/)）。

## 参考

1. OpenFOAM Foundation, *OpenFOAM-13* 源码（文中标注路径与行号），<https://openfoam.org>。
2. Chorin, A. J. (1967). *A numerical method for solving incompressible viscous flow problems*. J. Comput. Phys., 2(1), 12–26.（人工可压缩）
3. Chorin, A. J. (1968). *Numerical solution of the Navier–Stokes equations*. Math. Comp., 22, 745–762.（投影法）
4. Majda, A. & Bertozzi, A. (2002). *Vorticity and Incompressible Flow*. Cambridge University Press.（低马赫渐近与不可压极限）
5. Ferziger, J. H., Perić, M. & Street, R. L. (2020). *Computational Methods for Fluid Dynamics*, 4th ed. Springer.（不可压压力方程与时间步约束）
6. Kundu, P. K., Cohen, I. M. & Dowling, D. R. (2016). *Fluid Mechanics*, 6th ed. Academic Press.（声速与体积模量）
7. Wikipedia: *Speed of sound* 与 *Incompressible flow*（2026-10-10 访问）：Newton–Laplace 公式、$M<0.3$ 判据与"允许移除声波"的表述。

> 结果图片：文中三张图（`source/images/incompressible-sound-speed/`）由 pyvista 直接读取 OpenFOAM-13 原始输出渲染；案例即标准 `cavity` 教程的未修改副本，三条命令即可复现全部日志与场数据。
