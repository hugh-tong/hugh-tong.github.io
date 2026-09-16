# P1：占位页处置清单

基线审计发现 21 篇显式占位文章。P0 已将 LTS 和 potentialFoam 两篇改成有版本边界的说明页；P1 第一批又完成 `bound`、`renumberMesh` 两篇，并将两个重复入口改成导航页。其余尚未达到发布标准的占位文章已先设置 `published: false`，避免线上继续展示半成品。

在正文完成前，建议先加 `published: false`，或移动到 `source/_drafts/`。不要把“正文待后续用 AI 工具充实”改成一篇没有验证证据的长文。

## A. 优先补全：与本站主线一致

| 文件 | 建议 | 完成所需证据 |
|---|---|---|
| `bound-function.md` | 已补全 Foundation 13 源码逻辑、使用边界及与 MULES 的区别 | 后续可增加一个可运行的小场回归测试，但不再作为公开占位页 |
| `matrix-solver-choice.md` | 补全为矩阵性质到 solver/preconditioner 的选择表 | 官方用户指南/源码，SPD 与非对称矩阵示例，至少一个 GAMG/PCG/PBiCGStab 对比 |
| `fractional-step-method.md` | 补全并纳入 SIMPLE/PISO/PIMPLE 系列 | Chorin/Temam 或可靠教材推导、压力泊松方程、与 OpenFOAM 实现边界 |
| `lts-local-time-stepping.md` | P0 已完成概念和版本纠错；P1 补充实测 | 固定 solver 的 `ddtSchemes` 配置、全局/LTS 收敛曲线与物理时间含义说明 |
| `ebd-simplefoam.md` | 与 `simple-piso-pimple-algorithms.md` 组成“原理 + 源码路径” | 固定版本源码调用链、UEqn/pEqn、松弛顺序和最小案例日志 |
| `potentialfoam-init.md` | P0 已撤回单例外推；P1 补充对照实验 | 同一案例有/无初始化的迭代数、墙钟时间和最终解对比 |
| `renumbermesh-init.md` | 已补全矩阵带宽直觉、Foundation 13 默认算法、命令行为和基准测试方法 | 后续可追加实测表格；当前正文不预设性能收益 |
| `ebd-sprayfoam.md` | 原始案例和 PDF 可取得时补全 | `aachenBomb` 可运行配置、parcel/cloud 模型含义、ParaView 验证截图 |
| `readlog-oscfd-les.md` | 取得原始 PDF 后完成阅读笔记 | 完整书目信息、页码、对应源码版本、自己的调用关系图 |

## B. 合并：避免重复维护

| 文件 | 合并目标 | 处置方式 |
|---|---|---|
| `redistributepar-tool.md` | `redistributePar_VS_reconstructPar.md` | 已改为简短导航页，并补充官方文档/源码链接；后续实验仍归入专题文 |
| `solution-limits.md` | `bound-function.md` 或新的“物理量限幅”专题 | 将 Fluent Solution Limits 与 OpenFOAM `bound`/MULES 分栏对比，不把两者写成完全等价 |
| `network-linux-notes.md` | `wsl-experience.md` 或新的“Linux 代理排错”短文 | 只保留可验证的代理变量、`ss`/`curl` 排错流程；删除零散口语笔记 |
| `csapp-gpu-notes.md` | `dcu-vs-gpu.md` / `hpc-calc-notes.md` | 现标题与素材不匹配；将 PCIe/NUMA 内容放入硬件拓扑专题，避免冒充 CSAPP 章节笔记 |
| `npm-notes.md` | 本站维护文或项目工具链专题 | 删除通用百科式文本，聚焦 `npm ci`、lockfile、scripts、audit 和本仓库实际示例 |
| `cpp-design-patterns-intro.md` | OpenFOAM runtime selection / factory 专题 | 只有能结合代码和测试时才保留独立文章，否则将两个外链移入资料清单后归档 |

## C. 先验证上游状态，再决定是否补全

| 文件 | 核实事项 | 决策标准 |
|---|---|---|
| `ebd-multiregionreactingfoam.md` | 仓库活跃度、许可证、支持的 OpenFOAM 分支、案例能否构建 | 能复现再写教程；否则明确标为历史项目索引 |
| `ext-interplicfoam.md` | 代码获取方式、PLIC 实现版本、与当前 isoAdvector/MULES 的可比性 | 有同一算例和界面误差指标才写“精度收益” |
| `ext-olaflow.md` | 当前维护状态、支持版本、安装和验证案例 | 有上游文档和可运行造波验证才补全 |
| `pyfoam.md` | 当前安装方式、Python/OpenFOAM 兼容性、项目维护状态 | 禁止继续推荐 `python setup.py install`；有隔离环境实测后更新 |
| `swak4foam.md` | 当前 fork、版本矩阵、许可证和编译结果 | 能给出 commit + 环境 + 构建日志才保留兼容性结论 |

## D. 改成导航页或归档

| 文件 | 建议 |
|---|---|
| `useful-tools-cfddirect.md` | 已改为明确的外部资料导航页，并声明版本行为以对应发行版手册为准。 |

## E. 其他未完成或伪装成成稿的页面

- [ ] `openfoam-fluent-simple-k-e.md`：先修正 P0 错误；补完跨软件对照和算例后再公开。
- [ ] `openfoam-bc-matrix-impact.md`：当前 154 个正文字符，按 P0 要求隐藏或完成推导。
- [x] `test-my-file.md`：正文为空，已设置 `published: false`，保留历史文件避免 URL 误用。
- [ ] `install-ansys-fluent.md`：正文约 195 字且主要是外链；补充许可合规、官方安装流程和实测环境，否则归档。
- [ ] `vscode-c-cpp-properties.md`：与 `of-intelli-includePath-vscode.md` 合并，避免两份过时配置。
- [ ] `test-math-func.md`、`hello-world.md`、`HelloMyFriends.md`：区分“站点历史纪念”与“测试页面”；纪念页可保留，纯渲染测试改为草稿或内部 fixture。
- [ ] `ale-conservation-law-derivation.md`：完成离散、雷诺输运定理和网格体积三个内联 TODO。
- [ ] `gcl-scl-derivation.md`：完成网格体积计算 TODO，并与 ALE 文章去重互链。
- [ ] `mesh-induced-numerical-problems.md`：完成 semi-discretised 方程梳理后再保留当前结论。
- [ ] `nm-ldd-init-tttt-test.md`：改掉测试型标题，完成符号表/typeid TODO，移除 Ask GPT 标记。
- [ ] `readlog-2017-fu-boiling.md`、`readlog-chtmultiregionfoam-tutorial.md`、`readlog-oscfd-les.md`、`openfoam-wedge-bc-survey.md`：将 `[PDF 素材:...]` 替换为带作者、题名、年份、链接和页码的正式引用；缺原始材料时隐藏相关段落。

## P1 验收

执行记录（2026-09-16）：除已经完成或改成导航页的内容外，其余仍含占位标记的文章均已设置 `published: false`。该操作只控制生成结果，不代表对应正文已经完成。

- [ ] 公开页面中不再出现 `占位待充实`、`正文待充实`、`还没写完`、`PDF 素材`。
- [ ] 每个合并决定都记录旧 URL 的处理方式，不制造无说明的 404。
- [ ] 外部扩展项目的文章都带“上游 commit/版本、测试环境、验证日期”。
- [ ] 每个教程至少有一次可重复的命令或算例验证；无法验证的页面明确称为资料索引。
