# CONTENTS.md — 博客内容管理总控台

> **这是我们俩的工作协议文档。** 你想发布/搬运/修改什么,直接编辑本文档对应的区块(或直接在对话里说"按 CONTENTS.md 执行"),我按这里的状态和队列干活,干完回写状态。
> 最后同步:2026-09-13 · 由 Sisyphus 维护 · 博客:hugh-tong.github.io

## 一、分类体系(定稿)

```
CFD/                        ← CFD 技术主体
├── 无量纲数/               ← 系列专题(16 篇已成体系)
├── OpenFOAM/               ← 含工具链、求解器、网格、边界条件
├── Fluent/                 ← 含安装、设置
├── 边界条件/               ← 跨 OpenFOAM/Fluent 的专题
工具/                       ← 泛开发工具
├── VSCode/  ├── Linux/  ├── Hexo/
本站/                       ← 建站测试文、公告、自我介绍
```

规则:
- 分类最多 3 层,`[CFD, OpenFOAM, 网格]` 这种第 3 层只用于系列性内容
- 一篇文章只挂一条分类链(tags 承担交叉检索,如同时涉及 OpenFOAM 和 Fluent 的对比文挂 `[CFD, OpenFOAM, Fluent]` 用 tags 补充)
- 新分类需在这里登记后才使用(防止分类树失控)

## 二、已发布文章台账

| # | 日期 | 标题 | 分类 | slug | 状态 |
|---|---|---|---|---|---|
| 1 | 2023-08 | Hello World / test_my_file / HelloMyFriends / 测试数学公式 | 本站 | hello-world 等 4 篇 | ✅ 建站测试,可择日清理 |
| 2 | 2023-08 | ansys fluent 安装 | CFD/Fluent/安装 | install-ansys-fluent | ✅ |
| 3 | 2023-08 | OpenFOAM和fluent的SIMPLE计算设置对比 | CFD/OpenFOAM/Fluent | openfoam-fluent-simple-k-e | ⚠️ 标注"还没写完" |
| 4 | 2023-08 | 学习在fluent和OpenFOAM中设置压力边界条件 | CFD/边界条件 | set-p-bc-in-fluentNOF | ✅ |
| 5 | 2023-08 | c_cpp_properties的设置 | 工具/VSCode/C-C++ | vscode-c-cpp-properties | ✅ |
| 6 | 2023-08 | 安装zsh以及oh my zsh | 工具/Linux/WSL | install-zsh | ✅ |
| 7 | 2023-09 | 用doxygen生成类似OpenFOAM的继承关系图 | CFD/OpenFOAM/工具链 | gen-doxgen-cpp | ✅ |
| 8 | 2023-09 | 更新版:OpenFOAM在vscode的代码跳转设置 | 工具/VSCode/OpenFOAM | of-intelli-includePath-vscode | ✅ |
| 9 | 2023-10 | nm_ldd_init_tttt_test | 工具/Linux/二进制 | nm-ldd-init-tttt-test | ✅ |
| 10 | 2024-05 | Hexo 备忘录 | 工具/Hexo | reminder-of-hexo | ✅ |
| 11 | 2026-09-13 | 博客维护恢复记录 | 工具/Hexo | blog-maintenance-resumed | ✅ |
| 12 | 2026-09-13 | OpenFOAM 离散格式选型指南 | CFD/OpenFOAM | openfoam-schemes-review | ✅ 首篇 Obsidian 搬运 |
| 13 | 2026-09-13 | CFD 无量纲数手册——系列导航 | CFD/无量纲数 | dimless-index | ✅ |
| 14 | 2026-09-13 | 无量纲数 15 篇(Gr/Ra/Pr/Nu/St/Ri/Pe/Sc/We/Bn/Ar/Fr/Sr/Cp/Cd) | CFD/无量纲数 | dimless-* | ✅ 已全部上线 |

> 状态图例:✅ 已发布 · 🚧 草稿中 · ⏸ 暂缓 · ⚠️ 有遗留问题

## 三、待搬运队列(源笔记库 → 博客)

按你之前的意向和内容质量排的优先级,顺序可调:

| 优先 | 源路径(相对 ttttProject/) | 预估分类 | 备注 | 状态 |
|---|---|---|---|---|
| P1 | CFD/OpenFOAM/Mesh/(17 篇) | CFD/OpenFOAM/网格 | BadMesh 配图经验,实用价值最高 | ⏸ 待确认 |
| P1 | CFD/OpenFOAM/BoundaryCondition/(12 篇) | CFD/边界条件 | 含 wedge_bc PDF 素材 | ⏸ 待确认 |
| P2 | CFD/OpenFOAM/solver/(17 篇) | CFD/OpenFOAM/求解器 | | ⏸ |
| P2 | CFD/DimlessNumberFluids 缺口:雷诺数 Re | CFD/无量纲数 | 笔记库无独立 Re 笔记,可新写回填系列 | ⏸ |
| P3 | CFD/OpenFOAM/Tools/(8 篇) | CFD/OpenFOAM/工具链 | | ⏸ |
| P3 | CFD/Theory/(12 篇)、CFD/Numerical/(12 篇) | CFD/理论、CFD/数值方法 | Schemes.md 已搬,余下待筛 | ⏸ |
| P4 | CS/、CSAPP/ | 工具/计算机系统 | 需要你指认哪些值得搬 | ⏸ |
| P5 | ReadLog/(读书笔记 5 篇) | 读书 | 需新建"读书"一级分类 | ⏸ |

**永不搬运**(已约定):周记/、根目录任务管理散文(AGENTS.md、TaskPriorityAnalysis.md 等)、含隐私内容。

## 四、交互规则(我们怎么用这个文档)

1. **下单**:你可以在对话里说"搬运队列 P1 第一行",或者直接编辑第三节的表格(改状态/调顺序/加新行),然后说"按 CONTENTS.md 执行"
2. **回报**:我每次完成搬运后,更新第二节台账 + 第三节状态(⏸→✅),并在"最近动态"记一笔
3. **文章修改**:想改已发布的文章,直接告诉我 slug + 改什么;批量修改(如改分类)我按第一节规则执行
4. **清理决策权在你**:第一节标 ⚠️ 的文章(测试文、未完稿)是否删除/隐藏,你说了我才动
5. **冲突时**:本文档 > 我的记忆。文档没写的,我会先问

## 五、最近动态(倒序,新在上)

- **2026-09-13**:全站 31 篇文章分类补齐(12 篇老文补 categories);无量纲数系列 16 篇上线;离散格式指南上线;CONTENTS.md 建立分类体系与搬运队列
- **2026-09-13(早)**:博客维护恢复(主题 Butterfly、双主题切换、部署链路)
