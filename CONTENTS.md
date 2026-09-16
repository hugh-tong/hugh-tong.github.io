# CONTENTS.md — 博客内容管理总控台

> **这是我们俩的工作协议文档。** 你想发布/搬运/修改什么,直接编辑本文档对应的区块(或直接在对话里说"按 CONTENTS.md 执行"),我按这里的状态和队列干活,干完回写状态。
> 最后同步:2026-09-15 · 由 Sisyphus 维护 · 博客:hugh-tong.github.io

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
| 15 | 2026-09-15 | 博客新机部署实录——从空仓库到上线 | 工具/Hexo | deploy-blog-new-machine | ✅ 新机部署流程实测 |
| 16 | 2026-09-15 | OpenFOAM 网格专题 17 篇(Mesh 目录) | CFD/OpenFOAM/网格 | BadMesh_store 等 | ✅ P1 搬运,列表见下 |
| 17 | 2026-09-15 | OpenFOAM 边界条件专题 10 篇(BC 目录) | CFD/OpenFOAM/边界条件 | ABLCondition 等 | ✅ P1 搬运,列表见下 |
| 18 | 2026-09-15 | OpenFOAM 求解器专题 7 篇(solver 目录) | CFD/OpenFOAM/求解器 | simplefoam-vs-pisofoam 等 | ✅ P2 搬运 |
| 19 | 2026-09-15 | 雷诺数(Reynolds Number)——系列回填 | CFD/无量纲数 | dimless-reynolds | ✅ P2 新写,系列 16 数补齐 |
| 20 | 2026-09-15 | 求解器书签占位 8 篇(纯链接笔记) | CFD/OpenFOAM/求解器 | potentialfoam-init 等 | 🚧 占位发布,tag「占位待充实」,计划接 AI 工具充实正文 |
| 21 | 2026-09-15 | P3 搬运:工具链 8 篇(4 实质 + 4 占位) | CFD/OpenFOAM/工具链 | foamdictionary 等 | ✅ |
| 22 | 2026-09-15 | P3 搬运:理论专题 7 篇(5 实质 + 2 占位) | CFD/理论 | simple-piso-pimple-algorithms 等 | ✅ 求解算法/湍流/边界条件 |
| 23 | 2026-09-15 | P3 搬运:数值方法 11 篇(7 实质 + 4 占位) | CFD/数值方法 | rhie-chow-interpolation 等 | ✅ Schemes.md 已于 09-13 搬过,跳过 |
| 24 | 2026-09-15 | P4 搬运:CS/CSAPP 14 篇(9 实质 + 5 占位) | 工具(Python/Linux/计算机系统/C++) | gdb-notes-openfoam-laplacian 等 | ✅ 隐私 3 篇不搬(JusmarBase 调试日志/SCP 工作流/SurfTheInternet) |
| 25 | 2026-09-15 | P5 搬运:ReadLog 4 篇(2 实质 + 2 占位)+ Zotero | CFD/论文阅读 + 工具/Zotero | readlog-2017-fu-boiling 等 | ✅ 方案 A:论文阅读挂 CFD 下 |

> 状态图例:✅ 已发布 · 🚧 草稿中 · ⏸ 暂缓 · ⚠️ 有遗留问题

## 三、待搬运队列(源笔记库 → 博客)

按你之前的意向和内容质量排的优先级,顺序可调:

| 优先 | 源路径(相对 ttttProject/) | 预估分类 | 备注 | 状态 |
|---|---|---|---|---|
| P1 | CFD/OpenFOAM/Mesh/(17 篇) | CFD/OpenFOAM/网格 | BadMesh 配图经验,实用价值最高 | ✅ 2026-09-15 全部搬运(17/17) |
| P1 | CFD/OpenFOAM/BoundaryCondition/(12 篇) | CFD/边界条件 | 含 wedge_bc PDF 素材 | ✅ 2026-09-15 搬运 10/12(unifoamFixedValue 空文、From_1DTo3D 纯链接,弃) |
| P2 | CFD/OpenFOAM/solver/(17 篇) | CFD/OpenFOAM/求解器 | | ✅ 2026-09-15 搬运 7 篇实质文 + 8 篇书签占位发布(纯链接壳文保留占位,后续接 AI 充实);空文与自研求解器源码目录不搬 |
| P2 | CFD/DimlessNumberFluids 缺口:雷诺数 Re | CFD/无量纲数 | 笔记库无独立 Re 笔记,可新写回填系列 | ✅ 2026-09-15 新写上线,系列补齐 |
| P3 | CFD/OpenFOAM/Tools/(8 篇) | CFD/OpenFOAM/工具链 | | ✅ 2026-09-15 搬运 4 实质 + 4 占位 |
| P3 | CFD/Theory/(12 篇)、CFD/Numerical/(12 篇) | CFD/理论、CFD/数值方法 | Schemes.md 已搬,余下待筛 | ✅ 2026-09-15 搬运 12 实质 + 6 占位(空大纲 Advection_vs_Convection/LES_Theory 弃) |
| P4 | CS/、CSAPP/ | 工具/计算机系统 | 需要你指认哪些值得搬 | ✅ 2026-09-15 搬 14 篇(9 实质+5 占位);隐私 3 篇(JusmarBase/SCP/SurfTheInternet)作者确认不搬;mv.md 空文弃 |
| P5 | ReadLog/(读书笔记 5 篇) | 读书 | 需新建"读书"一级分类 | ✅ 2026-09-15 方案 A:CFD 论文挂 [CFD, 论文阅读],Zotero 归工具;QBMM 空文弃;"读书"分类暂不建 |

**永不搬运**(已约定):周记/、根目录任务管理散文(AGENTS.md、TaskPriorityAnalysis.md 等)、含隐私内容。

## 四、交互规则(我们怎么用这个文档)

1. **下单**:你可以在对话里说"搬运队列 P1 第一行",或者直接编辑第三节的表格(改状态/调顺序/加新行),然后说"按 CONTENTS.md 执行"
2. **回报**:我每次完成搬运后,更新第二节台账 + 第三节状态(⏸→✅),并在"最近动态"记一笔
3. **文章修改**:想改已发布的文章,直接告诉我 slug + 改什么;批量修改(如改分类)我按第一节规则执行
4. **清理决策权在你**:第一节标 ⚠️ 的文章(测试文、未完稿)是否删除/隐藏,你说了我才动
5. **冲突时**:本文档 > 我的记忆。文档没写的,我会先问

## 五、最近动态(倒序,新在上)

- **2026-09-15(晚二)**:P4+P5 完成——CS/CSAPP 14 篇 + ReadLog 4 篇 + Zotero,共 20 篇上线(11 实质 + 9 占位);**全部 5 个优先级队列搬运完毕**。新增分类 [CFD, 论文阅读]、工具/Python、工具/计算机系统、工具/C++、工具/Zotero。隐私红线确立:公司项目调试日志、个人工作流(含私服地址)、科学上网相关一律不搬
- **2026-09-15(晚)**:P3 队列完成——工具链 8 + 理论 7 + 数值方法 11,共 26 篇上线(18 实质 + 8 占位);Mac 同步盘目录间歇性消失,改为远端 tar 打包一次拉取;新增分类 CFD/OpenFOAM/工具链、CFD/理论(求解算法/湍流)
- **2026-09-15(下午二)**:按作者决策,8 篇纯链接书签笔记以**占位文**形式发布(tag「占位待充实」),保留全部原始链接与 TODO 清单,计划后续接入 AI 工具充实正文;自研求解器源码目录确认不搬
- **2026-09-15(下午)**:P2 队列完成——solver 专题搬运 7 篇(8 篇纯链接书签壳文弃:potentialFoam/renumberMesh/LTS/ebd 简条等,待作者日后写成正文再搬)+ 雷诺数 Re 新写回填,无量纲数系列 16 数齐全
- **2026-09-15**:P1 队列搬运完成——SSH 直连 Mac 笔记库,Mesh 17 篇 + 边界条件 10 篇(共 27 篇)转 Hexo 上线;10 张配图迁至 source/images/;2 篇空壳文弃搬。多机协作新增规则:**每次 hexo d 前先 git pull --rebase origin dev_tttt**(Mac 端发文曾被本机 deploy 覆盖)
- **2026-09-15(早)**:新机(Ubuntu 工作站)环境部署实录上线;DEPLOYMENT.md 部署手册建立

- **2026-09-13**:全站 31 篇文章分类补齐(12 篇老文补 categories);无量纲数系列 16 篇上线;离散格式指南上线;CONTENTS.md 建立分类体系与搬运队列
- **2026-09-13(早)**:博客维护恢复(主题 Butterfly、双主题切换、部署链路)
