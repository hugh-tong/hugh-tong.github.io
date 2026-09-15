---
title: GCL/SCL 公式推导:动网格下的几何守恒律
date: 2026-09-15 13:00:00
categories:
  - [CFD, OpenFOAM, 求解器]
tags:
  - CFD/OpenFOAM/求解器
  - 公式推导
  - 求解器
description: 动网格 ALE 描述下满足空间守恒律(SCL)的控制方程推导,几何守恒律(GCL)的由来。
mathjax: true
---
#### 动网格下推导满足Spatial Conservation Law的控制方程

首先，考虑一维的连续性方程：


$$
\frac{\partial \rho}{\partial t} + \frac{\partial \rho v}{\partial x} =0 \\
\int\frac{\partial \rho}{\partial t} dt + \int \frac{\partial \rho v}{\partial x} dx =0
\tag{1}
\label{eq1}
$$
推导，并使用莱布尼兹法则 
$$
d\rho=\frac{\partial \rho}{\partial x} dx + \frac{\partial \rho}{\partial t}dt \\
\frac{\partial \rho}{\partial t} = (d\rho - \frac{\partial \rho}{\partial x}dx)/dt=\frac{d\rho}{dt}-\frac{\partial \rho}{\partial x}\cdot \frac{dx}{dt}
\tag{2}
\label{eq2}
$$
对于连续性方程，对控制体内进行积分，控制体的边界随着时间变化，从$x_1(t)$到$x_2(t)$：
$$
\int^{x_2(t)}_{x_1(t)}\frac{\partial \rho}{\partial t} dt + \int^{x_2(t)}_{x_1(t)} \frac{\partial \rho v}{\partial x} dx =0
\tag{3}
\label{eq3}
$$
考虑其第一项：
$$
\int^{x_2(t)}_{x_1(t)}\frac{\partial \rho}{\partial t} dx \\
\int^{x_2(t)}_{x_1(t)}(\frac{d\rho}{dt}-\frac{\partial \rho}{\partial x}\cdot \frac{dx}{dt}) dx \\
\frac{d}{dt}\int^{x_2(t)}_{x_1(t)} \rho dx - \int^{x_2(t)}_{x_1(t)}\frac{\partial \rho}{\partial x}\cdot \frac{dx}{dt} dx  \\
\frac{d}{dt}\int^{x_2(t)}_{x_1(t)} \rho dx - (\rho_2 \frac{dx_2}{dt} - \rho_1 \frac{dx_1}{dt})
\tag{4}
$$



第二项：
$$
\int^{x_2(t)}_{x_1(t)} \frac{\partial \rho v}{\partial x} dx \\
\rho_2 v_2 -\rho_1 v_1
\tag{5}
\label{eq5}
$$
所以，可以得到如下$\eqref{eq6_}$形式：
$$
\frac{d}{dt}\int^{x_2(t)}_{x_1(t)} \rho dx - (\rho_2 \frac{dx_2}{dt} - \rho_1 \frac{dx_1}{dt}) + \rho_2 v_2 -\rho_1 v_1 = 0 
\tag{6}
\label{eq6_}
$$
式 $\eqref{eq7}$中的$\frac{dx}{dt}$表示网格移动的速度（控制体积表面移动），将这个速度用$v_s$来表示
$$
\frac{d}{dt}\int^{x_2(t)}_{x_1(t)} \rho dx - \int^{x_2(t)}_{x_1(t)}\frac{\partial \rho}{\partial x}\cdot \frac{dx}{dt} dx  + \int^{x_2(t)}_{x_1(t)} \frac{\partial \rho v}{\partial x} dx\\ 
\frac{d}{dt}\int^{x_2(t)}_{x_1(t)} \rho dx - \int^{x_2(t)}_{x_1(t)}\frac{\partial \rho}{\partial x}\cdot v_s dx  + \int^{x_2(t)}_{x_1(t)} \frac{\partial \rho v}{\partial x} dx\\
\frac{d}{dt}\int^{x_2(t)}_{x_1(t)} \rho dx +\int^{x_2(t)}_{x_1(t)}\frac{\partial }{\partial x}[\rho(v - v_s)] dx = 0
\tag{7}
\label{eq7}
$$


当边界的速度随着流体的速度移动时，$v_s=v$ 。式$\eqref{eq7}$中的$v-v_s$​积分项变为0。此时有拉格朗日质量守恒方程，$dm/dt = 0$

式$\eqref{eq6_}$​的三维版本如式$\eqref{eq8}$（采用三维版本的莱布尼兹法则）。
$$
\frac{d}{dt}\int_V \rho dV - \int_S \rho \frac{d\vec{r}}{dt}\cdot \vec{n} dS + \int_S \rho \vec{v} \cdot \vec{n}dS = 0
\tag{8}
\label{eq8}
$$


对上面式子进行离散，并在时间上步进
$$
\int_t^{t+\Delta t}\int_V\frac{d\rho}{dt}  dV dt - \int_S \rho \frac{d\vec{r}}{dt}\cdot \vec{n} dS + \int_S \rho \vec{v} \cdot \vec{n}dS = 0 \\
\int_t^{t+\Delta t}\int_V\frac{d\rho}{dt}  dV dt + \int_S \rho（\vec{v} - \frac{d\vec{r}}{dt})\cdot \vec{n} dS  = 0 \\
\int_t^{t+\Delta t}\int_V\frac{d\rho}{dt}  dV dt + \int_S \rho(\vec{v} - \vec{v_s}) \cdot \vec{n} dS  = 0 
\tag{9}
\label{eq9}
$$


由雷诺输运定理Reynolds transport theorem：
$$
\frac{d}{dt}\int_{V_{CM}} \rho \phi dV = \frac{d}{dt}\int_{V_{CV}}\rho\phi dV + \int_{S_{CV}}\rho \phi(\vec{v}-\vec{v_s})\cdot \vec{n} dS
$$
其中$V_{CV}$为控制体积，$S_{CV}$为包含控制体积的面，$\vec{v_s}$​为随着控制体积面移动的速度。（CM为控制质量，control mass，有时也称为系统）

当控制体积表面随网格速度$v_s$移动，第 i 个动量分量守恒方程的积分形式采用以下形式：
$$
\frac{\mathrm{d}}{\mathrm{d} t} \int_V \rho u_i \mathrm{~d} V+\int_S \rho u_i\left(\mathbf{v}-\mathbf{v}_{\mathrm{s}}\right) \cdot \mathbf{n} \mathrm{d} S=\int_S\left(\tau_{i j} \mathbf{i}_j-p \mathbf{i}_i\right) \cdot \mathbf{n} \mathrm{d} S+\int_V b_i \mathrm{~d} V 
$$
当$v=v_s$时，控制体积面上的质量通量为零。当对于控制体积的所有面，都有$v=v_s$时，变为控制质量control mass，也就有了流动的拉格朗日描述。

上述方程中的时间导数在固定网格和动网格中具有不同的含义。如果CV不移动，则时间导数表示守恒量在固定位4置的局部变化，用$∂φ/∂t$表示;当控制体积移动时，我们使用 $dφ/dt$ 来表示$φ$在空间中移动位置的随时间变化。

在上述表面与流体速度完全一致运动的控制体积的特殊情况下，时间导数成为总（物质）导数，因为控制体积始终包含相同的流体，因此代表控制质量。时间导数含义的这种变化由对流通量解释，对流通量也根据控制体积运动而变化。

当网格的运动随时间已知时，解Navier-Stokes方程组不会引入新问题：我们只需使用单元格面上的相对速度分量计算对流通量（例如质量通量）。然而，当单元格面移动时，如果使用网格速度来计算质量通量，则并不一定保证质量守恒（以及所有其他守恒量）。例如，考虑具有隐式Euler时间积分的连续性方程；为简单起见，我们假设控制体是矩形的，流体是不可压缩的，并且以恒定速度移动。图13.6显示了在旧时间级和新时间级的控制体大小的相对大小。我们还假设网格线（控制体面）以恒定但不同的速度移动，因此控制体的大小随时间增长。



![A rectangular control volume whose size increases with time due to a difference in the grid velocities at its boundaries](https://testnew-1307662376.cos.ap-chengdu.myqcloud.com/image-20240228141921646.png)

采用隐式欧拉，离散的连续性方程在上图13.6类似的控制体中，有：
$$
\frac{\rho [(\Delta V)^{n+1} - (\Delta V)^n]}{\Delta t} + \rho[(u-u_s)_e - (u-u_s)_w]^{n+1}(\Delta y)^{n+1} \\
+ \rho[(v-v_s)_n - (v-v_s)_s]^{n+1}(\Delta x)^{n+1} = 0
$$
其中的$u$和$v$是速度分量（假定了流体以固定速度流动），流体速度的贡献项消去。
$$
(u_e - u_w)(\Delta y)^{n+1} = 0 \\
(v_n - v_s)(\Delta x)^{n+1} =0
$$
仅留下网格速度引起的差别，得到：
$$
\frac{\rho [(\Delta V)^{n+1} - (\Delta V)^n]}{\Delta t} -\rho(u_{s,e}-u_{s,w})(\Delta y)^{n+1} -\rho(v_{s,n}-v_{s,s})(\Delta x)^{n+1} = 0
$$


在上述假设的基础上，可以将控制体积相对两侧的网格速度差表示为：
$$
u_{s,e} - u_{s,w} = \frac{\delta x}{\Delta t}, v_{s,n} - v_{s,s} = \frac{\delta y}{\Delta t}
$$
同时，有：
$$
(\Delta V)^{n+1} = (\Delta x \Delta y)^{n+1} \\
(\Delta V)^{n} = [(\Delta x)^{n+1} - \delta x][(\Delta y)^{n+1} - \delta y]
$$
带入式：


$$
\frac{\rho [(\Delta V)^{n+1} - (\Delta V)^n]}{\Delta t} -\rho(u_{s,e}-u_{s,w})(\Delta y)^{n+1} -\rho(v_{s,n}-v_{s,s})(\Delta x)^{n+1} = 0 \\
\frac{\rho [ (\Delta x \Delta y)^{n+1} - [(\Delta x)^{n+1} - \delta x][(\Delta y)^{n+1} - \delta y]]}{\Delta t}-\rho \frac{\delta x}{\Delta t}(\Delta y)^{n+1}  -\rho \frac{\delta y}{\Delta t}(\Delta x)^{n+1} =0 \\
\frac{\rho [\cancel{ (\Delta x \Delta y)^{n+1} - (\Delta x \Delta y)^{n+1}+  (\Delta x )^{n+1}\delta y+\delta x(\Delta y)^{n+1}}-\delta x \delta y ]}{\Delta t}-\cancel{\rho \frac{\delta x}{\Delta t}(\Delta y)^{n+1}  -\rho \frac{\delta y}{\Delta t}(\Delta x)^{n+1} } =0
$$
此时离散的质量守恒方程不满足，存在一个质量源项：
$$
\delta \dot{m} = - \frac{\rho \delta x \delta y}{\Delta t} = - \rho (u_{s,e}-u_{s,w})
(v_{s,n}-v_{s,s})\Delta t
$$
由显式欧拉格式推到得到的方程有同样的误差（符号相反）。对于固定网格速度的情况，这个误差与时间步大小成正比。

该误差为一阶的离散误差，向前和向后欧拉是一阶的时间离散格式。但该人工质量源项在时间上积累，造成严重的误差。

这种误差仅在一条网格线移动时消失，或者网格速度与相对控制体积的速度相同。

在上述假设下，Crank-Nicolson和三时级隐式方案都完全满足连续性方程。更一般地说，当流体和/或网格速度不恒定时，这些方案也产生了人工质量源。

通过执行所谓的空间守恒定律（SCL），可以获得质量守恒。可以将其视为零流体速度极限条件下的连续方程。
$$
\frac{d}{dt}\int_VdV - \int_S \vec{v_s}\cdot \vec{n} dS =0
$$
这个方程描述了当控制体积随着时间改变形状和/或位置时，空间的守恒。 

此时，考虑流体的密度为不可压。公式可以重写为：
$$
\frac{d}{dt}\int_V  dV - \int_S  \vec{v_s}\cdot \vec{n} dS + \int_S \vec{v} \cdot \vec{n}dS = 0
$$
该公式的前两项即为SCL。如果这两项为0，也即满足SCL条件。质量守恒方程退化为：
$$
\int_S \vec{v}\cdot \vec{n}dS = 0\quad or \quad \nabla\cdot \vec{v} = 0
$$



因此,在离散方程中，确保上述两个术语相互抵消同样重要（即控制体积面上的体积流通的总和必须等于体积变化的速率）；否则，会引入人工质量源，并且随着时间的推移可能会累积并破坏解的正确性，正如Demirdžic ́和Peric ́（1988）所证明的那样。

在接下来的讨论中，使用了隐式的三时间级格式进行时间积分和SIMPLE算法作为说明。使用Crank-Nicholson格式的表达式很容易得出，同样隐式欧拉格式的表达式也是如此；在隐式分步方法（implicit fractional-step method）中的实施也是直接的。在瞬态流动中使用一阶格式进行时间积分只有在我们知道流动正向稳态解发展时才是合理的，这一点适用于一些浮体问题（船只在平静水域中移动；初始位置是船只和流体都静止，但由于产生的波浪，通过恒定速度，船只的配重和下沉会发生变化）。
在空间积分中，我们使用中点法则和中心差分格式。

对于C-N时间离散格式，有：
$$
(\frac{d\phi}{dt})_{n+1} \approx \frac{3\phi^{n+1}-4\phi^n+\phi^{n-1}}{2\Delta t}
$$
从而，将离散的SCL方程转换为：
$$
\frac{3(\Delta V)^{n+1}-4(\Delta V)^n+(\Delta V)^{n-1}}{2\Delta t} = [\sum_k(\vec{v_s}\cdot \vec{S})_k]^{n+1}
$$




![Fig.13.7 A typical 2D CV at two time steps and the volume swept by a cell face](https://testnew-1307662376.cos.ap-chengdu.myqcloud.com/image-20240228151803081.png)

在这里求和是指对控制体积的所有面进行求和。$\delta V_k$​的求和为控制体积在不同的时间步，旧的位置到新的位置，对应面扫过的体积。
$$
(\Delta V)^{n+1} - (\Delta V)^{n} = \sum_k \delta V^n_k
$$
将该式子带入离散的SCL方程，得到：
$$
\frac{3\sum_k\delta V^n_k - \sum_k \delta V^{n-1}_k}{2\Delta t} = [\sum_k(\vec{v_s} \cdot \vec{S})_k]^{n+1}
$$
尽管上述等式在不同情况下可能得到满足，但合理的假设是左侧和右侧求和的对应部分应该相等（即，方程两侧每个面的贡献相等）。在这个假设下，如果通过单元面积的通量被定义为相等的话，那么SCL将会被满足:
$$
\dot{V}_k^{n+1}=[(\vec{v_s}\cdot \vec{S})_k]^{n+1} \approx \frac{3\delta V_k^{n}-\delta V_k^{n-1}}{2\Delta t}
$$


因此，每个面由一个时间步进扫过的体积$\delta V_k$，由网格点在两个时刻下的位置计算得到。同时也用于计算网格体积通量$\dot{V}_k^{n+1}$。==因此，没有必要显式的指定控制体积面上的网格速度$\vec{v_s}$==

通过一个cell的面上的质量通量能够表示为式：
$$
\dot{m}^{n+1}_k=(\int_{S_k}\rho \vec{v}\cdot \vec{n} \mathrm{~d}\mathrm{S} -\int_{S_k}\rho \vec{v_s}\cdot \vec{n} \mathrm{~d}\mathrm{S} )^{n+1} \\
\approx (\rho v_i S_i)^{n+1}_k - (\rho v_{s,i} S_i)^{n+1}_k\\
\approx (\rho v_i S_i)^{n+1}_k - (\rho v_{s,i} S_i)^{n+1}_k \\
\approx (\rho v_i S_i)^{n+1}_k - (\rho_k \dot{V}_k)^{n+1}
$$
$v_i, v_{s,i}$都是速度分量。$(v_i)_k, (v_{s,i})_k$的下标k，可以认为是在各个方向上的标识。$(S_i)_k$表示在第k个face处的面矢量surface vector。



回顾推导得到的连续性方程如式：
$$
\frac{d}{dt}  \int_V \rho dV + \int_S \rho(\vec{v} - \vec{v_s}) \cdot \vec{n} dS  = 0
$$


带入推导的质量通量$\dot{m}^{n+1}_k$与时间格式$\frac{d\phi}{dt}\approx \frac{3\phi^{n+1}-4\phi^n+\phi^{n-1}}{2\Delta t}$。得到：
$$
\frac{3(\rho\Delta V)^{n+1}-4(\rho\Delta V)^{n}+(\rho\Delta V)^{n-1}}{2\Delta t}+\sum_k{\dot{m}^{n+1}_k} = 0
$$
在瞬态 SIMPLE 算法中，新时刻$ t_{n+1}$ 的值是通过外迭代得到的。根据方程在外迭代中计算新质量通量$\dot{m}^{n+1}_k$的近似值。为满足质量守恒，质量通量的修正通过在cell-face速度时加一个修正项（该项与压力修正的梯度成正比）。如果是可压缩流动，还需要对cell-face密度进行修正（该项直接与压力项成正比）。

![image-20240229164017280](https://testnew-1307662376.cos.ap-chengdu.myqcloud.com/image-20240229164017280.png)

在3D的情况下，由cell faces扫过的体积必须准确计算（因为cell edge可能会发生转动）。扫过体积的计算需要图13.8阴影部分表面。阴影部分的面积由两个控制体积共有，需要保证他们以相同的方式进行三角化以满足空间守恒。

==TODO:网格体积的计算==

由质量守恒方程得出的压力校正方程与固定网格的形式相同（对可压和不可压都成立），除了时间相关项。如果知道了网格在新时刻的位置，网格体积通过face的通量$\dot{V}^{n+1}_k$​不再依赖外循环，仅在每个新的时间步前计算一次。然而，在网格适应固体结构的位置（流固耦合）或界面的情况下（自由表面的界面追踪处理）在外部迭代期间，体积通量需要与其他校正一起进行校正，详细见Demirdzic and Peric, 1990。

对于可压缩流，在求解域的变化率是非零的，不能确定推导的SCL是否满足质量守恒。方程中，第一项为cell-center的值，第二项为face-center的值。该公式使用的时间格式为二阶。因此，当时间步长减半时，任何时间离散化误差（影响变化率）都将减少四倍。网格运动引起的额外误差与固定网格的离散化误差相同，并且随着时间步长的细化而以相同的速率减小。
$$
\frac{3(\rho\Delta V)^{n+1}-4(\rho\Delta V)^{n}+(\rho\Delta V)^{n-1}}{2\Delta t}+\sum_k{\dot{m}^{n+1}_k} = 0
$$
可以证明，对于封闭系统（没有入口和出口）中的可压缩流体，具有不同的形状和体积，当使用上述 SCL 离散化时，质量是守恒的。下面对使用三个时刻离散格式进行了演示。





Q:

对一个微元P，有体积$V_P$，某函数的偏微分$\frac{\partial f(x,y,z)}{\partial x}$在微元P处积分。
$$
\int_{V_P}\frac{\partial f(x,y,z)}{\partial x}dV = \cancel{\approx} (\frac{\partial f(x,y,z)}{\partial x})_P \cdot V_P
$$




雷诺输运定理推导