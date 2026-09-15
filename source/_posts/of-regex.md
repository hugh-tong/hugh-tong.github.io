---
title: OpenFOAM 中的正则表达式
date: 2026-09-15 15:00:00
categories:
  - [CFD, 数值方法]
tags:
  - CFD/OpenFOAM/工具
  - 多相流
  - interFoam
  - simpleFoam
  - OF
description: OpenFOAM 字典与命令行中正则表达式的语法要点与应用实例。
mathjax: true
---

## OpenFOAM中的正则表达式

在 OpenFOAM 的开发和工程应用中，正则表达式（Regular Expressions）是实现**配置文件简洁化**和**批量处理**的核心利器。OpenFOAM 内部通过 `regExp` 类封装了 POSIX 扩展正则表达式，允许我们在字典文件中使用通配符和模式匹配。

以下我为你整理了 OpenFOAM 官方案例（ESI 和 Foundation 版本）中正则表达式应用的几个经典维度：

---

### 1. 求解器控制与容差设置 (`fvSolution`)

这是工程中最常见的应用。为了避免给  等每个场单独写一遍设置，我们通常使用括号和 `|`（逻辑或）进行分组。

**官方案例参考：** `tutorials/incompressible/simpleFoam/motorBike/system/fvSolution`

```cpp
solvers
{
    // 使用正则表达式匹配所有以 p 开头的压力相关场（如 p, p_rgh）
    "p.*"
    {
        solver          GAMG;
        tolerance       1e-06;
        relTol          0.01;
        // ...
    }

    // 匹配速度场、湍流物理量以及其他标量场
    "(U|k|epsilon|omega|f|v2)"
    {
        solver          smoothSolver;
        smoother        symGaussSeidel;
        tolerance       1e-08;
        relTol          0.1;
    }
}

```

---

### 2. 边界条件批量定义 (`0/` 文件夹)

在复杂几何（如你的泄洪道或汽车外流场）中，边界（Patch）可能多达几十个。通过正则匹配，可以一键给所有壁面赋予相同的壁面函数。

**官方案例参考：** `tutorials/incompressible/pisoFoam/RAS/cavity/0/nut`

```cpp
boundaryField
{
    // 匹配所有包含 "wall" 字符串的边界（如 bottomWall, topWall, pipe_wall）
    ".*Wall.*"
    {
        type            nutkWallFunction;
        value           $internalField;
    }

    // 针对特定前缀的匹配（在 motorBike 案例中常见）
    "motorBike_.*"
    {
        type            nutkWallFunction;
        value           $internalField;
    }
}

```

---

### 3. 离散格式统一指定 (`fvSchemes`)

如果你希望对所有的对流项使用同一种格式，或者对某一类标量进行统一限制，正则非常有帮助。

**官方案例参考：** 广泛应用于复杂多相流案例

```cpp
divSchemes
{
    default         none;
    
    // 匹配所有 div(phi, 变量) 形式的项
    "div\(phi,.*\)"  Gauss linearUpwind grad(U);
    
    // 专门匹配湍流物理量的对流项
    "div\(phi,(k|epsilon|omega|nuTilda)\)" Gauss limitedLinear 1;
}

```

> **注意：** 在 OpenFOAM 字典中，某些特殊字符如 `(` 或 `)` 需要使用反斜杠 `\` 转义，或者将整个表达式放入双引号中。

---

### 4. 并行计算划分 (`decomposeParDict`)

在进行区域分解时，如果我们希望某些特定的边界不被切分，或者属于特定的处理器约束，可以使用正则。

**官方案例参考：** `tutorials/multiphase/interFoam/RAS/damBreak/system/decomposeParDict`

```cpp
constraints
{
    // 约束特定的 patch 不在分解时被跨越
    preservePatches
    {
        // 匹配所有以 "inlet" 或 "outlet" 结尾的边界
        patches         (".*inlet" ".*outlet");
    }
}

```

---

### 5. 功能对象与监控 (`functionObjects`)

在 `controlDict` 中设置监控时，如果需要同时对多个场求平均或计算力，正则可以极大地减少代码量。

**官方案例参考：** `system/controlDict` 中的 `fieldAverage`

```cpp
functions
{
    fieldAverage1
    {
        type            fieldAverage;
        libs            (fieldFunctionObjects);
        writeControl    writeTime;
        // 匹配所有需要计算平均值的场
        fields
        (
            "U.*"  // 匹配 U, Um, Umean 等
            {
                mean        on;
                prime2Mean  on;
                base        time;
            }
        );
    }
}

```

---

### 6. 开发者进阶：正则在代码中的实现

如果你在进行二次开发（C++），你可以直接调用 OpenFOAM 的 `regExp` 类。

**底层代码片段示例：**

```cpp
#include "regExp.H"

// 定义一个正则表达式对象
regExp wallMatcher(".*Wall.*");

// 检查某个 patch 名称是否匹配
if (wallMatcher.match(patchName))
{
    // 执行相关逻辑
    Info<< "Applying logic to wall: " << patchName << endl;
}

```

---

### 总结：常用正则符号速查表

| 符号 | 含义 | OpenFOAM 典型用法 |
| --- | --- | --- |
| `.` | 匹配任意单个字符 | `p.` 匹配 p1, p2 |
| `.*` | 匹配零个或多个任意字符 | `.*Wall` 匹配所有墙 |
| ` | ` | 逻辑或 |
| `[]` | 字符集合 | `patch[1-3]` 匹配 patch1, 2, 3 |
| `^` | 匹配行首 | 通常用于某些字符串过滤 |
| `$` | 匹配行尾 | `.*Inlet$` 匹配以 Inlet 结尾的边界 |

### 专家提醒：

1. **引号的使用：** 包含 `*` 或 `|` 的正则表达式**务必使用双引号**包裹，例如 `"U|k|omega"`，否则 OpenFOAM 会将其识别为普通的非法字符。
2. **测试技巧：** 如果不确定正则是否生效，可以使用 `foamDictionary` 工具进行测试。
```bash
# 测试在 fvSolution 中正则是否正确匹配了字段
foamDictionary system/fvSolution -entry solvers

```



**下一步建议：**
针对你的泄洪道 1000 万网格案例，如果边界 Patch 非常零碎（比如 ICEM 导出的多个面），你想让我帮你写一个特定的正则表达式，把所有的“侧墙”、“底板”和“跌坎”分别归类到统一的边界条件中吗？只需告诉我你的 Patch 命名规律即可。


## face_011到face_067正则


在 OpenFOAM 中，手动列出从 `face_011` 到 `face_067` 显然太繁琐。利用 **POSIX 正则表达式**，我们可以根据数字的分布规律进行压缩。

针对你的需求，这里有三种由简入深的写法，建议根据你的网格中是否存在其他类似命名的 Patch 来选择：

### 1. 最简洁写法：基于通配符（推荐）

如果你确定 `face_` 开头的编号中，你只想处理这部分，且没有 `face_100` 以上或 `face_001` 以下的干扰项，可以直接使用：

```cpp
"face_0.*"

```

* **含义**：匹配所有以 `face_0` 开头的边界名。
* **适用场景**：最常用，只要编号都在 `0xx` 范围内且没有其他不相关的 `face_0` 边界。

---

### 2. 范围精确写法：基于字符集

如果你需要限制在 `011` 到 `067` 之间，且担心匹配到 `face_001` 或 `face_070`，可以使用字符集组合：

```cpp
"face_0[1-6][0-9]"

```

* **解析**：
* `face_0`：固定前缀。
* `[1-6]`：第二位数字在 1 到 6 之间。
* `[0-9]`：第三位数字是任意 0 到 9。


* **注意**：这个写法实际匹配的是 `010` 到 `069`。如果你的 Patch 刚好是从 `011` 到 `067`，且不存在 `010`, `068`, `069` 这三个 Patch，这是**工程上最优雅的写法**。

---

### 3. 严格区间写法：基于逻辑分支

如果你是一个完美主义者，必须**严格只匹配** `011-067`，不许有多余的数字进入，写法如下：

```cpp
"face_0(1[1-9]|[2-5][0-9]|6[0-7])"

```

* **解析（使用 `|` 逻辑或）**：
* `1[1-9]`：匹配 011 到 019。
* `[2-5][0-9]`：匹配 020 到 059。
* `6[0-7]`：匹配 060 到 067。


* **适用场景**：Patch 命名极其混乱，周围充满了不相关的编号。

---

### 工程师的操作技巧：如何在 `0/U` 等字典中应用？

在泄洪道案例中，如果你要给这些面统一设置壁面函数，建议这样写：

```cpp
boundaryField
{
    // 使用双引号包裹正则表达式
    "face_0[1-6][0-9]"
    {
        type            nutkWallFunction;
        value           $internalField;
    }
    
    // 其他边界...
}

```

### 调试小工具

如果你不确定正则写得对不对，不需要运行求解器，直接在终端输入：

```bash
# 列出所有匹配该正则的 patch 名称（假设当前在 case 目录下）
foamDictionary -entry "boundaryField" 0/U | grep -E "face_0[1-6][0-9]"

```

**为什么我建议你用方案 2？**
在 1000 万网格的复杂案例中（尤其是 ICEM 导出的网格），Patch 命名通常会有微小的跳号。使用稍微宽松一点的正则（如方案 2）可以增强脚本的**鲁棒性**，即使后续网格微调增加了一个 `face_068`，你的边界条件依然能自动覆盖它，而不需要重写正则。

你想让我帮你把这些 Patch 的正则应用到 `fvSolution` 里的线性求解器分组中，还是应用到 `0/` 文件夹的边界条件设置里？