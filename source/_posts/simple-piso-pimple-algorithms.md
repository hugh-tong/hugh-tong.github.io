---
title: SIMPLE/PISO/PIMPLE 算法总览
date: 2026-09-15 15:00:00
categories:
  - [CFD, 理论, 求解算法]
tags:
  - CFD/理论/求解算法
  - 求解算法
  - SIMPLE
description: 三大压力-速度耦合算法的 acronym 展开、核心资料索引与 OpenFOAM 实现链接。
mathjax: true
---

## SIMPLE/PISO算法

**S**emi-**I**mplicit **M**ethod for **P**ressure **L**inked **E**quations

**P**ressure **I**mplicit with **S**plitting of **O**perators

### **资料**(for more details)

[OpenFOAM: User Guide: SIMPLE algorithm](https://www.openfoam.com/documentation/guides/latest/doc/guide-applications-solvers-simple.html)



[2.2 SIMPLE系列算法 | 2.3 PISO算法（OpenFOAM理论笔记系列）_CloudBird07的博客-CSDN博客_piso算法](https://blog.csdn.net/CloudBird07/article/details/107722019)



[OpenFOAM中的数据结构-icoFoam为例【未完成】 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/32679170)



[OpenFOAM guide/The SIMPLE algorithm in OpenFOAM - OpenFOAMWiki](https://openfoamwiki.net/index.php/OpenFOAM_guide/The_SIMPLE_algorithm_in_OpenFOAM)



[OpenFOAM guide/The PISO algorithm in OpenFOAM - OpenFOAMWiki](https://openfoamwiki.net/index.php/OpenFOAM_guide/The_PISO_algorithm_in_OpenFOAM)



SIMPLE——From User Guide

>The sequence for each iteration follows:
>
>1. Advance to the next iteration $ t^{n+1}$​
>2. Initialise $ u^{n+1}$​ and $ p^{n+1}$​ using latest available values of u and p
>3. Construct the [momentum equations](https://www.openfoam.com/documentation/guides/latest/doc/guide-applications-solvers-pressure-velocity-intro.html#eqn-solver-momentum)
>4. Under-relax the [momentum matrix](https://www.openfoam.com/documentation/guides/latest/doc/guide-applications-solvers-pressure-velocity-intro.html#eqn-solver-matrix-composition)
>5. Solve the momentum equations to obtain a prediction for $ u^{n+1}$
>6. Construct the [pressure equation](https://www.openfoam.com/documentation/guides/latest/doc/guide-applications-solvers-pressure-velocity-intro.html#eqn-solver-pressure)
>7. Solve the pressure equation for $ p^{n+1}$
>8. [Correct the flux](https://www.openfoam.com/documentation/guides/latest/doc/guide-applications-solvers-pressure-velocity-intro.html#eqn-solver-flux-corrector) for $ ϕ^{n+1}$
>9. Under-relax $ p^{n+1}$
>10. [Correct the velocity](https://www.openfoam.com/documentation/guides/latest/doc/guide-applications-solvers-pressure-velocity-intro.html#eqn-solver-velocity-corrector) for  $ u^{n+1}$ 
>11. If not converged, go back to step 2



## PIMPLE 算法

* Combines the [PISO](https://www.openfoam.com/documentation/guides/latest/doc/guide-applications-solvers-piso.html) and [SIMPLE](https://www.openfoam.com/documentation/guides/latest/doc/guide-applications-solvers-simple.html) algorithms

### **资料**(for more details)

[OpenFOAM guide/The PIMPLE algorithm in OpenFOAM - OpenFOAMWiki](https://openfoamwiki.net/index.php/OpenFOAM_guide/The_PIMPLE_algorithm_in_OpenFOAM)

[2.4 PIMPLE算法 | 2.5 附加显式力的压力速度耦合（OpenFOAM理论笔记系列）_CloudBird07的博客-CSDN博客_pimple算法](https://blog.csdn.net/CloudBird07/article/details/107799986)

