---
title: atmBoundaryLayer 大气边界层边界条件
date: 2026-09-15 12:00:00
categories:
  - [CFD, OpenFOAM, 边界条件]
tags:
  - CFD/OpenFOAM/边界条件
  - 边界条件
  - Cpp
  - OpenFOAM
  - DES
description: OpenFOAM 大气边界层(ABL)边界条件族:对数律入流、湍流量指定与派生类结构。
mathjax: true
---
[OpenFOAM: User Guide: atmBoundaryLayer](https://www.openfoam.com/documentation/guides/latest/doc/guide-bcs-inlet-atm-atmBoundaryLayer.html)

[ABL Boundary condition validation – BARAM Portal](https://baramcfd.org/en/tutorial/baram-flow/atmospheric-boundary-layer/abl-boundary-conditionen/)

[Atmospheric Boundary Layer | How to Set up an ABL | SimScale](https://www.simscale.com/knowledge-base/atmospheric-boundary-layer-abl/)

[OpenFOAM: API Guide: timeVaryingMappedFixedValueFvPatchField< Type > Class Template Reference](https://www.openfoam.com/documentation/guides/v2206/api/classFoam_1_1timeVaryingMappedFixedValueFvPatchField.html)

# atmBoundaryLayer

## 属性（Properties）

- `atmBoundaryLayer` 类是一个用于入口边界条件的基类，提供基于对数律（log-law）的地面法向入流边界条件，用于同质、二维、干空气、平衡且中性的大气边界层（ABL）建模中的风速与湍流量。
- 因此，该类本身不是可直接执行的边界条件，而是其派生条件的通用条目提供者。
- `atmBoundaryLayer` 继承了 [inletOutlet](https://www.openfoam.com/documentation/guides/latest/doc/guide-bcs-outlet-inlet-outlet.html) 边界条件的特性，从而可以从域的各个侧面提供给定的入口条件。例如，地面法向的圆柱域只有一个 inlet/outlet 边界，入口与出口的变化取决于风向与补丁法向，由此任何入流方向的改变都可用同一网格处理（即无需重新生成网格）。


## 代码架构

大气边界条件，对于不同变量有不同的派生类：

![](/images/ABLCondition/20250819_ABLCondition_DiffBC.png)

不同变量实现类，均继承自：1.`inletOutletFvPatchVectorField`，2.`atmBoundaryLayer`

{% mermaid %}
flowchart TB
  %% Inheritance diagram: atmBoundaryLayerInletVelocityFvPatchVectorField derives from both
  %% 'inletOutletFvPatchVectorField' and 'atmBoundaryLayer'
  Derived["atmBoundaryLayerInletVelocity<br/>FvPatchVectorField"]
  Base1["inletOutletFvPatchVectorField"]
  Base2["atmBoundaryLayer"]

  Derived -->|inherits from| Base1
  Derived -->|inherits from| Base2
{% endmermaid %}

### 核心函数


#### atmBoundaryLayerInletVelocityFvPatchVectorField::updateCoeffs

```C++
 void atmBoundaryLayerInletVelocityFvPatchVectorField::updateCoeffs()
 {
     if (updated())
     {
         return;
     }
  
     refValue() = U(patch().Cf());
  
     inletOutletFvPatchVectorField::updateCoeffs(); //OpenFOAM中这个函数跳转了多层
 }
```

其中的`inletOutletFvPatchVectorField::updateCoeffs();`较复杂，

#### atmBoundaryLayer::U，功能：计算大气边界的速度分布

```C++
 tmp<vectorField> atmBoundaryLayer::U(const vectorField& pCf) const
 {
     const scalar t = time_.timeOutputValue();
     const scalarField d(d_->value(t));
     const scalarField z0(max(z0_->value(t), ROOTVSMALL));
     const scalar groundMin = zDir() & ppMin_;
  
     // (YGCJ:Table 1, RH:Eq. 6, HW:Eq. 5)
     scalarField Un
     (
         (Ustar(z0)/kappa_)*log(((zDir() & pCf) - groundMin - d + z0)/z0)
     );
  
     return flowDir()*Un;
 }
```

上述代码对应的公式：
$$ 
u = \frac{u_*}{\kappa}\ln\left(\frac{z - d + z_0}{z_0}\right), \quad v = w = 0 
$$


#### atmBoundaryLayer::k，功能：计算大气边界的湍动能

```C++
 tmp<scalarField> atmBoundaryLayer::k(const vectorField& pCf) const
 {
     const scalar t = time_.timeOutputValue();
     const scalarField d(d_->value(t));
     const scalarField z0(max(z0_->value(t), ROOTVSMALL));
     const scalar groundMin = zDir() & ppMin_;// 取地面patch最小的网格坐标
  
     // (YGCJ:Eq. 21; RH:Eq. 7, HW:Eq. 6 when C1=0 and C2=1)
     return
         sqr(Ustar(z0))/sqrt(Cmu_)
        *sqrt(C1_*log(((zDir() & pCf) - groundMin - d + z0)/z0) + C2_);
 }
```

上述代码对应的公式：
$$ 
    k = \left(\frac{u_*^2}{\sqrt{C_\mu}} \cdot C_1 \ln\left(\frac{z - d + z_0}{z_0}\right) + C_2 \right)^{1/2} 
$$

#### atmBoundaryLayer::epsilon，功能：计算大气模型的比耗散率分布

```C++
 tmp<scalarField> atmBoundaryLayer::epsilon(const vectorField& pCf) const
 {
     const scalar t = time_.timeOutputValue();
     const scalarField d(d_->value(t));
     const scalarField z0(max(z0_->value(t), ROOTVSMALL));
     const scalar groundMin = zDir() & ppMin_;
  
     // (YGCJ:Eq. 22; RH:Eq. 8, HW:Eq. 7 when C1=0 and C2=1)
     return
         pow3(Ustar(z0))/(kappa_*((zDir() & pCf) - groundMin - d + z0))
        *sqrt(C1_*log(((zDir() & pCf) - groundMin - d + z0)/z0) + C2_);
 }
```

上述代码对应的公式：
$$ 
    \epsilon = \frac{u_*^3}{\kappa,(z - d + z_0)} \left( C_1 \ln\left(\frac{z - d + z_0}{z_0}\right) + C_2 \right)^{1/2} 
$$

#### atmBoundaryLayer::omega，功能：计算大气模型的比耗散率

```C++
 tmp<scalarField> atmBoundaryLayer::omega(const vectorField& pCf) const
 {
     const scalar t = time_.timeOutputValue();
     const scalarField d(d_->value(t));
     const scalarField z0(max(z0_->value(t), ROOTVSMALL));
     const scalar groundMin = zDir() & ppMin_;
  
     // (YGJ:Eq. 13)
     return Ustar(z0)/(kappa_*sqrt(Cmu_)*((zDir() & pCf) - groundMin - d + z0));
 }
```

上述代码对应的公式：
$$ 
    \omega = \frac{u_*}{\kappa,\sqrt{C_\mu}};\frac{1}{z - d + z_0} 
$$

### 功能函数


#### atmBoundaryLayer::flowDir，功能：计算流向


```C++
 vector atmBoundaryLayer::flowDir() const
 {
     const scalar t = time_.timeOutputValue();
     const vector dir(flowDir_->value(t)); //flowDir_由边界字典文件读入并设置
     const scalar magDir = mag(dir);
  
     if (magDir < SMALL)
     {
         FatalErrorInFunction
             << "magnitude of " << flowDir_->name() << " = " << magDir
             << " vector must be greater than zero"
             << abort(FatalError);
     }
  
     return dir/magDir;
 }
```

#### atmBoundaryLayer::zDir，功能：计算垂直于地面的方向

```C++
 vector atmBoundaryLayer::zDir() const
 {
     const scalar t = time_.timeOutputValue();
     const vector dir(zDir_->value(t));
     const scalar magDir = mag(dir);
  
     if (magDir < SMALL)
     {
         FatalErrorInFunction
             << "magnitude of " << zDir_->name() << " = " << magDir
             << " vector must be greater than zero"
             << abort(FatalError);
     }
  
     return dir/magDir;
 }
```

#### atmBoundaryLayer::Ustar，功能：计算摩擦速度

```C++
 tmp<scalarField> atmBoundaryLayer::Ustar(const scalarField& z0) const
 {
     const scalar t = time_.timeOutputValue();
     const scalar Uref = Uref_->value(t);
     const scalar Zref = Zref_->value(t);
  
     if (Zref < 0)
     {
         FatalErrorInFunction
             << "Negative entry in " << Zref_->name() << " = " << Zref
             << abort(FatalError);
     }
  
     // (derived from RH:Eq. 6, HW:Eq. 5)
     return kappa_*Uref/log((Zref + z0)/z0);
 }
```

上述代码公式：

$$
 \mathbf{u}_* = \frac{\mathbf{u_{ref}} \cdot \kappa}{\ln\left(\frac{z_{\mathrm{ref}} + z_0}{z_0}\right)} 
$$




## 模型方程（Model equations）

地面法向剖面表达式见下，其中当 `C1=0` 且 `C2=1` 时

- 地面法向的主流向速度剖面：
$$ 
u = \frac{u_*}{\kappa}\ln\left(\frac{z - d + z_0}{z_0}\right), \quad v = w = 0 
$$
    
- 地面法向湍动能剖面：

$$ 
    k = \left(\frac{u_*^2}{\sqrt{C_\mu}} \cdot C_1 \ln\left(\frac{z - d + z_0}{z_0}\right) + C_2 \right)^{1/2} 
$$
    
- 地面法向湍动能耗散率剖面：

$$ 
    \epsilon = \frac{u_*^3}{\kappa,(z - d + z_0)} \left( C_1 \ln\left(\frac{z - d + z_0}{z_0}\right) + C_2 \right)^{1/2} 
$$
    
- 地面法向比耗散率剖面：
    
$$ 
    \omega = \frac{u_*}{\kappa,\sqrt{C_\mu}};\frac{1}{z - d + z_0} 
$$
    
- 地面法向摩擦速度剖面：
    
$$ 
u_* = \frac{u_{\mathrm{ref}}\cdot\kappa}{\ln\left(\frac{z_{\mathrm{ref}} + z_0}{z_0}\right)} 
$$
    

其中各符号含义如下：

- $u$：地面法向主流向速度剖面 [m/s]
- $v$：展向速度 [m/s]
- $w$：地面法向速度 [m/s]
- $k$：地面法向湍动能（TKE）剖面 [m^2/s^2]
- $\epsilon$：地面法向 TKE 耗散率剖面 [m^2/s^3]
- $\omega$：地面法向比耗散率剖面 [m^2/s^3]
- $u_*$：摩擦速度 [m/s]
- $\kappa$：冯·卡门常数 [-]
- $C_\mu$：经验模型常数 [-]
- $z$：地面法向坐标分量 [m]
- $d$：地面法向位移高度 [m]
- $z_0$：空气动力学粗糙度长度 [m]
- $u_{\mathrm{ref}}$：在 $z_{\mathrm{ref}}$ 处的参考平均主流向风速 [m/s]
- $z_{\mathrm{ref}}$：用于 $u_*$ 估算的参考高度 [m]
- $C_1$、$C_2$：用于剖面的拟合系数 [-]

曲线拟合系数 `C1` 和 `C2` 可通过对实验数据将下式(非线性拟合到 `k` 来确定：

$$ 
k = \left( D_1 \ln \left(\frac{z + z_0}{z_0} + D_2 \right) \right)^{1/2} 
$$

其中

- $D_1 = \left(\frac{u_*^2}{\sqrt{C_\mu}}\right) C_1$
- $D_2 = \left(\frac{u_*^2}{\sqrt{C_\mu}}\right) C_2$

默认情况下，`atmBoundaryLayer` 边界条件计算的是 [63] 的表达式。

## 用法（Usage）

继承边界条件所提供的条目示例：

```cpp
inlet
{
    // 强制与其他可选条目
    ...

    // 强制（继承）条目（运行时可修改）
    flowDir         (1 0 0);
    zDir            (0 0 1);
    Uref            10.0;
    Zref            0.0;
    z0              uniform 0.1;
    d               uniform 0.0;

    // 可选（继承）条目（不可修改）
    kappa           0.41;
    Cmu             0.09;
    initABL         true;
    phi             phi;
    C1              0.0;
    C2              1.0;

    // 条件性强制（继承）条目（运行时可修改）
    value           uniform 0;    // 当 initABL=false 时
}
```

各条目含义：

| 属性      | 描述                                 | 类型                       | 必需  | 默认   |
| ------- | ---------------------------------- | ------------------------ | --- | ---- |
| flowDir | 流向                                 | `TimeFunction1<vector>`  | 是   | -    |
| zDir    | 地面法向方向                             | `TimeFunction1<vector>`  | 是   | -    |
| Uref    | 用于 $u_*$ 估算的参考平均主流向速度 [m/s]        | `TimeFunction1<vector>`  | 是   | -    |
| Zref    | 用于 $u_*$ 估算的参考高度 [m]               | `TimeFunction1<vector>`  | 是   | -    |
| z0      | 表面粗糙度长度 [m]                        | `PatchFunction1<vector>` | 是   | -    |
| d       | 位移高度 [m]（见备注）                      | `PatchFunction1<vector>` | 是   | -    |
| kappa   | 冯·卡门常数                             | `scalar`                 | 否   | 0.41 |
| Cmu     | 经验模型常数                             | `scalar`                 | 否   | 0.09 |
| initABL | 是否用理论 ABL 表达式初始化剖面，否则使用 “value” 列表 | `bool`                   | 否   | true |
| value   | 当 initABL=false 时的 ABL 剖面内容        | `scalarList`             | 条件  | -    |
| phi     | 通量场名称                              | `word`                   | 否   | phi  |
| C1      | 拟合系数                               | `scalar`                 | 否   | 0.0  |
| C2      | 拟合系数                               | `scalar`                 | 否   | 1.0  |


上面的`TimeFunction1<vector>`表示：用来定义“随时间变化的标量/矢量/张量值”。当你看到类型写成 `TimeFunction1<vector>`，意思是：这个时间函数返回的是一个矢量值（vector），可被边界条件、源项或字典里的参数引用，用以实现随时间变化的输入。就是：**这些参数运行时可修改**

一般OpenFOAM会这样使用：

```shell

```

该边界代码继承自：[inletOutlet](https://www.openfoam.com/documentation/guides/latest/doc/guide-bcs-outlet-inlet-outlet.html)

## 条目备注（Notes on entries）

- 推导出的 ABL 表达式自动满足 `k` 的简化输运方程。但仅当模型常数 `sigmaEpsilon=1.11` 且 `kappa=0.4` 时，这些表达式才满足 `epsilon` 的简化输运方程（[63]，p. 358）。
- `d` 为位移高度，“与森林和城市上空的流动有关”（[17]，p. 28）。“位移高度给出在被树木或建筑等密集障碍物覆盖区域上方，整个流场的垂直位移”（[17]，p. 28）。
- `z` 为相对入口补丁全局最小高度的地面法向高度；因此，不论计算补丁的绝对 z 坐标为何，`z` 的最小值始终为 0。

## 进一步信息（Further information）

- 教程：`$FOAM_TUTORIALS/verificationAndValidation/atmosphericModels/HargreavesWright_2007`
- 源代码：`Foam::atmBoundaryLayer`

## 历史（History）

- 自版本 1.5 引入


# 实践


## 风力等级划分

风力等级属于补充背景，不作为本文 ABL 边界条件的输入依据。需要换算时应引用中国气象局当前发布的正式标准或科普页，不直接热链其图片。

## 设置相关

[Atmospheric Boundary Layer | How to Set up an ABL | SimScale](https://www.simscale.com/knowledge-base/atmospheric-boundary-layer-abl/)


## python验证inletProfile

![](/images/ABLCondition/20250829_ABLInlet_python_test_result.png)


# 为什么地形外流场的侧边界常设为 `symmetryPlane` 或 `slip`

在地形/大气边界层（ABL）外流计算中，侧边界一般代表“跨风向的远场”。为了让计算域在有限宽度下尽量模拟无限宽场，常选择无摩擦、无穿透的侧边界条件：`symmetryPlane` 或 `slip`。二者本质上都是“滑移、不剪切、无通量”的侧界面，只是实现细节略有不同。

下面从物理意义、数值特性、适用场景与差异细节来系统解释为什么这么做，以及如何选择与注意什么。

---

## 1. 物理与建模动机

- **目标：模拟“无限侧向延展”的大气外场**
  - 实际风场在跨风向上通常远大于你能建的计算域宽度。为了不让侧壁对流动施加非物理影响，侧边界应当：
    - **不产生剪切应力**（无摩擦），否则会像固壁一样改变速度剖面；
    - **不允许质量穿透**（无法向速度），保证体积守恒；
    - **不反射扰动**（尽量少的数值反射），避免侧面“镜像墙”效应。
  - `symmetryPlane` 与 `slip` 都满足这些要求，因此成为默认选择。

- **避免“墙效应”与附加边界层**
  - 固壁（no-slip wall）会在侧面产生边界层，显著改变主流、涡结构与阻力分布，严重失真。
  - 粗糙/光滑墙同样不合适，因为侧面在物理上不是“真实固体边界”。

---

## 2. 条件的数学/数值特性

- **共同点（理想滑移边界）**
  - 法向速度：\( u_n = 0 \)（无穿透）
  - 切向应力：\( \tau_t = 0 \)（无剪切）
  - 梯度条件：对标量（如 \(k, \epsilon, T\)）常用 `zeroGradient`（法向导数为零）

- **`symmetryPlane` 的额外“镜像”约束**
  - 对称面除了滑移外，还满足对称性条件：法向梯度为零、法向分量为零、切向分量在面两侧镜像。它假设面两侧流场在统计意义上可对称。
  - 数学上更强约束，数值上非常稳定，常作为侧边界的首选。

- **`slip` 的实现**
  - 强制法向速度为零，切向方向采用零切应力（零法向梯度）处理。与 `symmetryPlane` 非常接近，但缺少严格的“镜像对称”语义。
  - 一些求解器/版本上，`slip` 在处理矢量/张量时的默认梯度与投影方式略有差别；总体影响小。

---

## 3. 什么时候用它们？

- **跨风向侧边界（默认推荐）**
  - 地形外流模拟中，侧边界距离主地形足够远（建议 ≥ 地形主尺度的 5–10 倍）时，用 `symmetryPlane` 或 `slip` 能最大程度减少非物理影响。

- **上边界（顶部）**
  - 顶部也常用 `symmetryPlane` 或“软出流”（`pressureInletOutletVelocity` + `zeroGradient(p)`）。目的同样是减少反射和剪切。

- **不能使用的情况**
  - 如果侧边界存在真实的横向通量（如侧向进/出风、旁通流），则不能使用对称/滑移，应使用恰当的入口/出口条件。
  - 若想模拟横向重复的周期地形，考虑 `cyclic`/`cyclicAMI`（周期边界），而非对称/滑移。

---

## 4. 选择 `symmetryPlane` 还是 `slip`？

- **优先选择：`symmetryPlane`**
  - 更严格的对称约束，通常更稳健。
  - 对大多数 ABL 外流问题，不需要侧向通量，`symmetryPlane` 表现良好。

- **可选：`slip`**
  - 在个别求解器/设置中，`slip` 与 `symmetryPlane`几乎等价。
  - 如果你已建立了一套基于 `slip` 的项目模板，也可以继续沿用，但要注意与求解器版本一致性。

- **注意 LES 情况**
  - LES 中，侧面滑移会限制横向能量输运与涡结构的跨界发展。如果侧域较窄，`symmetry`/`slip` 可能增强人工相干结构。更稳妥的做法是：
    - 加宽侧向域，或
    - 使用周期边界（`cyclic`）并保证域宽足够代表实际横向相关尺度。

---

## 5. 与其它侧边界方案的对比

- **`noSlip wall`**：不合适。会产生附加边界层与剪切，严重干扰外流。
- **`inletOutlet/pressureInletOutletVelocity`**：适用于真正的流入/流出侧，但需要良好的流向确定和防止反向流措施；一般不用于侧向远场。
- **`cyclic` / `cyclicAMI`**：用于周期性场景（例如理想化重复山脊），可维持统计均匀的横向结构，但需保证周期性几何与流场。
- **`freestream`（部分求解器提供）**：用于真正的无限远场近似，但在地形外流中侧边界多不如 `symmetry/slip` 稳定。

---

## 6. 配置要点与常见坑

- **边界离地形足够远**
  - 即便使用 `symmetry/slip`，如果侧边界离强涡区太近，也会引起反射或人工约束。确保跨风向宽度充足（≥ 地形主尺度 5–10 倍）。

- **湍流量的边界条件一致**
  - RANS：`k, epsilon/omega` 通常设 `zeroGradient`；`nut` 在非壁面不需要（或 `calculated`）。
  - LES：湍流黏性等墙外量同样 `zeroGradient`。避免错误地把侧边界当作壁面函数。

- **矢量与标量的处理**
  - `symmetryPlane` 会自动对法向分量、法向梯度做镜像约束；`slip` 则确保法向速度为零并对切向梯度零处理。检查你的 OpenFOAM 版本文档以确认实现细节。

- **顶部和出口的协同**
  - 侧边界为 `symmetry/slip` 时，顶部通常也应柔和（`symmetry` 或软出流），出口采用 `pressureInletOutletVelocity + zeroGradient(p)`，避免侧面—顶部—出口的三角区域发生数值反射。

---

## 7. 小示例（OpenFOAM 边界片段）

```text
// 侧边界（左右）
boundaryField
{
  sideWest
  {
    type            symmetryPlane;   // 或 slip
  }
  sideEast
  {
    type            symmetryPlane;   // 或 slip
  }

  top
  {
    type            symmetryPlane;   // 或 pressureInletOutletVelocity + zeroGradient(p)
  }

  outlet
  {
    type            pressureInletOutletVelocity;
    value           uniform (0 0 0);
  }
  p_outlet
  {
    type            zeroGradient;
  }
}
```

---

## 8. 总结

- **核心原因**：侧边界设置为 `symmetryPlane` 或 `slip` 是为了在有限域中模拟无限侧向的外流环境，避免非物理的侧壁剪切、附加边界层与数值反射。
- **选择建议**：默认用 `symmetryPlane`；如有既有模板或特殊需要可用 `slip`。两者均为无穿透、无剪切的“滑移”边界。
- **前提条件**：侧界要离主要地形影响区足够远；湍流/标量边界条件要与之匹配；LES 时尽量加宽侧向域或采用周期边界。
