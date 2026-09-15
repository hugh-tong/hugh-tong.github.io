---
title: VTK/VTM/VTU 文件格式速查
date: 2026-09-15 12:00:00
categories:
  - [CFD, OpenFOAM, 网格]
tags:
  - CFD/OpenFOAM/网格
  - PyVista
  - 网格
  - 浸没边界法
  - Cpp
description: ParaView/VTK 系列文件(vtu/vtm/vtp)的层级关系与 OpenFOAM 后处理中的对应物。
mathjax: true
---
## 101,AI-Gen-Ref

这三种格式都是属于 **VTK (Visualization Toolkit)** 生态系统的文件格式，在计算流体力学（CFD）、有限元分析（FEA）和计算机图形学（比如你正在做的 Taichi 物理模拟）中极其常见，它们通常用 **ParaView** 这个软件来打开和渲染。

简单来说，它们代表了 VTK 格式的**不同时代**和**不同数据组织结构**。下面我用最直白的方式为你拆解它们的区别：

### 1. `.vtk` 格式 (Legacy VTK) —— “简单粗暴的老前辈”
这是最早期的传统格式（Legacy Format）。
*   **长什么样**：它可以是纯文本（ASCII）或者二进制（Binary）。它的结构非常简单，就像流水账一样，依次写下：点坐标（Points）、单元连接关系（Cells）、点数据（Point Data，比如速度）、单元数据（Cell Data，比如压力）。
*   **优点**：**极度容易手写**！如果你用 C++ 或 Python 自己写一个导出器，用最基础的 `printf` 或 `f.write()` 就能生成一个文本版的 `.vtk` 文件，非常适合新手写简单的物理引擎时用来导出数据。
*   **缺点**：不支持高级的数据压缩；不支持把多个独立部件组合在一起；文件一旦变大，读取和写入速度就成了瓶颈。

### 2. `.vtu` 格式 (XML Unstructured Grid) —— “现代的主力军”
为了解决老 `.vtk` 格式的缺点，官方后来推出了一套基于 **XML** 的现代格式标准。`.vtu` 就是其中专门用来存**非结构化网格（Unstructured Grid）**的格式。
*   **长什么样**：用文本编辑器打开它，你会看到类似 HTML 一样的标签结构（如 `<VTKFile>`, `<Piece>`, `<Points>`）。虽然外壳是 XML 文本，但它的核心海量数据（坐标、物理量）通常是用 Base64 编码压缩后放在文件末尾（Appended Data）的。
*   **优点**：**支持强大的压缩算法（如 Zlib）**，能极大减小文件体积；读取速度极快；极其规范。
*   **缺点**：格式复杂，很难“纯手写”代码来生成，通常需要调用专门的库（比如 Python 的 `meshio`、`pyvista` 或 C++ 的 `vtkIO`）来导出。
*   **适用场景**：这是你做流体模拟、弹性体形变模拟时**最常用的单体格式**。只要你的网格是由四面体、六面体、或者任意乱七八糟的形状组成的，存 `.vtu` 就对了。

### 3. `.vtm` 格式 (XML Multiblock Dataset) —— “发号施令的大管家”
这也是现代 XML 格式族的一员，但它**本身不存任何网格数据**！它是一个“索引文件”或“容器”。
*   **长什么样**：它本质上是一个目录树。里面写着类似：“树枝 A 引用了 `fluid.vtu`，树枝 B 引用了 `solid.vtp`，树枝 C 引用了 `boundary.vti`”。
*   **优点**：可以把不同类型、不同分辨率、甚至是不同物理场的数据打包在一起管理。在 ParaView 里打开一个 `.vtm` 文件，你可以方便地在左侧目录树里单独隐藏/显示某个部件（Block）。
*   **适用场景**：**复杂的多物理场/多部件场景**。比如你模拟了一辆汽车在风洞里吹风，汽车表面可以存为一个 `.vtp`（多边形面），周围的流场网格存为好几个 `.vtu`。然后你用一个 `.vtm` 文件把它们整合起来，ParaView 只需要加载这个 `.vtm` 就能看到整个完整的场景。

---

### 💡 一个通俗的比喻总结

假设你要写一本书（保存你的模拟结果）：
*   **`.vtk`**：就像是一份用记事本写的 **`.txt` 草稿**。文字都在，结构简单，但没法排版，也没法插入复杂的目录，胜在随便什么软件都能打开它，随便谁都能写。
*   **`.vtu`**：就像是一份排版精美、配有插图、且经过 ZIP 压缩的 **`.docx` Word 文档**。它是现代标准的单文件格式，功能强大，体积小巧，但你需要专门的软件（库）去生成它。
*   **`.vtm`**：就像是一个 **`.zip` 压缩包或者一个项目文件夹**。它里面装了好几份不同的 Word 文档（vtu/vtp），并附带了一张目录清单，告诉你先看哪份后看哪份，用来管理极其复杂的工程。

**给你的建议**：
既然你在做 Taichi 的图形学/物理项目，如果你想导出三维结果丢进 ParaView 里渲染：
1. **初期写 Demo 时**：用 Python 简单拼接字符串导出传统的 `.vtk`（ASCII），最省事。
2. **项目成熟、网格达到几十万规模时**：一定要换用 Python 库（比如 `meshio` 或 `taichi.tools` 里的导出功能）将其导出为带有数据压缩的 **`.vtu`**。


##  VF-UNS


`.vtm`文件：

```
<?xml version="1.0"?>
<VTKFile type="vtkMultiBlockDataSet" version="1.0" byte_order="LittleEndian">
  <vtkMultiBlockDataSet>
    <DataSet index="0" file="stadium_piece/all_elems(mesh)/0/part_0.vtu"/>
  </vtkMultiBlockDataSet>
  
```

实际的`part_0.vtu`才有计算得到的数据

## foamToVTK


### AI 生成转化逻辑

{% mermaid %}
flowchart TD
  Start([开始])
  ParseCmd["解析命令行 & 输出选项"]
  TimeLoop["遍历时间步（for each timeDir）"]
  RegionLoop["遍历 region（for each region）"]

  CheckTopo{"检查 polyMesh 更新\n(TOPO_CHANGE / TOPO_PATCH_CHANGE)"}
  ClearVtu["清除 vtu 映射（若拓扑变化）"]

  ConvertTopo["convertTopoSet.H\n(写 topoSets)"]
  TopoWrote?{"wroteTopoSet?"}

  SetupObjects["准备 IOobjectList / faObjects（字段列表）"]
  ProcPatch?{"processorFieldsOnly?"}
  ConvertProc["convertProcessorPatches.H\n(仅写 processor patch 字段)\n然后 continue"]

  ConvertVolume["convertVolumeFields.H\n- 建立 internal/patch writer\n- writeGeometry\n- 写 CellData（writeAllVolFields / writeAllDimFields）\n- 若需要：插值并写 PointData（writeAllPointFields）\n- 关闭 writers，生成 .vtu/.vtm"]

  ConvertSurface["convertSurfaceFields.H\n- 读 surfaceScalar/Vector\n- 写 surface-fields (.vtp/.vtm)\n- 写 faceZones（若请求）"]

  ConvertArea["convertAreaFields.H\n- 若存在 finite-area：构建 faMesh 并写入 (.vtp) "]

  ConvertLagr["convertLagrangian.H\n- 发现 cloud(s) 并写 Lagrangian (.vtp)"]

  EmitMultiVTM{"是否 master 且 multi-region?"}
  WriteMultiVTM["写 多 region .vtm 与 series (.json) "]

  End([结束])

  Start --> ParseCmd --> TimeLoop --> RegionLoop
  RegionLoop --> CheckTopo
  CheckTopo --> ClearVtu
  ClearVtu --> ConvertTopo
  ConvertTopo --> TopoWrote?
  TopoWrote? -- 是 --> RegionLoop
  TopoWrote? -- 否 --> SetupObjects

  SetupObjects --> ProcPatch?
  ProcPatch? -- 是 --> ConvertProc --> RegionLoop
  ProcPatch? -- 否 --> ConvertVolume --> ConvertSurface --> ConvertArea --> ConvertLagr --> EmitMultiVTM

  EmitMultiVTM -- 是 --> WriteMultiVTM --> RegionLoop
  EmitMultiVTM -- 否 --> RegionLoop

  %% 备注：最终每个 writer 会追加到 file-series 并由 master 节点写入磁盘
  classDef note fill:#fff7cc,stroke:#e6c200

  Note["说明：顺序为 topoSets -> (processor patches 或) volume -> surface -> area -> lagrangian -> multi-region 汇总"]:::note
  End --> Note

{% endmermaid %}



### 借助paraview的pvpython

已形成脚本至自己的foam tools