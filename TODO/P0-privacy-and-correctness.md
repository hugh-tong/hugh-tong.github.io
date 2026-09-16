# P0：隐私与正确性

所有项目都应在下一次公开发布前完成。这里区分“已确认问题”和“需要验证的风险”，避免把猜测写成结论。

## 1. 环境信息去标识化

- [x] `source/_posts/of-intelli-includePath-vscode.md`
  - 将真实 macOS 用户目录和 Linux 用户目录替换为 `${HOME}`、`${WM_PROJECT_DIR}`、`${FOAM_SRC}` 等可移植变量。
  - 删除整段固定 OpenFOAM 7 `lnInclude` 路径清单，改为由环境变量生成的配置示例。
  - 明确文章只适用于哪个 OpenFOAM 发行版；当前内容混有旧版目录结构。
- [x] `source/_posts/mergeSurfacePatches.md`
  - 删除 shell prompt 中的用户名、主机名、机构缩写和真实项目目录，统一为 `$CASE_DIR`。
- [x] `source/_posts/splitMesh-splitMeshRegions.md`
  - 将命令输出中的用户目录、年月目录和实际案例路径替换为 `$CASE_DIR`。
- [x] `source/_posts/timeVaryingMappedFixedValue.md`
  - 批量去除运行日志中的绝对路径，将案例结构抽象为 `$CASE_DIR/{precursor,successor}`。
  - 只保留能支持结论的日志片段，避免发布完整工作目录结构。
- [x] `source/_posts/ebd-chtmultiregionfoam.md`、`source/_posts/readlog-chtmultiregionfoam-tutorial.md`
  - 将缩写的个人目录和 shell prompt 改为标准命令示例。

复核命令：

```bash
rg -n '(/Users/|/home/|~/work/|[[:alnum:]_-]+@[[:alnum:]_.-]+)' source/_posts -g '*.md'
```

允许保留经过解释的通用示例，例如 `${HOME}`、`user@example.com` 和 `git@github.com`；其余命中逐条人工判断。

## 2. 已确认的技术错误

- [x] `source/_posts/openfoam-fluent-simple-k-e.md`
  - 标准 k-ε 模型的 `C_mu = 0.0` 明显错误，应依据对应 Fluent/OpenFOAM 版本的官方文档或源码核对后修正，通常标准值为 `0.09`。
  - 修复动力黏度公式附近损坏的 LaTeX。
  - 区分运动压力 `p/ρ` 与物理压力，并分别写明不可压缩求解器和 Fluent 的设置前提。
  - 标题移除“还没写完”前，补齐 SIMPLE 设置对照和一个经验证算例；否则先隐藏。
- [x] `source/_posts/foamdictionary.md`
  - 将 description 中的 `foamFoam` 更正为 `foamDictionary`。
- [x] `source/_posts/mergeOrSplitBaffles.md`
  - 将无意义的 `description: buat` 改为准确摘要。

## 3. 已经过时的本站部署内容

- [x] `source/_posts/deploy-blog-new-machine.md`
  - Hexo 6.3.0、Node ≥14、`npm install`、NexT 裸 gitlink和本机 `deploy:butterfly` 已与当前仓库不符。
  - 改写为 Hexo 8.1.2、Node `>=20.19.0 <23`、`npm ci`、两个 npm 主题、`npm run verify`、GitHub Actions artifact 手动发布。
  - 删除“audit 漏洞可以忽略”和“直接推 main”的建议。
- [x] `source/_posts/mac-deploy-test.md`
  - 保留为带日期的历史实录，顶部添加“已过时”提示并链接当前 `DEPLOYMENT.md`；或按当前流程重做一次再更新。
  - 移除裸 gitlink、Hexo 6.3.0 和“眼睛就是 CI”等现已失真的结论。
- [x] `source/_posts/reminder-of-hexo.md`
  - 将 `hexo d` 改为 GitHub Actions 发布入口；补充 `npm ci`、`npm run verify` 和双主题预览命令。
  - Windows 私有路径示例改为仓库相对路径。

当前事实来源以仓库根目录 `DEPLOYMENT.md`、`package.json` 和 `.github/workflows/pages.yml` 为准。

## 4. 发布前必须核实的高风险技术说法

- [x] `source/_posts/lts-local-time-stepping.md`
  - 不再笼统声称 LTS 用于“显式/瞬态计算”或“不同网格区域用不同时间步推进”。
  - 分清物理时间推进、伪时间/稳态加速、`localEuler`/`SLTS`，以及 Foundation 与 OpenCFD 两条发行线。
  - 原文引述来自第三方求解器仓库，必须标注适用版本，不能当成当前 OpenFOAM 通用规则。
- [x] `source/_posts/redistributePar_VS_reconstructPar.md`
  - 核对 `-overwrite`、默认输出位置、跨处理器数重分布和 AMR 相关说法；删去“如果有这个选项的话”一类不确定表述。
- [x] `source/_posts/potentialfoam-init.md`
  - 当前结论由单个外部案例外推而来；改成“该案例观察”，补充势流假设、适用边界和自己的对照结果。
- [x] `source/_posts/swak4foam.md`
  - “OpenFOAM v23+ 编译不过、OpenFOAM-8 能编过”必须写明具体发行版、提交和测试日期；找不到证据就删除断言。
- [x] `source/_posts/iteration-openfoam-vs-fluent.md`
  - 核对 `localEuler` 与 Fluent pseudo-transient 的类比边界，不把不同实现写成等价功能。

## 5. 引用、版权与外链图片

- [x] `source/_posts/openfoam-bc-matrix-impact.md`
  - 当前正文只有两句结论和一张“别人梳理的流程”知乎热链；在补出离散推导前先隐藏。
  - 用自己绘制的矩阵系数/源项示意图替换未知授权图片，或使用许可明确的官方材料并完整署名。
- [x] 对全站外链图片逐个核对授权与稳定性，优先迁移自制图；不能仅把第三方图片下载到仓库就视为解决版权问题。
- 执行记录：已移除气象局、知乎、公众号、Google、CF-MESH+、CFD Online 和官方文档图片的直接热链，并删除明显来自教材/论文/帖子截图的对象存储副本引用。剩余 8 张均来自作者确认自有的腾讯云 COS bucket；无隐私或授权阻塞。长期稳定性可在 P2 中再评估是否迁移为仓库静态资源。
- [x] 保留论坛、知乎、公众号作为经验来源、问题背景或线索；涉及算法、参数、版本行为的核心结论，同时补回固定版本源码、官方文档、论文或可复现实验。
- 执行记录：本轮已为 `bound`、`renumberMesh`、`timeVaryingMappedFixedValue`、`splitMeshRegions` 等文章补充一手来源，原有社区链接保留。

## P0 验收

- [x] 上述真实路径与 shell 身份信息不再出现在生成站点中。
- [x] 三篇部署文章不再引导读者运行旧的分支部署流程。
- [x] k-ε 常数、LTS 和并行重构相关表述经过版本化来源核实。
- [x] 没有未署名的第三方热链图片承担文章的核心解释。
- [x] `npm run verify` 通过；NexT 本地服务抽查 5 个改写页面均为 HTTP 200，4 个隐藏草稿均为 HTTP 404。
