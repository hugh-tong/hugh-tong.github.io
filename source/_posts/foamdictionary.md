---
title: foamDictionary 用法详解
date: 2026-09-15 15:00:00
categories:
  - [CFD, OpenFOAM, 工具]
tags:
  - CFD/OpenFOAM/工具
  - simpleFoam
  - Bash
  - RANS
  - OpenFOAM
description: foamDictionary 命令行读写字典工具：查询、修改、新增条目的完整用法。
mathjax: true
---

# foamDictionary 使用指南与实例

`foamDictionary` 是 OpenFOAM 自带的字典读写工具，用于在命令行对字典文件（如 `system/controlDict`、`constant/transportProperties`、`0/U` 等）进行查询、修改、插入、删除、格式化输出。它可以避免手工编辑易出错，尤其适合脚本化和批处理。

---

## 常见用途概览

- **查看条目**：读取某个键的值或子字典
- **设置/更新值**：修改标量、向量、字符串、列表、维度量
- **插入/删除条目**：添加新键、移除旧键
- **路径定位**：支持嵌套子字典与层级键路径
- **格式化/规范化**：重新排版、统一键排序（可选）
- **输出重定向**：将结果写回文件或输出到标准输出用于管道

---

## 基本语法

```bash
foamDictionary <dictFile> [选项] [操作]
```

- `<dictFile>`：目标字典文件路径（相对或绝对）
- 常见选项：
    - `-entry <keyPath>`：指定要操作的键或路径
    - `-value <val>`：设置时提供值
    - `-remove`：删除条目
    - `-add`：添加条目（不存在则新增，存在则报错或按版本策略）
    - `-set`：设置（存在则改值，不存在则新增）
    - `-subDict <name>`：对某个子字典上下文操作
    - `-keywords`：列出当前（子）字典下所有键
    - `-expand`：展开 `#include` 和环境变量
    - `-disableFunctionEntries`：不展开函数项
    - `-serialize`：规范化输出（序列化、可用于覆盖原文件）
    - `-disableFunctionEntries`：仅当你不希望处理 `#codeStream` 等函数项时
    - `-dict <name>`：指定读取的字典对象名（少用）
- 注意：不同发行版（OpenFOAM.org vs .com）选项细节略有差异，以下示例在常见版本中通用。

---

## 查看与查询

### 读取一个标量或字符串

```bash
foamDictionary system/controlDict -entry application
```

输出类似：

```
application     simpleFoam;
```

只要值（搭配管道处理）：

```bash
foamDictionary system/controlDict -entry application | awk '{print $2}' | tr -d ';'
```

### 读取向量、维度量、列表

```bash
foamDictionary 0/U -entry internalField
foamDictionary constant/transportProperties -entry nu
```

### 读取子字典或枚举键

- 列出某个字典下的键：

```bash
foamDictionary system/fvSchemes -keywords
```

- 读取子字典：

```bash
foamDictionary system/fvSchemes -entry divSchemes
```

- 切换上下文到子字典再列出键：

```bash
foamDictionary system/fvSchemes -subDict divSchemes -keywords
```

### 展开 include

```bash
foamDictionary system/controlDict -expand -entry functions
```

---

## 设置与修改

### 设置标量或字符串（存在则改，不存在则添）

```bash
foamDictionary system/controlDict -entry writeInterval -set 100
foamDictionary system/controlDict -entry application -set simpleFoam
```

字符串会自动加分号；数值会保持数值类型。

### 设置向量/列表

```bash
foamDictionary 0/U -entry internalField -set "uniform (1 0 0)"
foamDictionary system/controlDict -entry libs -set '( "libmyFunc.so" "libforces.so" )'
```

注意：列表用 `(...)`，字符串元素用引号。

### 设置维度量

```bash
foamDictionary constant/transportProperties -entry nu -set "nu [0 2 -1 0 0 0 0] 1e-05"
```

或简化为：

```bash
foamDictionary constant/transportProperties -entry nu -set "[0 2 -1 0 0 0 0] 1e-05"
```

（不同版本对紧凑写法的支持不同，保险起见使用完整键值对形式）

### 添加新条目（只在不存在时添加）

```bash
foamDictionary system/controlDict -entry myFlag -add true
```

### 删除条目

```bash
foamDictionary system/controlDict -entry purgeWrite -remove
```

---

## 嵌套键路径

有时希望直接定位深层条目，可用“路径式”键名（版本相关，若不支持则使用 `-subDict` 逐层进入）：

- 路径式（若版本支持）：

```bash
foamDictionary system/snappyHexMeshDict -entry "castellatedMeshControls/maxLocalCells" -set 100000
```

- 逐层进入：

```bash
foamDictionary system/snappyHexMeshDict \
  -subDict castellatedMeshControls \
  -entry maxLocalCells -set 100000
```

---

## 序列化与覆盖写回

对文件做多次修改后，可能希望重新格式化并保存：

- 直接修改文件（`-set/-add/-remove` 默认就地更新）
- 需要统一格式时：

```bash
foamDictionary system/fvSchemes -serialize > system/fvSchemes.new && mv system/fvSchemes.new system/fvSchemes
```

或某些版本支持：

```bash
foamDictionary system/fvSchemes -serialize -write
```

---

## 批处理与脚本化

### 一次做多项修改（用 shell）

```bash
foamDictionary system/controlDict -entry writeControl -set timeStep
foamDictionary system/controlDict -entry writeInterval -set 200
foamDictionary system/controlDict -entry purgeWrite -set 3
```

或使用一个函数/脚本组织。

### 从模板生成差异配置

- 先读取模板值，做判断后再 `-set`；
- 结合 `awk/sed/jq` 等工具，对输出进行进一步处理。

---

## 实用示例合集

- 查看当前求解器名称：

```bash
foamDictionary system/controlDict -entry application | awk '{print $2}' | tr -d ';'
```

- 启用 `forces` 函数对象（如果未存在则添加）：

```bash
foamDictionary system/controlDict -entry functions -add \
'forces
{
    type        forces;
    functionObjectLibs ("libforces.so");
    patches     (object);
    rhoName     rhoInf;
    rhoInf      1;
    CofR        (0 0 0);
}'
```

- 修改 `snappyHexMeshDict` 中的 `maxLocalCells` 和 `resolveFeatureAngle`：

```bash
foamDictionary system/snappyHexMeshDict -subDict castellatedMeshControls -entry maxLocalCells -set 200000
foamDictionary system/snappyHexMeshDict -subDict castellatedMeshControls -entry maxGlobalCells -set 10000000
foamDictionary system/snappyHexMeshDict -subDict castellatedMeshControls -entry resolveFeatureAngle -set 45
```

- 检查 OpenQBMM 参数（例如我们之前讨论的 dMin/dMax）：

```bash
foamDictionary constant/myPopBalDict -entry dMin
foamDictionary constant/myPopBalDict -entry dMax
```

- 展开包含，查看合并后的 `controlDict`：

```bash
foamDictionary system/controlDict -expand
```

---

## 小贴士与排错

- **备份文件**：大改动前备份原字典，或用 git 管理工程。
- **引号与括号**：字符串需引号；列表需 `()`；子字典需 `{}`。在命令行中建议用单引号包裹复杂内容，避免 shell 变量展开。
- **版本差异**：若某选项报未知，尝试 `foamDictionary -help` 查看你版本的支持项。
- **函数项**：含有 `#include`, `#calc`, `#codeStream` 等时，用 `-expand` 获取展开后的结果；如不希望执行函数项，配合 `-disableFunctionEntries`。
- **并行案例**：对 `processor*/` 下的字典操作需要逐个处理或对 `system/` 源字典处理后再重分区。

---

## 速查表

|任务|命令|
|---|---|
|列出键|`foamDictionary file -keywords`|
|读键值|`foamDictionary file -entry key`|
|设置键值|`foamDictionary file -entry key -set "value"`|
|添加新键|`foamDictionary file -entry key -add "value"`|
|删除键|`foamDictionary file -entry key -remove`|
|进入子字典|`foamDictionary file -subDict sub -entry key -set val`|
|展开 include|`foamDictionary file -expand`|
|规范化输出|`foamDictionary file -serialize`|

---

如果你告诉我你的具体场景（比如要修改哪个字典的哪些键，值的示例），我可以给你直接可运行的一组命令。
