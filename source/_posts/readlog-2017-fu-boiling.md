---
title: 论文阅读:Fu 2017 OpenFOAM 沸腾模拟
date: 2026-09-15 16:00:00
categories:
  - [阅读, 论文笔记]
tags:
  - 阅读/论文
  - 浸没边界法
  - 湍流
  - 论文笔记
  - RANS
description: 2017 Fu 沸腾相变模型论文的阅读笔记(OpenFOAM 实现)。
mathjax: true
---

 

### 2017-Fu

> [!PDF|yellow] 2017-Fu-boilInOpenFOAM, p.2
> > Implementation and validation of two-phase boiling flow models in OpenFOAM
> 
>  付博在2017年发的文章，涉及到OpenFOAM中开发两相流沸腾模型



> [!PDF|note] 2017-Fu-boilInOpenFOAM, p.2
> > The model consists of six conservation equations for the liquid and the vapor phase, allowing for the thermodynamic non-equilibrium and compressibility of both phases. In addition, the model includes two transport equations for the turbulence kinetic energy and energy dissipation and one transport equation for the interfacial area concentration. New models for wall heat partitioning as well as for the phase change terms in nucleate boiling have been implemented. Sensitivity studies as well as validation of the model against measured data available in the open literature have been performed and it has been shown that a reasonable agreement between predictions and experiments has been achieved.
> 
> 文章主要植入：`Wall heat partitioning`与`phase change terms in nucleate boiling`

> DNB：departure from nucleate boilng。是指加热表面上由汽泡产生的核态沸腾状态突然转变为膜态沸腾的现象。



**[PDF 素材:2017-Fu-boilInOpenFOAM.pdf]**


$\Gamma_k$代表相$k$得到的质量，$k=l,v$。

蒸汽得到的质量为正，就是evaporation蒸发。蒸汽的质量为负，就是condensation冷凝。
**[PDF 素材:2017-Fu-boilInOpenFOAM.pdf]**
Rusche 2002:
**[PDF 素材:2017-Fu-boilInOpenFOAM.pdf]**


能量方程采用焓方程：

**[PDF 素材:2017-Fu-boilInOpenFOAM.pdf]**

壁面处的热流，加到方程源项？壁面处的处理是？

从vapor到liquid的mass flux $\Gamma_l$，这里直接用前人的结果。主要是Kurul和Podowski，这两个人做的工作挺出名。后面看看。
**[PDF 素材:2017-Fu-boilInOpenFOAM.pdf]**


**[PDF 素材:2017-Fu-boilInOpenFOAM.pdf]**
首先，靠近壁面处的第一层网格就不能condensation，只能evaporation。这种操作是符合boiling flows的操作的。
壁面处存在：interaction among the liquid, vapor and walls.

忽略在气泡在壁面的直接加热，也即$a_w q^{''}_{vw}=0$

Recall eqn 6。 
**[PDF 素材:2017-Fu-boilInOpenFOAM.pdf]**

对液相，考虑傅里叶导热定律，molecular heat flux有：
$$
q_k^{''} = - \frac{\lambda_l}{c_{pl}}\nabla h_l
$$
$\lambda$ 为导热系数，$c_p$为比热容。




### 2022-Godino

#### Ranz-Marshall model:
$$
Nu = 2 + 0.6 Re_d^{0.5}Pr_d^{1/3}
$$

```C++
Foam::tmp<Foam::volScalarField>  
Foam::heatTransferModels::RanzMarshall::K(const scalar residualAlpha) const  
{  
    volScalarField Nu(scalar(2) + 0.6*sqrt(pair_.Re())*cbrt(pair_.Pr()));  

    return  
        6.0  
       *max(pair_.dispersed(), residualAlpha)  
       *pair_.continuous().kappa()  
       *Nu  
       /sqr(pair_.dispersed().d());  
}
```

return的是在算下面这个？
<a name="formula1"></a>
$$
A_f = 6 \alpha_d/d_d
$$



#### 算法流程

**[PDF 素材:2022-Godino-chtBoilingTwoPhaseEulerFoam.pdf]**


#### bubble influence factor

```C++
const scalarField Al
(
    fLiquid*4.8*exp(min(-Ja/80, log(vGreat)))
);

```

上述代码在求解$\xi$，bubble influence factor:

$$
\xi = 4.8e^{Ja_{sub}/80}
$$

#### Wall heat transfer 

$$
q_w = (q_c + q_q + q_e)f(\alpha_l)+q_{cv}(1-f(\alpha_l))
$$


function $f(\alpha_l)$ , expression by Lavieville

> Lavieville:
> ![](/images/readlog-2017-fu-boiling/20250623_realcase_boilingLog.png)

[跳转到公式1](#formula1)

$$
f(\alpha_l) =  
\begin{cases}  
1 - 0.5\, e^{-20(\alpha_l - \alpha_{cr})}, & \alpha_l - \alpha_{cr} > 0 \\
0.5 \left(\frac{\alpha_l}{\alpha_{cr}}\right)^{20 \alpha_{cr}}, & \alpha_l - \alpha_{cr} \leq 0  
\end{cases}  
$$  


这里的$\alpha_{cr}=0.2$。这个表达式的选择依赖于用户设置。

>文章中说到：“hence, the weakness of it is on the arbitrariness of the applied distribution function independent on the microscopic phenomena.”
>因此，它的弱点在于所采用的分布函数具有任意性，而这种分布函数与微观现象无关。

没有气泡的面积为$A_f$，所贡献的单相对流热量
$$
q_c = A_f h_c(T_w-T_l)
$$
所谓`quenching area`计算公式为：
$$
A_f = 1 - A_q
$$
上述公式的$h_c$，由Kader1981中得到的无量纲温度分布，和壁面处的对流换热连理得到。

$$
\begin{aligned}
T^+ &= Pr y^+ \\ 
T+ &= \frac{T_w - T}{T_{\tau}}, \quad T_{\tau}= \frac{q_w}{\rho c_p u_{\tau}} \\
y^+ &= \frac{y u_{\tau}}{\nu} \\
Pr &= \frac{\nu}{\alpha}
\end{aligned}
$$

由上：

$$
\begin{aligned}
T^+ &= Pr y^+\\
&= \frac{\nu}{\alpha} \cdot \frac{y u_{\tau}}{\nu} \\
&= \frac{y u_{\tau}}{\alpha} = \frac{y u_{\tau} \rho c_p}{\lambda}
\end{aligned} 
$$

对流换热：

$$
\begin{aligned}
Q_c &= h_cA(T_w - T) = \lambda \frac{T_w - T}{y} \\
h_c &= \frac{\lambda}{y}
\end{aligned}
$$

得到：

$$
\begin{aligned}
T^+ = \frac{u_{\tau} \rho c_p}{h_c} \\
h_c = \frac{u_{\tau} \rho c_p}{T^+}
\end{aligned}
$$



### 2023-王洪斌

这里，文章给出了一组得到的最优模型配置
**[PDF 素材:2023-王洪彬-压水堆芯过冷沸腾.pdf]**


#### 其他

[OpenFOAM Documentation - alphatWallBoilingWallFunction](https://doc.openfoam.com/2306/tools/processing/boundary-conditions/rtm/derived/multiphase/alphatWallBoilingWallFunction/)
