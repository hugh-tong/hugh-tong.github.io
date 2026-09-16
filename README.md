# hugh-tong.github.io 维护手册

个人 Hexo 静态博客，线上地址为 <https://hugh-tong.github.io>。源码、构建校验和 Pages 发布工作流都维护在 `dev_tttt` 分支。

## 仓库结构

```text
dev_tttt（源码，所有修改在这里）
├── source/_posts/          文章
├── source/img/             站点公共图片
├── _config.yml             Hexo 站点配置，默认 Butterfly
├── _config.butterfly.yml   Butterfly 覆盖配置
├── _config.next.yml        NexT 覆盖配置
├── themes/*.mode.yml       双主题命令的最小覆盖
├── scaffolds/              新建内容模板
├── tools/                  源码和生成物检查器
└── .github/workflows/      CI 与 Pages artifact 发布

main    旧的 hexo-deployer-git 静态产物分支，迁移期保留，勿手改
master  2023 年旧部署产物，忽略
```

## 环境准备

推荐使用 `.nvmrc` 固定的 Node.js 22.23.2；最低要求为 Node.js 20.19，当前依赖不支持 Node.js 23 及以上。

```bash
git clone git@github.com:hugh-tong/hugh-tong.github.io.git
cd hugh-tong.github.io
git checkout dev_tttt
nvm use
npm ci
```

Butterfly 和 NexT 都由 npm 安装，不需要再手动 clone 主题，也不需要安装 Pandoc。

## 日常写作与检查

```bash
git checkout dev_tttt
npx hexo new "我的新文章"
npm run check:source
npm run server:butterfly
```

提交前运行完整校验：

```bash
npm run verify
```

`verify` 会检查文章的 front-matter、本机链接和大小写路由冲突，并依次 clean、构建、检查 Butterfly 与 NexT 两套站点。缺少 `description` 目前只警告，不阻断构建。

## 主题命令

| 目的 | 命令 |
|---|---|
| Butterfly 预览 | `npm run server:butterfly` |
| NexT 预览 | `npm run server:next` |
| Butterfly 完整验证 | `npm run verify:butterfly` |
| NexT 完整验证 | `npm run verify:next` |
| 两套主题完整验证 | `npm run verify` |

主题切换脚本使用 `--config _config.yml,themes/xxx.mode.yml` 深合并配置。不要只传单个 mode 文件，否则会替换站点主配置。主题本体在 `node_modules`，定制只写根目录 `_config.butterfly.yml` 或 `_config.next.yml`。

## 发布

目标流程是 GitHub Actions artifact 发布，不再要求在本机生成后 force-push `main`：

1. 将源码提交并推送到 `dev_tttt`，等待 `Validate blog` 通过。
2. 在 GitHub Actions 手动运行 `Deploy GitHub Pages`。
3. 工作流执行锁定依赖安装、源码检查、Butterfly 构建、生成物检查，再把 `public/` artifact 发布到 Pages。

首次启用时，需要仓库管理员完成两项一次性设置：

- Settings → General → Default branch 改为 `dev_tttt`。
- Settings → Pages → Build and deployment → Source 改为 `GitHub Actions`。

在上述设置完成并验证新流程前，`npm run deploy:butterfly` / `npm run deploy:next` 仍作为旧的 `main` 分支发布后备。不要同时运行两种发布方式。

## 常见问题

- clone 后看到旧博客：当前在 `master`，先执行 `git checkout dev_tttt`。
- 改配置后页面异常：先 `npm run clean`，再运行对应的 `verify:*`。
- CI/手动发布工作流在 Actions 中不可见：工作流文件必须位于默认分支，先把默认分支改为 `dev_tttt`。
- 分类或标签页 404：确认 `source/categories/index.md` 和 `source/tags/index.md` 仍存在。
- 新文章构建失败：先运行 `npm run check:source`，重点检查 `title`、`date`、本地链接和标签大小写。

更详细的环境与发布记录见 [DEPLOYMENT.md](./DEPLOYMENT.md)，协作规则见 [AGENTS.md](./AGENTS.md)。
