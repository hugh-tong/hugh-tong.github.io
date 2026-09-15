---
title: OpenFOAM 跑测试的工具链设计
date: 2026-09-15 15:00:00
categories:
  - [CFD, OpenFOAM, 工具]
tags:
  - CFD/OpenFOAM/工具
  - blockMesh
  - LES
  - simpleFoam
  - MPI
description: runTest 工具链的设计笔记:如何组织 OpenFOAM 回归测试与结果比对(202512)。
mathjax: true
---

## AI+ProductMan

Q:我想基于我日常使用OpenFOAM的习惯定制一个Python+shell+conda安装，可以直接在终端运行命令的runTest工具。我需要怎么样prompt，得到一个完整的项目。给我一个模版

这是一个非常实用且典型的开发辅助工具需求。要得到一个**完整、可用、结构清晰**的项目，你的 Prompt 需要扮演一个**“产品经理+技术架构师”**的角色，清晰地告诉 AI 你的工作流、痛点以及期望的技术栈。

下面是一个为你量身定制的 Prompt 模板。你可以直接复制并根据你的具体习惯微调括号里的内容。

---

### 🚀 定制 OpenFOAM runTest 工具的 Prompt 模版

**Role (角色设定):** 你是一名资深的 CFD 工程师兼 DevOps 专家，精通 OpenFOAM 工作流、Python 脚本自动化、Shell 编程以及 Conda 环境管理。你擅长编写鲁棒性强、易于维护的命令行工具（CLI）。

**Goal (目标):** 我需要你为一个 OpenFOAM 自动化测试与运行工具生成**完整的项目结构和代码**。该工具名为 `runTest`，旨在简化我日常的 CFD 仿真流程，支持“一键运行”原本需要手动执行的一系列繁琐命令。

**Constraints & Tech Stack (约束与技术栈):**

1. **核心逻辑**：使用 **Python** (建议使用 `click` 或 `argparse` 库) 处理参数解析和逻辑控制。
2. **执行层**：使用 **Python 的 `subprocess`** 模块或直接调用 **Shell 脚本** 来执行 OpenFOAM 命令（如 `blockMesh`, `simpleFoam` 等）。
3. **环境管理**：必须包含 **Conda** 环境配置文件 (`environment.yml`)，确保 Python 依赖可复现。
4. **安装方式**：提供一个 `setup.py` 或安装脚本，使得安装后我可以在终端任何目录下直接输入 `runTest` 运行。
5. **平台**：Linux (Ubuntu/CentOS)，适配 OpenFOAM 常用环境。

**My Workflow (我的日常工作流 - 请重点参考):** _(这里是你要根据自己习惯修改的地方)_

> 目前我每次做一个新算例，步骤是：
> 
> 1. 清理旧算例 (`foamCleanTutorials` 或删除 `0/` 下的过程文件)。
> 2. 生成网格 (通常是 `blockMesh`，有时候需要 `snappyHexMesh -overwrite`)。
> 3. 检查网格 (`checkMesh`)。
> 4. 运行求解器 (比如 `simpleFoam`，有时需要后台运行并重定向 log)。
> 5. (可选) 运行后处理脚本 (比如 `postProcess -func yPlus`)。

**Functional Requirements (功能需求):** 请实现以下具体功能：

1. **模式选择**：支持不同的运行模式，例如：
    - `runTest --clean`：仅清理算例。
    - `runTest --mesh`：仅生成网格。
    - `runTest --solve`：仅运行求解器。
    - `runTest --all`：全自动流程 (Clean -> Mesh -> Solve)。
2. **求解器自动识别**：尝试从 `system/controlDict` 中自动读取 `application` 字段，以此决定运行哪个求解器（不用每次都手动输入 `simpleFoam` 或 `pisoFoam`）。
3. **多核并行支持**：支持参数如 `-p 4`，自动进行 `decomposePar`，运行 `mpirun`，计算完后自动 `reconstructPar`。
4. **日志管理**：所有 OpenFOAM 命令的输出自动保存为 `.log` 文件（如 `log.blockMesh`, `log.simpleFoam`）。

**Deliverables (交付物):** 请提供以下文件的完整代码，并按文件结构组织好：

1. **`structure.txt`**: 项目目录树结构。
2. **`environment.yml`**: Conda 环境配置。
3. **`setup.py`**: 用于打包和安装 CLI 命令的脚本。
4. **`src/main.py`**: Python 主程序逻辑。
5. **`src/utils.py`**: 封装好的 Shell 命令执行函数、OpenFOAM 字典读取函数。
6. **`README.md`**: 简短的使用说明，包括如何安装和运行。

**Tone (语气):** 代码需要有详细的注释，不仅解释“怎么做”，还要解释“为什么这么做”（例如为什么用 `subprocess.run` 而不是 `os.system`）。

---

### 💡 这个 Prompt 好在哪？

1. **场景化**：直接把你日常的 `blockMesh` -> `checkMesh` -> `simpleFoam` 流程写进去，AI 写出来的逻辑就是完全贴合你的。
2. **解决痛点**：明确提到了“自动识别求解器”和“并行计算封装”，这是 OpenFOAM 用户最烦的两个点（每次都要改命令或者手动分解/重组）。
3. **可交付性**：强制要求 `setup.py` 和 `environment.yml`，保证你拿到代码后，直接 `pip install .` 就能用，而不是给你一堆零散的脚本片段。

## Prompt-Manually


### 🚀 定制 OpenFOAM runTest 工具的 Prompt 模版(Manually)

**Role (角色设定):** 你是一名资深的 CFD 工程师兼 DevOps 专家，精通 OpenFOAM 工作流、Python 脚本自动化、Shell 编程以及 Conda 环境管理。你擅长编写鲁棒性强、易于维护的命令行工具（CLI）。

**Goal (目标):** 我需要你为一个 OpenFOAM 自动化测试与运行工具生成**完整的项目结构和代码**。该工具名为 `runTest`，旨在简化我日常的 CFD 仿真流程，支持“一键运行”原本需要手动执行的一系列繁琐命令。

**Constraints & Tech Stack (约束与技术栈):**

1. **核心逻辑**：使用 **Python** (建议使用 `click` 或 `argparse` 库) 处理参数解析和逻辑控制。
2. **执行层**：使用 **Python 的 `subprocess`** 模块或直接调用 **Shell 脚本** 来执行 OpenFOAM 命令（如 `blockMesh`, `simpleFoam` 等）。
3. **环境管理**：必须包含 **Conda** 环境配置文件 (`environment.yml`)，确保 Python 依赖可复现。
4. **安装方式**：提供一个 `setup.py` 或安装脚本，使得安装后我可以在终端任何目录下直接输入 `runTest` 运行。
5. **平台**：Linux (Ubuntu/CentOS)，适配 OpenFOAM 常用环境，稍微考虑一下PySide6后，功能在界面上的兼容性，后续可能会将这套工具界面化。

**My Workflow (我的日常工作流 - 请重点参考):** _(这里是你要根据自己习惯修改的地方)_

> 目前我每次做一个新算例，步骤是：
> 
> 1. 清理旧算例 (`foamCleanTutorials` 或删除不同时间步文件。)。
> 2. 生成网格 (通常是运行已经写好的脚本`runMesh.sh`，`cfMesh`， `blockMesh`，有时候需要 `snappyHexMesh -overwrite`)。
> 3. 检查网格 (`checkMesh`)。
> 4. 运行求解器 (比如 `simpleFoam`，有时需要后台运行并重定向 log)。
> 5. (可选) 运行后处理脚本 (比如 `postProcess -func yPlus`，`./runPostprocess.sh`)。

**Functional Requirements (功能需求):** 请实现以下具体功能：

1. **模式选择**：支持不同的运行模式，例如：
    - `runTest --clean`：仅清理算例。
    - `runTest --mesh`：仅生成网格。
    - `runTest --solve`：仅运行求解器。
    - `runTest --all`：全自动流程 (Clean -> Mesh -> Solve)。
2. **求解器自动识别**：尝试从 `system/controlDict` 中自动读取 `application` 字段，以此决定运行哪个求解器（不用每次都手动输入 `simpleFoam` 或 `pisoFoam`），但是也支持传入参数进行计算，如`runTest --solve simpleFoam`。
3. **多核并行支持**：默认为串行执行。并行时支持参数如 `-np 4`，自动进行 `decomposePar`，运行 `mpirun`，计算完后根据参数判断是否执行 `reconstructPar`。如：
	1. `runTest --solve simpleFoam -np 4 `
	2. `runTest --solve cartesianMesh`
4. **日志管理**：日志管理非常重要。需要兼顾到OpenFOAM日常使用的时候测试不同参数效果的情况，核心的思路就是需要保存一份设置的文件参数，一份log。默认需要输出log文件，如果不需要输出，需要加上参数`--no-log`。所有 OpenFOAM 命令的输出自动保存为 `log.*` 文件，其中的`*`需要识别案例路径下的目录`./LogTest/**`。如果没有文件夹`LogTest`提示并创建。具体的生成逻辑，见我下面的例子，生成代码的时候，将这些加入到单元测试：
	1. 我运行修改`meshDict`相关的测试的时候，运行的命令为`runTest run.sh --dict meshDict `。其中需要在OpenFOAM环境下，执行脚本`run.sh`。会复制`system/meshDict`在路径`./LogTest/meshDict/meshDict.1`下，输出`meshDict.1`。如果我继续运行，会在`./LogTest/meshDict/meshDict.2`下输出`meshDict.2`，这个`meshDict.1`是第一个文件，后续就增加`.2`，`.3` （需要识别相关路径下的文件名，由工具自己判断。其中运行`run.sh`，产生的日志文件按照名字，输出到`log.meshDict.1`，后续就输出到`log.meshDict.2`）
	2. 考虑功能，我可能会根据特定的功能来测试，这样写的`log`文件名应服从设计：`log.字典文件.功能参数.1`，如：`log.meshDict.thicknessRatio.1`。


**Deliverables (交付物):** 请提供以下文件的完整代码，具体的文件名字可以修改，主要是文件结构，按照一个专业标准的开源项目组织好：

1. **`structure.txt`**: 项目目录树结构。
2. **`environment.yml`**: Conda 环境配置。
3. **`setup.py`**: 用于打包和安装 CLI 命令的脚本。
4. **`src/main.py`**: Python 主程序逻辑。
5. **`src/utils.py`**: 封装好的 Shell 命令执行函数、OpenFOAM 字典读取函数。
6. test/test.py：单元测试
7. **`README.md`**: 简短的使用说明，包括如何安装和运行，还有Python版本以及使用到的库的版本，以及适配shell的版本。

**Tone (语气):** 代码需要有详细的注释，不仅解释“怎么做”，还要解释“为什么这么做”（例如为什么用 `subprocess.run` 而不是 `os.system`），但是如果你受到了输出token数的限制，这些可以不写，或只在每个文件的头部加一个解释。

---

### 💡 这个 Prompt 好在哪？

1. **场景化**：直接把你日常的 `blockMesh` -> `checkMesh` -> `simpleFoam` 流程写进去，AI 写出来的逻辑就是完全贴合你的。
2. **解决痛点**：明确提到了“自动识别求解器”和“并行计算封装”，这是 OpenFOAM 用户最烦的两个点（每次都要改命令或者手动分解/重组）。
3. **可交付性**：强制要求 `setup.py` 和 `environment.yml`，保证你拿到代码后，直接 `pip install .` 就能用，而不是给你一堆零散的脚本片段。


## Prompt-Manually_iter01


### 🚀 定制 OpenFOAM runTest 工具的 Prompt (Optimized)

**Role (角色设定):** 你是一名资深的 CFD 工程师兼全栈开发者，精通 OpenFOAM 工作流、Python (Click/Subprocess)、Shell 脚本及设计模式。你擅长编写**架构清晰、解耦良好**的工具，能够为后续移植到 GUI (PySide6) 做好底层准备。

**Goal (目标):** 生成一个名为 `runTest` 的 OpenFOAM 自动化管理工具。它不仅能简化日常流程，还需要具备强大的**实验记录功能**（自动备份配置文件、版本化日志）。

**Constraints & Architecture (架构约束):**

1. **逻辑解耦 (关键)**：代码必须遵循 **Model-View-Controller (MVC)** 或 **Service Layer** 模式。
    - `src/core.py`: 包含所有核心逻辑（如执行命令、备份文件、解析字典）。**禁止在此文件中使用 print**，必须通过日志对象或返回值传递信息。
    - `src/cli.py`: 负责处理 `click` 命令行交互，调用 `core` 中的函数，并打印结果。
    - _原因_：确保未来开发 PySide6 界面时，可以直接调用 `src/core.py` 而无需重写代码。
2. **库的选择**：
    - CLI 框架：必须使用 **`click`** (因为它对嵌套命令支持更好)。
    - OpenFOAM 解析：使用正则表达式或简单的文本处理来读取/修改字典。
3. **环境**：Linux (Ubuntu/CentOS), Python 3.9+, Conda 管理依赖。

**Functional Requirements (详细功能需求):**

**1. 基础工作流 (Workflow Mode)** 支持通过 flag 组合运行标准流程：

- `runTest --clean`：调用 `foamCleanTutorials` 或清理 `0/` 以外的时间步目录。
- `runTest --mesh`：优先寻找并运行 `./runMesh.sh`，如果不存在则回退到 `blockMesh`。
- `runTest --solve [SOLVER_NAME]`：
    - 如果未指定 `SOLVER_NAME`，尝试解析 `system/controlDict` 的 `application` 关键词。
    - 支持后台运行。
- `runTest --all`：依次执行 Clean -> Mesh -> Solve。

**2. 智能并行计算 (Parallel Execution)** 当用户指定 `-np [N]` (例如 `runTest --solve simpleFoam -np 4`) 时：

- 工具需**自动检查并临时修改** `system/decomposeParDict` 中的 `numberOfSubdomains` 为 `N` (使用正则表达式替换)。
- 自动执行：`decomposePar -force` -> `mpirun -np N [solver] -parallel` -> `reconstructPar`。

**3. 实验版本控制与日志系统 (The "Experiment" Feature)** 这是本工具的核心。我经常需要调整某个字典的参数并对比结果。

- **命令范式**：`runTest experiment [SCRIPT_CMD] --watch [DICT_FILE] --tag [TAG_NAME]`
    - _Example_: `runTest experiment ./run.sh --watch system/meshDict --tag thicknessRatio`
- **逻辑流程**：
    1. 检查是否存在 `./LogTest/[DICT_NAME]/` 目录，不存在则创建。
    2. 扫描该目录下现有的版本号 (e.g., `meshDict.1`, `meshDict.2`)，找到下一个序号 `N`。
    3. **运行前备份**：将当前的 `system/meshDict` 复制为 `./LogTest/meshDict/meshDict.N`。
    4. **执行命令**：执行 `[SCRIPT_CMD]` (如 `./run.sh`)。
    5. **日志重定向**：将命令的标准输出(stdout)和错误(stderr) 捕获并保存为 `./LogTest/meshDict/log.[TAG_NAME].[N]` (例如 `log.thicknessRatio.3`)。
    6. **结果反馈**：在终端提示“实验 N 已完成，配置文件已备份至...，日志位于...”。

**Deliverables (交付物):** 请提供专业的开源项目结构：

1. **`structure.txt`**: 目录树。
2. **`environment.yml`**: 包含`click`, `colorama` (用于终端高亮) 等依赖。
3. **`setup.py`**: 支持在conda虚环境中，`pip install -e .` 安装。
4. **`src/core.py`**: 纯净的业务逻辑类 (如 `CaseManager`, `ExperimentRunner`)。
5. **`src/cli.py`**: Click 命令定义。
6. **`src/utils.py`**: `decomposeParDict` 修改器、文件备份工具函数。
7. **`tests/test_experiment.py`**: **重点**。请编写 `pytest` 单元测试，模拟文件系统，测试“日志版本号自动递增”和“配置文件备份”逻辑是否正确。
8. **`README.md`**: 包含架构说明（解释为什么要解耦 cli 和 core）及使用示例。

**Tone (语气):** 代码注释需要解释设计模式的应用（例如：“这里将逻辑分离是为了后续 PySide6 信号槽的接入”）。