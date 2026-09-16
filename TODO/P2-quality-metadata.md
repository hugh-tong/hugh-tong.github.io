# P2：表达、引用和元数据治理

## 1. 清理 AI 对话和未编辑问答

下列文章命中了“告诉我你的设置”“我可以继续”“如果你愿意”等对话式残留。逐篇重写为作者陈述、验证步骤或“排错所需信息”清单，不能只删除最后一句后就视为完成。

- [ ] `abi-overview.md`
- [ ] `cumulative-error-growth.md`
- [ ] `divergence-free.md`
- [ ] `foamdictionary.md`
- [ ] `iteration-openfoam-vs-fluent.md`
- [ ] `nm-ldd-init-tttt-test.md`
- [ ] `of-regex.md`——同时将“泄洪道 1000 万网格”等实际项目描述改成通用示例。
- [ ] `openfoam-bc-overview-2026.md`
- [ ] `pc-monitor-ubuntu.md`
- [ ] `rhie-chow-interpolation.md`
- [ ] `set-p-bc-in-fluentNOF.md`
- [ ] `ubuntu-server-qa.md`
- [ ] `VTK_VTM_VTU.md`——删除对读者项目的臆测。
- [ ] `wsl-experience.md`——当前是多段问答拼接，应按安装、磁盘、Git/SSH、tmux 分节重写或拆分。

复核时搜索但不机械删除：

```bash
rg -n -i '如果你(愿意|需要|想)|告诉我|Ask gpt|我可以(帮|继续)|非常棒的问题' source/_posts -g '*.md'
```

## 2. WSL、SSH 与运维安全

- [ ] `wsl-experience.md`
  - 所有容量默认值、WSL 导入/导出和磁盘扩容命令按当前 Microsoft 文档核实，并注明验证日期。
  - 新建 SSH key 优先示例 Ed25519；明确私钥不可提交或发送，公钥才可注册到平台。
  - 不建议在 shell rc 中每次启动都新建 `ssh-agent`；给出条件启动或系统 keychain 的做法。
  - 示例用户名、邮箱、仓库名保持占位符，禁止粘贴真实公钥或主机配置。
- [ ] `network-linux-notes.md`
  - 明确 `127.0.0.1:7890` 只是本机代理示例。
  - 用 `ss -lntp` 取代以 `netstat` 为唯一方案，补充 `curl -I` 和大小写代理变量的差异。

## 3. 引用与可追溯性

- [ ] 为所有“阅读笔记”补齐作者、标题、年份、出版物/会议、DOI 或稳定链接、引用页码。
- [ ] 将“来自资料”“别人梳理”“官方图”等模糊描述换成可定位来源。
- [ ] 对公式和标准常数给出首要来源；论坛和聚合博客只保留为补充讨论。
- [ ] 对第三方文章只做必要转述；直接引文使用引用块并保持短小。
- [ ] 为所有外链图片记录来源与许可；无授权依据时改成自制图。
- [ ] 建立每月或每季度外链检查，报告 404/重定向但不因临时网络故障阻塞普通 PR。

## 4. OpenFOAM 内容的版本标签

OpenFOAM Foundation 与 OpenCFD/ESI 的命名、目录、工具参数和求解器变化不能混写。对涉及源码或命令的文章统一增加正文“适用范围”块：

```markdown
> 适用范围：OpenFOAM Foundation 13 / OpenCFD v2312（按实际填写）
> 验证环境：Ubuntu ...，编译器 ...
> 最后验证：YYYY-MM-DD
```

- [ ] 优先补充所有 `ebd-*`、边界条件、网格工具、并行工具和求解器对比文章。
- [ ] 命令同时适用于两条发行线时分别验证；未验证的一条不要写“通用”。
- [ ] 源码路径引用固定到版本/tag/commit，避免只链接会变化的默认分支。

## 5. 基线缺少 description 的 14 篇文章（P0 后剩 9 篇）

- [ ] `HelloMyFriends.md`
- [x] `blog-maintenance-resumed.md`
- [ ] `gen-doxgen-cpp.md`
- [x] `hello-world.md`
- [ ] `install-ansys-fluent.md`
- [ ] `install-zsh.md`
- [x] `mac-deploy-test.md`
- [ ] `nm-ldd-init-tttt-test.md`
- [x] `of-intelli-includePath-vscode.md`
- [x] `openfoam-fluent-simple-k-e.md`
- [ ] `set-p-bc-in-fluentNOF.md`
- [ ] `test-math-func.md`
- [ ] `test-my-file.md`
- [ ] `vscode-c-cpp-properties.md`

`description` 应是 60–160 字左右的具体摘要，说明文章解决的问题和适用范围，不能复述标题或写“笔记占位”。准备归档的页面不必先补描述。

## 6. 标签、标题与系列结构

- [ ] 清除重复 `CS` 标签：`abi-overview.md`、`dcu-vs-gpu.md`、`hpc-calc-notes.md`、`ml-vs-dl.md`、`pandoc-md-to-docx.md`、`pc-monitor-ubuntu.md`、`ubuntu-server-qa.md`、`unified-vs-shared-memory.md`、`wsl-experience.md`；同时复核 `ale-conservation-law-derivation.md` 的重复“求解器”。
- [ ] 统一 `OpenFOAM`、`OF`、`CFD/OpenFOAM/...` 的层级用法，避免同义标签拆散归档页。
- [ ] 把测试型/临时型标题改成读者能检索的主题名，例如 `nm_ldd_init_tttt_test`。
- [ ] 给重叠主题建立一个系列导航页，不在每篇重复整套背景：
  - SIMPLE/PISO/PIMPLE 与稳态/瞬态；
  - 边界条件、矩阵组装与压力边界；
  - 网格拆分、重编号、并行分解与重构；
  - GPU/DCU、NUMA 和统一内存；
  - WSL/Linux 开发环境。

## 7. 将内容规则逐步自动化

- [ ] 将缺失 `description` 从 warning 提升为 error，前提是上述 14 篇已处理或归档。
- [ ] 对公开文章中的 `占位待充实`、`正文待充实`、`还没写完`、`[PDF 素材:` 添加错误规则。
- [ ] 对正文为空或可见文本过短添加 warning，不设置一刀切失败阈值。
- [ ] 对单篇重复 tags/categories 添加 warning 或 error。
- [ ] 新增敏感信息扫描：私钥、常见 token、真实绝对用户目录；允许通过明确注释豁免教学示例。
- [ ] 在定时 workflow 中用链接检查器生成报告；不自动删除失效链接。

## P2 验收

- [ ] 全站不再出现明显的聊天机器人收尾和“Ask GPT”标记。
- [ ] 所有公开文章有准确 description，标签无单篇重复。
- [ ] OpenFOAM 技术文章能判断适用发行版和最后验证时间。
- [ ] 阅读笔记和图片能够追溯到合法、稳定的来源。
- [ ] 自动规则覆盖机械问题，技术正确性仍由人工和可复现实验负责。
