---
title: 动网格 + MULES + 界面捕捉:interFoam 动网格总结
date: 2026-09-15 13:00:00
categories:
  - [CFD, OpenFOAM, 求解器]
tags:
  - CFD/OpenFOAM/求解器
  - 求解器
  - LES
  - interFoam
  - 总结
description: dynamicMesh 与 interFoam 结合的理论、公式推导与实现要点总结。
mathjax: true
---
动网格+MULES+界面捕捉总结



### 理论



#### 公式推导



其中ALE形式的VOF方程见式。
$$
\begin{equation}
\begin{aligned}
& \frac{\partial \phi}{\partial t}+\nabla \cdot(\boldsymbol{u} \phi)=0 
\end{aligned}
\end{equation}
$$

$$
\begin{equation}
\begin{aligned}
& \frac{\partial}{\partial t} \int_{\Omega_\chi} \phi d \Omega+\int\left(\boldsymbol{u}-\boldsymbol{u}_g\right) \phi d \boldsymbol{S}=0 
\end{aligned}
\end{equation}
$$

$$
\begin{equation}
\begin{aligned}
& \frac{\partial V_i}{\partial t}+\sum \boldsymbol{u}_{g, f} \boldsymbol{S}_f=0
\nonumber \\
\end{aligned}
\end{equation}
$$

本任务最初目的是探索，能否通过$V= V_0 - \Delta t \sum{u_{g,f}S_f}$显式的更新网格体积以满足动网格下的ALE。在任务过程中，采用多种方法，将显式更新的体积传入MULES算法，但结果仍然错误。在计算过程中，监测了手动更新的网格体积，发现与OpenFOAM采用`mesh.V()`以及`mesh.V0()`接口计算的结果非常相似（相对误差在$e^-5$级）。但是，计算仍然会发散，所以猜想OpenFOAM是否已经考虑了ALE+动网格。

参考Ferziger相关章节[^1]，可以对式进行进一步推导。
$$
\begin{equation}
\begin{aligned}
\underbrace{\frac{d}{dt}\int_V  dV - \int_S  \vec{v_s}\cdot \vec{n} dS }_{Spatial\, Conservation \, Law }+ \overbrace{\int_S \vec{v} \cdot \vec{n}dS}^{=0} &= 0 \\
\end{aligned}
\end{equation}
$$
在上式带入连续性方程，有质量守恒条件，见下式。
$$
\begin{equation}
\begin{aligned}
\frac{d}{dt}\int_V  dV - \int_S  \vec{v_s} \cdot \vec{n} dS &=0 \\
\end{aligned}
\end{equation}
$$
Ferziger相关章节中推导得到了下式。该式将网格速度在网格各个面在$\Delta t$内扫过的体积与质量守恒联系起来，从而使得动网格下满足质量守恒。因此，没有必要显式的指定控制体积面上的网格速度，仅需要求得网格面扫过的体积即可。
$$
\begin{equation}
\begin{aligned}
\frac{dV}{dt} = \int_{\partial V_p}u_g \cdot d\vec{S} = \sum_f{v_{s,f}\cdot S_f} &= \frac{\sum_f{\delta V_f}}{\Delta t}
\end{aligned}
\end{equation}
$$
例如图。其中CEGD在下一时刻为LNOK，其扫过的体积为蓝色的QUTZRVWS。

![image-20240325154454653](https://testnew-1307662376.cos.ap-chengdu.myqcloud.com/image-20240325154454653.png)



在方程求解中，网格速度的对流项中考虑网格速度通量，见其中式。针对于其中的通量$\vec{U}_f\cdot \vec{S}_f$减去网格通量$\vec{U}_{g,f}\cdot \vec{S}_f$​可以通过`makeRelative`这个函数完成。

![image-20240325155523838](https://testnew-1307662376.cos.ap-chengdu.myqcloud.com/image-20240325155523838.png)

求解器代码`interFoam.C`中使用了`fvc::makeRelative(phi,U)`，从而完成了满足了ALE+动网格情况下的质量守恒。

```C++
                    if (correctPhi)
                    {
                        // Calculate absolute flux
                        // from the mapped surface velocity
                        phi = mesh.Sf() & Uf();
 
                        #include "correctPhi.H"
 
                        // Make the flux relative to the mesh motion
                        fvc::makeRelative(phi, U);
                    }
```



### 计算结果





### 分析



首先，采用MULES算法进行计算的OpenFOAM，在静止网格时候界面捕捉都存在误差。



Roenby分析了几种界面捕捉的算法或格式，对他们的界面捕捉能力进行了对比。其中的HRIC(High Resolution Interface Capturing Scheme)为STAR-CCM+用的界面捕捉格式，CICSAM(Compressive Interface Capturing Scheme for Arbitrary Mesh)为fluent中的一个可选的界面捕捉格式。可以发现MULES算法在这几种界面捕捉方法中，结果最差。

![image-20240326095436892](https://testnew-1307662376.cos.ap-chengdu.myqcloud.com/image-20240326095436892.png) 



### 参考资料



[^1 ]:  Ferziger J H , Peric M , Leonard A .Computational Methods for Fluid Dynamics[J].Physics Today, 1997, 50(3):80-84.DOI:10.1063/1.881751.
[^2]: Jasak H ,Tukovi'c.Automatic Mesh Motion for the Unstructured Finite Volume Method[J].Transactions of FAMENA, 2007, 30:1-18.
[^3 ]: OpenFOAM-7源码
[^4 ]: OpenFOAM-v2306源码

