---
title: OpenFOAM 网格质量提升方法综述
date: 2026-09-15 12:00:00
categories:
  - [CFD, OpenFOAM, 网格]
tags:
  - CFD/OpenFOAM/网格
  - 网格
  - snappyHexMesh
  - OpenFOAM
  - cfMesh
description: 从 checkMesh 指标到优化工具链:smooth、refine、reposition 与遗传算法优化的思路汇总。
mathjax: true
---
从网格质量提升的层面，了解到了:

- genetic and evolutionary algorithm genetic_evolutionary_algo

## Linkin上分享的文章

https://www.linkedin.com/pulse/refining-unstructured-mesh-quality-openfoam-from-holger-marschall-mp7ye/

Creating high‑quality unstructured meshes is fundamental to stable and accurate CFD simulations. Even when geometry discretisation produces cells of general topology, cell non‑orthogonality, skewness and extreme aspect ratios can cause divergence or deteriorate solution accuracy. Mesh quality improvement is therefore an essential post‑processing step. The OpenFOAM ecosystem offers several approaches for improving the geometry of existing meshes without altering topology and for tuning meshing parameters to yield better meshes from the outset. This article discusses four such approaches: **smoothMesh**, **improveMeshQuality** (cfMesh‑based), **optiMesh**, and **genetic optimisation of snappyHexMesh parameters**.

创建高质量的非结构化网格是稳定和准确的CFD模拟的基础。即使几何离散化产生具有通用拓扑结构的网格单元，单元的非正交性、偏斜度和极端纵横比也可能导致发散或降低解的精度。因此，网格质量改进是必不可少的后处理步骤。OpenFOAM生态系统提供了几种方法来改进现有网格的几何形状而不改变拓扑结构，以及调整网格划分参数以从一开始就生成更好的网格。本文讨论了四种此类方法：**smoothMesh**、**improveMeshQuality**（基于cfMesh）、**optiMesh**以及 **snappyHexMesh参数的遗传优化**。
### Centroidal smoothing with smoothMesh

smoothMesh is an open‑source OpenFOAM utility developed by Tuomo Keskitalo to relocate mesh points using a combination of centroidal (cell‑center) Laplacian smoothing and prismatic edge midpoint blending. The algorithm operates in two stages:

smoothMesh 是一个开源的 OpenFOAM 实用程序，由 Tuomo Keskitalo 开发，它结合了质心（单元中心）拉普拉斯平滑和棱柱形边缘中点混合来重新定位网格点。该算法分两个阶段运行：

1. **Predictor step** – Calculates new point positions. Centroidal smoothing uses surrounding cell centres rather than neighbouring vertices to compute a Laplacian‑style average. For high‑aspect‑ratio prismatic cells, the predicted position is blended with the midpoint of the two shortest edges to avoid twisting or folding.
2. **Heuristic quality constraints** – Before applying the move, the algorithm evaluates whether quality metrics (edge length, edge‑edge angles and face‑face angles) would deteriorate. If the move reduces edge length below a user‑specified minEdgeLength the point is frozen. Similar checks prohibit decreases of the minimum edge‑edge angle below minAngle or deterioration of minimum/maximum face‑face angles. These checks freeze points whose movement would create self‑intersections or further flattening.

The result is smoothing that improves non‑orthogonality and skewness while avoiding mesh inversion. Because no cells or faces are created or deleted, topology remains unchanged, making the tool suitable for general polyhedral meshes.

1. **预测步** – 计算新的点位置。质心平滑使用周围的单元中心而非相邻顶点来计算拉普拉斯风格的平均值。对于高纵横比的棱柱单元，预测的位置与两个最短边的中点混合，以避免扭曲或折叠。
2. **启发式质量约束** – 在应用移动之前，算法会评估质量指标（边长、边-边角和面-面角）是否会恶化。如果移动将边长减小到低于用户指定的最小边长 (minEdgeLength)，则该点会被冻结。类似的检查禁止最小边-边角减小到低于最小角度 (minAngle) 或最小/最大面-面角的恶化。这些检查会冻结那些移动会导致自相交或进一步扁平化的点。

最终结果是，平滑既能改善非正交性和偏斜度，又能避免网格反转。由于没有创建或删除单元或面，拓扑结构保持不变，这使得该工具适用于通用多面体网格。


### Key options

SmoothMesh can run in parallel or serial and accepts several parameters:

- -centroidalIters (default 1000): maximum number of smoothing iterations. Smoothing stops once the average displacement relative to maxStepLength drops below the relTol threshold.
- -relTol (default 0.02): relative tolerance for stopping iterations.
- -minEdgeLength: edge length below which movement is frozen. By default this is half the shortest edge in the initial mesh.
- -maxStepLength: maximum displacement per iteration. A stable choice is 10–50 % of the smallest cell side; the default value is 0.3 × minEdgeLength.
- -edgeAngleConstraint and -faceAngleConstraint: enable extra angle‑based quality checks. Default angle thresholds are 35° and 160°.
- Boundary‑layer options (-layerPatches, -layerMaxBlendingFraction, -layerEdgeLength, etc.): identify prismatic edges and blend centroidal smoothing with an orthogonal boundary‑layer target. Useful for preserving inflation layers.
- A boundary‑point smoothing mode (experimental): requires OBJ files describing initial feature edges and target surfaces; allows boundary vertices to move along a defined surface.

### Practical guidance

- Preview the initial mesh and OBJ geometry in ParaView to identify feature edges and surfaces.
- Start with a conservative maxStepLength and gradually increase once you have verified that no self‑intersections appear.
- Enable faceAngleConstraint and choose moderate minAngle/maxAngle values to prevent inverted cells.
- If boundary layers are present, use layerPatches and boundary‑layer blending options to maintain layer thickness.

### cfMesh improveMeshQuality – Laplacian smoothing and untangling

**cfMesh** integrates a mesh‑quality improvement utility called improveMeshQuality that relocates points to improve skewness and non‑orthogonality without invalidating the mesh. It loads a mesh into a polyMeshGen structure and uses meshOptimizer to perform Laplacian smoothing and untangling.
cfMesh 集成了一个名为 improveMeshQuality 的网格质量改进工具，该工具通过重新定位点以改善偏斜度和非正交性而不使网格失效。它将网格加载到 polyMeshGen 结构中，并使用 meshOptimizer 执行拉普拉斯平滑和解缠结。

### User controls

- nLoops (default 10): number of global smoothing loops.
- nIterations (default 50): number of smoothing iterations within each loop.
- nSurfaceIterations (default 2): number of surface-vertex smoothing iterations per loop.
- qualityThreshold (default 0.1): threshold used by the greedy optimiser to target the worst faces.
- constrainedCellSet: name of a cell set to lock; cells in this set are not moved.

- nLoops（默认值 10）：全局平滑循环次数。
- nIterations（默认值 50）：每个循环内的平滑迭代次数。
- nSurfaceIterations（默认值 2）：每个循环中表面顶点平滑迭代次数。
- qualityThreshold（默认值 0.1）：贪婪优化器用于定位最差网格面的阈值。
- constrainedCellSet：要锁定的网格单元集合的名称；此集合中的网格单元不会移动。

```
improveMeshQuality -nLoops 3 -nIterations 60 -nSurfaceIterations 2
```

Three steps are executed:

1. **Volume smoothing**: moves each point towards the average of neighbours or cell centres, optionally weighted by cell volume.
2. **Greedy face optimisation**: applies smoothing only to faces below the quality threshold.
3. **Untangling**: detects inverted cells and moves points to restore positive volumes.

执行三个步骤：

1. **体积平滑**：将每个点移动到邻点或单元中心的平均位置，可选择按单元体积加权。
2. **贪心面优化**：仅对低于质量阈值的面应用平滑。
3. **解扭曲**：检测翻转的单元并移动点以恢复正体积。

meshOptimizer let's you lock cells, faces or points; optimise boundary layers; untangle; improve near‑boundary regions; and apply a final greedy optimisation. polyMeshGenModifier provides low‑level functions to remove duplicate faces, reorder boundaries and add or remove cells, preserving parallel consistency.

meshOptimizer 允许你锁定单元、面或点；优化边界层；解扭结；改善近边界区域；并应用最终的贪婪优化。polyMeshGenModifier 提供低级函数以删除重复面、重新排序边界并添加或移除单元，同时保持并行一致性。

### optiMesh – iterative smoothing and boundary refinement

**optiMesh** is an open‑source mesh smoothing utility developed by the OpenEngineer project. It relocates mesh points based on a configurable smoothing direction, solver and step strategy, specified in a system/optiMeshDict file. The default direction is **pointLaplacian**, which applies explicit Laplacian smoothing; an alternative **orthogonality** objective optimiser is included but has not been seen to outperform Laplacian smoothing and is significantly slower. The tool is installed via the Allwmake script and writes binaries to the user’s OpenFOAM directories.

**optiMesh** 是一个开源的网格平滑工具，由 OpenEngineer 项目开发。它基于可配置的平滑方向、求解器和步长策略重新定位网格点，这些配置在 system/optiMeshDict 文件中指定。默认方向是 **pointLaplacian**，它应用显式拉普拉斯平滑；另一个可选的 **orthogonality** 目标优化器也被包含在内，但尚未发现其性能优于拉普拉斯平滑，且速度明显较慢。该工具通过 Allwmake 脚本安装，并将二进制文件写入用户的 OpenFOAM 目录。


**Algorithm and features**

When **optiMesh** starts, it reads _optiMeshDict_ to construct a smoothing direction (_optiDirection_), solver (_optiSolver_) and step controller (_optiStep_). It also processes a _boundaryRefinement_ sub‑dictionary defining near‑wall layer thickness, growth ratio and number of layers. In each iteration, the algorithm updates the direction, applies the solver and computes a step length before moving points; it can collapse degenerate edges and cells and enforces user‑defined constraints. If boundary refinement is active, the program calculates desired cell centres and smooths the boundary layer with a relaxation factor.

当 optiMesh 启动时，它读取 optiMeshDict 来构建平滑方向（optiDirection）、求解器（optiSolver）和步长控制器（optiStep）。它还处理一个 boundaryRefinement 子字典，该字典定义近壁层厚度、增长比和层数。在每次迭代中，算法更新方向、应用求解器并在移动点之前计算步长；它可以合并退化的边和单元并强制执行用户定义的约束。如果启用边界细化，程序会计算期望的单元中心并以松弛因子平滑边界层。

**Key parameters in opiMeshDict include:**

- nIters – total number of smoothing iterations.
- writeInterval – frequency of mesh writes; negative values disable writing.
- direction.type – smoothing direction, e.g., _pointLaplacian_ for Laplacian smoothing or _orthogonality_ to target orthogonality.
- solver.type – solver for the direction update; _none_ performs explicit updates while _CG_ (commented) would use a conjugate gradient solver.
- step.type – method for computing step length; _relaxed_ uses user‑defined relaxation factors and initial trial steps while _quadraticSearch_ (commented) performs a quadratic line search.
- boundaryRefinement – defines boundary layer refinement with parameters _r0_ (growth ratio), _d0_ (first layer thickness), _nLayers_ (approximate number of layers) and a relaxation factor. Patch‑specific refinement allows different settings on each boundary.
- collapseDegenerateHexCells + degenerateAngle – whether to collapse degenerate hex cells and the angle threshold for identification.
- **constraints** – list of planar, cylindrical or fixed point sets that restrict movement of specified points.


**optiMesh** also includes additional tools such as _removeCells_, _collapseCells_, _bashTools_ and _moveLastToConstant_; however, these are separate utilities and not part of smoothing. Although an objective optimiser is available, the developers note that it has not yet produced better results than Laplacian smoothing and is much slower. A future enhancement in the README is implicit Laplacian smoothing, which should improve speed for fine meshes.

**optiMesh** 还包含其他工具，例如 _removeCells_、_collapseCells_、_bashTools_ 和 _moveLastToConstant_；然而，这些是独立的实用程序，不属于平滑操作的一部分。虽然提供了一个目标优化器，但开发者指出，它尚未产生比拉普拉斯平滑更好的结果，并且速度慢得多。README 中提到的一项未来增强功能是隐式拉普拉斯平滑，这应该可以提高细网格的速度。


### Genetic optimisation of snappyHexMesh parameters

Fabritius and Tabor proposed a **genetic optimisation** approach to tune _snappyHexMesh_ parameters in OpenFOAM. The method treats the meshing process as a multi‑objective optimisation problem.

- **Encoding**: each individual in the genetic algorithm encodes a set of meshing parameters.
- **Evaluation**: candidate meshes are generated and evaluated against quality metrics such as non‑orthogonality, skewness and aspect ratio.
- **Evolution**: an NSGA‑II multi‑objective algorithm performs selection, crossover and mutation to evolve the population towards a Pareto front.
- **Outcome**: significant improvements in mesh quality were reported across three geometries.

Although computationally expensive, this method optimises the mesher settings upfront, preventing poor‑quality cells from being generated.

### Choosing the right approach

- If you have a consistent 3D polyhedral mesh and want to reduce skewness or non‑orthogonality while preserving topology, **use smoothMesh**. Its centroidal smoothing with angle and boundary‑layer constraints improves quality without changing topology.
- If you need an automated smoother that can lock regions, untangle inverted cells and target specific areas, **use improveMeshQuality**. It offers Laplacian smoothing with constraints, local untangling and boundary‑layer optimisation.
- If the automated mesher is producing poor cells due to parameter choices, **use genetic optimisation** of snappyHexMesh. A multi‑objective genetic algorithm tunes mesher parameters to avoid poor‑quality cells.

### Final remarks

Mesh quality improvement remains critical for robust CFD solutions. **smoothMesh** provides centroidal smoothing with quality safeguards and boundary‑layer handling. **cfMesh improveMeshQuality** offers Laplacian smoothing, untangling and targeted improvements with fine user control. **optiMesh** adds an iterative Laplacian smoother with configurable direction, step and boundary refinement, enabling flexible near‑wall smoothing and constraint handling. **Genetic optimisation** tunes mesher parameters before meshing to generate inherently better meshes. Choosing the right tool - or combining them - helps OpenFOAM practitioners produce meshes that converge reliably and capture the physics with confidence.

### References

- smoothMesh – [https://github.com/tkeskita/smoothMesh](https://github.com/tkeskita/smoothMesh)
- improveMeshQuality.C – [https://develop.openfoam.com/Community/integration-cfmesh/-/blob/main/utilities/improveMeshQuality/improveMeshQuality.C](https://develop.openfoam.com/Community/integration-cfmesh/-/blob/main/utilities/improveMeshQuality/improveMeshQuality.C)
- meshOptimizer.H – [https://develop.openfoam.com/Community/integration-cfmesh/-/blob/a426a16af11c3e7b1a3530706a29ae6ff65e0dc3/meshLibrary/utilities/smoothers/geometry/meshOptimizer/meshOptimizer.H](https://develop.openfoam.com/Community/integration-cfmesh/-/blob/a426a16af11c3e7b1a3530706a29ae6ff65e0dc3/meshLibrary/utilities/smoothers/geometry/meshOptimizer/meshOptimizer.H)
- polyMeshGenModifier.H – [https://develop.openfoam.com/Community/integration-cfmesh/-/blob/66409e8686f94643939656fda172f0f35ad5696c/meshLibrary/utilities/meshes/polyMeshGenModifier/polyMeshGenModifier.H](https://develop.openfoam.com/Community/integration-cfmesh/-/blob/66409e8686f94643939656fda172f0f35ad5696c/meshLibrary/utilities/meshes/polyMeshGenModifier/polyMeshGenModifier.H)
- optiMesh – [https://github.com/OpenEngineer/optiMesh](https://github.com/OpenEngineer/optiMesh).
- Genetic optimisation paper (Springer) – [https://doi.org/10.1007/s00366-015-0423-0](https://doi.org/10.1007/s00366-015-0423-0)
- Genetic optimisation PDF (Core) – [https://core.ac.uk/download/pdf/43095861.pdf](https://core.ac.uk/download/pdf/43095861.pdf)
- Next-Gen Meshing Technology at IANUS Simulation – [https://ianus-simulation.de/webinars/next-gen-meshing](https://ianus-simulation.de/webinars/next-gen-meshing)