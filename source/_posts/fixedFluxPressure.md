---
title: fixedFluxPressure 边界条件解析
date: 2026-09-15 12:00:00
categories:
  - [CFD, OpenFOAM, 边界条件]
tags:
  - CFD/OpenFOAM/边界条件
  - interFoam
  - Cpp
  - OpenFOAM
  - DES
description: 通量固定的压力边界条件:与 fixedValue/prghPressure 的关系和适用场景。
mathjax: true
---
[fixedFluxPressure边界条件【转载】 - 硫酸亚铜 - 博客园](https://www.cnblogs.com/liusuanyatong/p/11259750.html)

buoyantPressure设置压力梯度使其适用于浮力流，由于壁面边界通量差值趋于0，因此边界条件近似zeroGradient，buoyantPressure从物理意义上更符合 Archimedes' principle描述的壁面边界；而fixedFluxPressure则是调整压力梯度使得边界通量与速度边界条件指定的保持一致，收敛性更好。此外，fixedFluxPressure边界条件不限于壁面，也可以用于入口与出口，在interFoam中的渠道流案例中，出口设置为fixedFluxPressure。

> 这个buoyantPressure boundary在OpenFOAM 2.2.2中就没有了



[I need explanations about fixedFluxPressure -- CFD Online Discussion Forums](https://www.cfd-online.com/Forums/openfoam-solving/82581-i-need-explanations-about-fixedfluxpressure.html)

OpenFOAM 2.2.2具有两种边界条件。在更新的版本中，`buoyantPressure` 边界被移除了。为了澄清，请查看代码或Doxygen文档。
**buoyantPressureFvPatchScalarField**
这个边界条件会为浮力流适当地设置压力梯度。如果变量名是 `pd`、`p_rgh` 或 `phi_rgh` 之一，我们假设压力变量是 $p - \rho (g \cdot h)$，并且梯度使用以下公式计算： 
$$
\nabla(p) = -\nabla_{\perp}(\rho)( g \cdot h)
$$
否则，我们假设它是静压，并且使用以下公式计算梯度： 

$$
\nabla(p) = \rho (g \cdot n)
$$

**fixedFluxPressureFvPatchScalarField**
这个边界条件调整压力梯度，使得边界上的通量符合速度边界条件所指定的值。 要比较的预测通量由压力梯度计算得出，表达式为 $(\phi - \phi_{H/A})$，这两者都是从数据库中查找的，用于计算梯度的压力扩散率也是如此，使用以下公式： 
$$
\nabla(p) = \frac{\phi_{H/A} - \phi}{|S_f| D_p}
$$
CFDOnline中，有人提到：**The fixedFluxPressure boundary is known do have a better convergence.**


`2.3.0`的一些更新：

`fixedFluxPressureFvPatchScalarField.C`

```C++
  125 void Foam::fixedFluxPressureFvPatchScalarField::updateCoeffs
  126 (
  127     const scalarField& snGradp
  128 )
  129 {
  130     if (updated())
  131     {
  132         return;
  133     }
  134 
  135     curTimeIndex_ = this->db().time().timeIndex();
  136 
  137     gradient() = snGradp; // 用传进来的压力梯度，给定
  138     fixedGradientFvPatchScalarField::updateCoeffs(); // 然后去调了fixedGradient的方法，意思这里存在一个压力梯度
  139 }
```

这个梯度是在求解器层面去做的：

```C++
   27     // Update the fixedFluxPressure BCs to ensure flux consistency
   28     setSnGrad<fixedFluxPressureFvPatchScalarField>
   29     (
   30         p_rgh.boundaryField(),
   31         (
   32             phiHbyA.boundaryField()
   33           - (mesh.Sf().boundaryField() & U.boundaryField())
   34         )/(mesh.magSf().boundaryField()*rAUf.boundaryField())
   35     );
```


$$
\vec{\nabla}p = \left(\vec{H}/a_P\cdot\vec{S}_f - \vec{U}\cdot\vec{S}_f\right)\frac{(a_P)_f}{||\vec{S}_f||}
$$

可以看到，边界的处理用的场都是`.boundaryField()`。上面这个的推导：

First of all we need to write down the momentum equation discretized using the **Rhie-Chow interpolation** method. This reads:
$$
(\vec{u}_{f})=(\frac{\vec{h}}{\alpha_{p}})_{f}-(\frac{1}{\alpha_{p}})_{f}\nabla p_{m}
$$

Where the $f$ subscript means interpolate to the face, $p_{m}$ is the variable $p_rgh$ whose value is $p_{m}=p-\rho gh$, and the vector u is the velocity. Now multiply the equation by the face surface vector $S_{f}^{j}=\|S_{f}\| \cdot \vec{n}$

where the vector n is the surface normal:

$$
\vec{u}_{f} \cdot S_{f}^{j}=(\frac{\vec{h}}{\alpha_{p}})_{f}\cdot S_{f}^{j}-(\frac{1}{\alpha_{p}})_{f}\nabla p_{m} \cdot S_{f}^{j}
$$

Thus the following equation for the pressure surface gradient $\nabla p_{m} \cdot \vec{n}$ can be obtained:

$$
\nabla p_{m} \cdot \vec{n} = (\frac{\alpha_{f}}{\alpha_{p}})_{f} \frac{(S_{f} \cdot \vec{u}_{f} - \vec{u}_{f} \cdot S_{f}^{j})}{\|S_{f}\|} \frac{\|a_{p}\|_{f}}{\|S_{f}\|}
$$


在OpenFOAM-5.x后，这个操作由接口替代：

```C++
    // Update the pressure BCs to ensure flux consistency
    constrainPressure(p_rgh, U, phiHbyA, rAUf, MRF);

```


两相欧拉方法的做法：

```C++
    // Update the fixedFluxPressure BCs to ensure flux consistency
    setSnGrad<fixedFluxPressureFvPatchScalarField>
    (
        p_rgh.boundaryFieldRef(),
        (
            phiHbyA.boundaryField()
          - (
                alphaf1.boundaryField()*phi1.boundaryField()
              + alphaf2.boundaryField()*phi2.boundaryField()
            )
        )/(mesh.magSf().boundaryField()*rAUf.boundaryField())
    );
```


其中的操作，可看WIKI的详细解释：[SimpleFoam - OpenFOAMWiki](https://openfoamwiki.net/index.php/SimpleFoam#Step_by_step_analysis_of_the_pressure_equation)