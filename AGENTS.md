# AGENTS.md

Hexo 静态博客（GitHub Pages：hugh-tong.github.io）。这是三分支仓库，职责不同；开始工作前必须确认分支。

## 分支模型

| 分支 | 内容 | 操作 |
|---|---|---|
| `dev_tttt` | Hexo 源码、配置、主题覆盖、工具与 Actions 工作流 | **所有修改只在这里** |
| `main` | 旧 `hexo-deployer-git` 生成产物，Pages artifact 迁移期保留 | 不要手改 |
| `master` | 2023 年旧部署产物；远端默认分支迁移前可能仍指向它 | 忽略 |

如果检出的是 `master`，看到的是旧静态结果。任何操作前先执行 `git checkout dev_tttt`。

## 环境与标准验证

```bash
nvm use                  # .nvmrc = Node 22.23.2
npm ci                   # 严格使用 package-lock.json
npm run check:source     # 只检查文章元数据、链接和路径冲突
npm run verify           # Butterfly + NexT 全量 clean/build/生成物检查
```

Hexo 锁定 8.1.2，Node 支持范围为 `>=20.19.0 <23`。不需要 Pandoc。不要提交 `node_modules/`、`public/`、`db.json` 或 `_multiconfig.yml`。

## 写作流程

```bash
npx hexo new "post title"
# 编辑 source/_posts/*.md
npm run check:source
npm run server:butterfly
npm run verify
```

文章必须具有字符串 `title` 和固定 `date`。新模板还包含 `categories` 与 `description`；旧文章缺少 `description` 只警告。禁止发布 `file://` 本机链接，标签/分类不得仅大小写不同。

## 双主题

默认主题是 Butterfly 5.7.0；NexT 8.29.0 作为备用。两者均由 npm 管理：

- Butterfly 覆盖配置：`_config.butterfly.yml`
- NexT 覆盖配置：`_config.next.yml`
- 发布主题选择：`themes/butterfly.mode.yml`、`themes/next.mode.yml`

不要修改 `node_modules`，也不要恢复原来没有 `.gitmodules` 的 `themes/next` 裸 gitlink。主题命令使用 `_config.yml,themes/*.mode.yml` 的逗号列表进行深合并；不能只传 mode 文件。

## CI 与发布

- `.github/workflows/ci.yml`：push/PR 到 `dev_tttt` 时执行依赖审计和双主题验证。
- `.github/workflows/pages.yml`：手动构建 Butterfly，上传 artifact 并部署 Pages。
- 新发布流程启用前，仓库管理员必须把默认分支改成 `dev_tttt`，并把 Pages Source 改成 `GitHub Actions`。
- 新流程验证完成前，`npm run deploy:*` 保留为向 `main` 发布的临时后备；不要同时使用新旧发布方式。
- 不得由 agent 自行触发部署、push、修改 GitHub Settings 或 force-push，除非用户明确授权。

## 仓库维护规则

- `source/.obsidian/` 是作者的写作配置，勿删勿改。
- `HANDOFF_CONTEXT_*.md` 可能含机器路径或连接信息，只保留本地，已统一忽略。
- `tools/` 存放独立校验器；根目录 `scripts/` 是 Hexo 的保留插件目录，只能放 Hexo 插件，不要放普通 Node 脚本。
- 修改配置或主题后先 clean，再生成；`verify:*` 已包含 clean。
- 工作区可能含用户自己的改动。只暂存本次明确修改的路径，禁止 `git add .`。
- 不要手工修改生成分支或生成目录来修问题，应在源码、配置或构建工具中修复。

日常手册见 `README.md`，完整迁移和回退步骤见 `DEPLOYMENT.md`。
