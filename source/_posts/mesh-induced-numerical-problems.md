---
title: 网格诱导的数值问题
date: 2026-09-15 15:00:00
categories:
  - [CFD, 数值方法]
tags:
  - CFD/数值方法
  - NumericalProblems
  - MeshInduced
  - 浸没边界法
  - DES
description: 非正交性、歪斜、比率突变如何污染解:网格质量与数值误差的因果链。
mathjax: true
---

# Skewness

https://cfmesh.com/is-it-always-the-mesh-part-2-skewness/



歪斜度示意图见上方 CF-MESH+ 原文。这里不直接热链第三方图片。


---

## 🌐 1. Introduction — Role of Mesh in FVM

In **Finite Volume Method (FVM)**, numerical accuracy directly depends on **mesh geometry**.  
A high-quality mesh ensures:

- Consistent representation of gradients,
- Accurate flux calculations, and
- Reliable convergence behaviour.

### 📘 Key Mesh Requirements:

1. **Non-overlapping** cells — Each control volume must be unique.
2. **Convexity** of cells — Ensures valid interpolation and stable discretisation.
3. **Consistent face normals** — Face normal vectors must point outward properly.

---

## 📏 2. Core Mesh Quality Metrics

### 🔹 2.1 Non-Orthogonality (θ)

Measure of the **angle** between:

- The **face normal vector** and
- The **vector connecting cell centroids**.

[ \text{Non-orthogonality angle} = \angle(\mathbf{n}_{f}, \mathbf{d}_{PN}) ]

- Ideal value: **0°** (perfectly orthogonal cells)
- Large angle ⇒ gradient & diffusion term errors grow.
- Critical for viscous regions (boundary layers).

---

### 🔹 2.2 Skewness (S)

Describes the **offset of the face centroid** from the vector connecting two neighboring cell centres.

[ S = \frac{|\mathbf{r}_f - \mathbf{r}_{d}|}{|\mathbf{r}_N - \mathbf{r}_P|} ]

where:

- $\mathbf{r}_f$ = actual face centroid,
    
- $\mathbf{r}_d$ = intersection point of line between cell centers.
    
- Ideal: **S = 0** (aligned geometry)
    
- High skewness ⇒ interpolation error ↑ and stability ↓.
    

---

### 🔹 2.3 Face Uniformity (U)

Defines how evenly a face is located between two cell centres:

[ U = \frac{|\mathbf{r}_f - \mathbf{r}_P|}{|\mathbf{r}_P - \mathbf{r}_N|} ]

- Ideal: **U = 0.5**
- Deviation means cells differ in size or distribution across the face.

---

## ⚙️ 3. Finite Volume Discretisation — Basic Requirements

For an accurate discretisation scheme, four properties are essential:

|Property|Description|
|---|---|
|**Consistency**|Coefficients represent correct physical meaning.|
|**Stability**|Prevents divergent behaviour in solution updates.|
|**Conservation**|Flux entering one cell must exit another.|
|**Boundedness**|Prevents unphysical oscillations or overshoots.|

These properties depend not only on numerical schemes but also on **mesh quality metrics** described above.

---

## 📉 4. Sources of Discretisation Error

|Source|Effect on Accuracy|
|---|---|
|**Cell size**|Controls truncation error of source term.|
|**Solution gradient**|Larger gradients increase discretisation error.|
|**Cell topology**|Affects reconstruction of gradients.|
|**Skewness**|Impacts interpolation accuracy.|
|**Face Uniformity**|Affects divergence and flux balance.|

**Note:**

- **Source term error** depends mainly on mesh size.
- **Gradient and flux errors** depend on **skewness** and **uniformity**.
- **Non-orthogonality** crucially affects **diffusion term accuracy**, particularly in wall-bounded flows.

---

## 🧠 5. Practical Insights

- Maintaining **low non-orthogonality (< 60°)** and **skewness (< 0.3)** is desirable.
- **Boundary layer meshes** must align with physical flow direction to maintain orthogonality.
- For **coarse or poor-quality meshes**, employ non-orthogonal correction schemes to reduce discretisation error.

---

## 🧩 6. cfMesh & CF-MESH+ Overview

### **cfMesh (Open-Source)**

- Automatically generates polyhedral meshes.
- Integrates with OpenFOAM.
- Supports volume refinement and snapping.

### **CF-MESH+ (Enhanced Pro Version)**

- Provides advanced **boundary layer meshing**,
- **Geometry import and cleanup tools**,
- **Custom refinement zones** and improved **mesh control**.
- Optimized for industrial CFD workflows.

🔗 [Learn more at cfmesh.com](https://cfmesh.com/)

---

## 🎯 7. Key Takeaways

|Concept|Role|
|---|---|
|**Non-orthogonality**|Critical for viscous terms — maintain near orthogonality.|
|**Skewness**|Affects gradients — keep low for smooth interpolation.|
|**Face Uniformity**|Impacts divergence accuracy — aim for balanced face positions.|
|**Mesh Size**|Dominant factor in source term precision.|
|**Mesh Generators**|Tools like CF-MESH+ ensure robust control over quality parameters.|

---

## 📚 References

- Source: _Mesh Quality Metrics. Discretisation Basics_ — CF-MESH+ Blog
- © Creative Fields Holding Ltd.

# NonOrthgonal

[网格质量和拉普拉斯离散格式(fvSchemes)的设置](https://mp.weixin.qq.com/s/mPdGfQ3QwiqR-c-dLlGh-Q)
上面推送阐述了三种正交性网格的情况：

三种非正交情况的示意图见上方原文链接。



[面法向梯度的非正交修正理论和OpenFOAM源码分析 - 知乎](https://zhuanlan.zhihu.com/p/361078319)

[OpenFOAM v6 User Guide - 4.4 Numerical schemes](https://doc.cfd.direct/openfoam/user-guide-v6/fvschemes)

>An additional correction to account for mesh non-orthogonality is available in both SIMPLE and PISO in the standard OpenFOAM solver applications. A mesh is orthogonal if, for each face within it, the face normal is parallel to the vector between the centres of the cells that the face connects, e.g. a mesh of hexahedral cells whose faces are aligned with a Cartesian coordinate system. The number of non-orthogonal correctors is specified by the nNonOrthogonalCorrectors keyword as shown in the examples above and on page [227](https://www.openfoam.com/documentation/user-guide/6-solving/6.3-solution-and-algorithm-control#x24-930006.3). The number of non-orthogonal correctors should correspond to the mesh for the case being solved, **i.e. 0 for an orthogonal mesh and increasing with the degree of non-orthogonality up to, say, 20 for the most non-orthogonal meshes.**
>算法迭代层面的非正交修正可以设置到20。

### nNonOrthogonalCorrectors 


#### 迭代位置
- 离散格式中修正和`SIMPLE/PISO/PIMPLE`算法迭代上的修正

nNonOrthogonalCorrectors 

[Non-Orthogonal Correctors | CFD Numerics | SimScale](https://www.simscale.com/docs/simulation-setup/numerics/non-orthogonal-correctors/)
上面这个网页中，简要的说明了non-Orthogonal迭代修正的位置：

算法流程图见上方 SimScale 文档；下面保留其文字化步骤，避免依赖外部图片。

So for a good mesh, with no need for non-orthogonal correctors, the default SIMPLE algorithm is performed, that includes the following steps:

1. Momentum Equation;
2. Pressure Equation;
3. Check continuity;
4. Energy Equation;
5. Turbulence Equations etc.

In case of a bad mesh, with two non-orthogonal correctors, two extra steps are added when solving the pressure equation during the SIMPLE algorithm, and the sequence is formed as follows:

1. Momentum Equation
2. Pressure Equation;
    - Pressure Equation ( correction 1)
    - Pressure Equation ( correction 2)
3. Check continuity;
4. Energy Equation;
5. Turbulence Equations etc.

The amount of non-orthogonal correctors that are selected should be corresponding to the mesh for the case being solved. Here are some recommended values for the non-orthogonal correctors based on mesh non-orthogonality:

- if non-orthogonality < 70  : 0;
- if non-orthogonality > 70  :  1;
- if non-orthogonality > 80  :  2;
- if orthogonality > 85, becomes challenging to converge.



#### Jasak's attitude towards non-orth correctors


下面这个网页有Jasak对`non-orthogonality`设置次数的看法：
[nNonOrthogonalCorrectors -- CFD Online Discussion Forums](https://www.cfd-online.com/Forums/openfoam/69257-nnonorthogonalcorrectors.html)


>Not really "more accurate". If you are running steady, you are doing iterations that will correct non-orthogonality (among other things), and in transient, you are running multiple PISO/SIMPLE correctors which will do the same thing.  
>  
Non-orthogonal correctorsare here to save you if your code is blowing up because the mesh is so non-orthogonal that the first solution is driving the velocity to be stupid. If your velocity is OK, you just keep doing "normal" correctors, without special need for non-orthogonal ones.  
>  
I use them on bad meshes (some people call them "industrial") when the solver is giving me trouble. Usually, 1 is enough, and I never used more than 3.
 > 
Hope this helps,  
  ?
Hrvoje



#### cfMesh talk about nonorthgonal

https://cfmesh.com/is-it-alway-the-mesh-part-3-non-orthogonality/

Non-orthogonality is measured as the angle between the vector connecting neighbouring cell centres at the face and the face-area vector, see the figure below. Low non-orthogonality angles are desired. However, suppose the non-orthogonality increases by about 90 degrees. In that case, the mesh becomes invalid and the discretisation is no longer conservative because the vector connecting cell centres and the face are vector start pointing in opposite directions!

非正交性被衡量为在网格面上连接相邻单元中心点的向量与网格面面积向量之间的夹角，如下图所示。我们希望非正交性角度尽可能小。但是，如果非正交性角度增加大约90度，则网格会变得无效，并且离散化将不再是守恒的，因为连接单元中心点的向量和网格面面积向量开始指向相反的方向！

非正交角定义示意图见上方 CF-MESH+ 原文。


```handdrawn-ink
{
	"versionAtEmbed": "0.3.4",
	"filepath": "attachments/store_pic_in_note/Ink/Drawing/2025.11.21 - 15.35pm.drawing",
	"width": 500,
	"aspectRatio": 1
}
```


表面法向梯度计算方案会影响拉普拉斯项的精度，并且它取决于非正交性。对流项、散度项、梯度项和源项不受非正交性的影响。通常，表面法向梯度的计算方法如下：


**Key takeaways about non-orthogonality**

The most important takeaways about non-orthogonality, which I never seem to get tired of telling are:

1. It does not affect accuracy in regions where the solution is uniform! Avoid it in jets, boundary layers, and other features where the higher-order gradients are significant.
2. It does not affect convection and gradient terms. Hence, it is not the crucial quality measure for convection-dominated flows.
3. The influence of non-orthogonality on the calculation of the Laplacian terms, important in the boundary layer region, can be reduced by paying attention to the input geometry used for meshing, as described in _**[Tips & tricks for a high-quality meshing process.](https://cfmesh.com/tips-tricks-for-a-high-quality-meshing-process/)**

关于非正交性，我总是乐此不疲地强调以下几个最重要的结论：

- 它不影响解均匀区域的精度！应避免在射流、边界层以及其他高阶梯度显著的特征中使用。
- 它不影响对流项和梯度项。因此，它**不是对流主导流动的关键质量指标**。
- 可以通过关注用于网格划分的输入几何，来减少非正交性对拉普拉斯项计算的影响，这在边界层区域非常重要。相关内容请参考“高质量网格划分的技巧与窍门”。


# Volume Ratio


https://cfmesh.com/is-it-always-the-mesh-part-7-volume-ratio-the-secret-killer/


>The goal of this post is to demystify the impact of volume ratio on the accuracy and the stability **of simulations solving the pressure equation.**

volume ratio definition:

$$
V_r = \frac{V_N}{V_P}
$$


体积比突变位置的示意图见上方 CF-MESH+ 原文。

> When the pressure equation is discretised using the Finite Volume Method, we achieve strong coupling of pressure between the neighbouring cells in the spirit of the Rhie-Chow interpolation. However, the coefficient in front of the pressure gradient is dependent on the cell volume, and this requires some further analysis to understand how it influences the solution procedure. When the pressure equation is discretised using the Finite Volume Method, the integration over volume can be represented as a summation over faces:

当使用有限体积法离散压力方程时，我们可以在相邻单元之间实现压力强的耦合，这与Rhie-Chow插值的精神一致。然而，压力梯度前的系数取决于单元体积，因此需要进一步分析以了解它如何影响求解过程。当使用有限体积法离散压力方程时，对体积的积分可以表示为对面上的求和：

#TODO 这里要先梳理一下semi-discretised方程后再整理一下
