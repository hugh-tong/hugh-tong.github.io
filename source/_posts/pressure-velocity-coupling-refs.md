---
title: 压力-速度耦合算法文献页
date: 2026-09-15 15:00:00
categories:
  - [CFD, 理论, 求解算法]
tags:
  - CFD/理论/求解算法
  - 求解算法
  - SIMPLE
description: SIMPLE/SIMPLEC/PISO/PIMPLE 的原始文献出处(WolfDy 培训课程整理)。
mathjax: true
---

#### WolfDy中的培训课程

- **SIMPLE**
  - S. V. Patankar and D. B. Spalding, “A calculation procedure for heat, mass and momentum transfer in three - dimensional parabolic flows”, Int. J. Heat Mass Transfer, 15, 1787 - 1806 (1972).
- **SIMPLE - C**
  - J. P. Van Doormaal and G. D. Raithby, “Enhancements of the SIMPLE method for predicting incompressible fluid flows”, Numerical Heat Transfer, 7, 147 - 163 (1984). 
- **PISO**
  - R. I. Issa, “Solution of the implicitly discretized fluid flow equations by operator - splitting”, J. Comput. Phys., 62, 40 - 65 (1985). 
- **PIMPLE**
  - Unknown origins outside OpenFOAM ecosystem (we are referring to the semantics).
  - It is equivalent to PISO with outer iterations (iterative time - advancement of the solution).
  - Useful reference (besides PISO reference):
    - I. E. Barton, “Comparison of SIMPLE and PISO - type algorithms for transient flows, Int. J. Numerical methods in fluids, 26,459 - 483 (1998).
    - P. Oliveira and R. I. Issa, “An improved piso algorithm for the computation of buoyancy - driven flows”, Numerical Heat Transfer, 40, 473 - 493 (2001). 