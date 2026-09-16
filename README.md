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

main    历史静态产物分支，已停止更新，仅用于短期回溯，勿手改
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

发布只使用 GitHub Actions artifact，不在本机生成后推送静态分支：

1. 将源码提交并推送到 `dev_tttt`，等待 `Validate blog` 通过。
2. 在 GitHub Actions 手动运行 `Deploy GitHub Pages`。
3. 工作流执行锁定依赖安装、源码检查、Butterfly 构建、生成物检查，再把 `public/` artifact 发布到 Pages。

仓库已经完成两项一次性设置，并于 2026-09-16 验证部署成功：

- Default branch：`dev_tttt`。
- Pages Source：`GitHub Actions`。

仓库不再提供 `npm run deploy` 或 `hexo deploy`。需要回滚时，对源码提交执行 `git revert`，让 CI 通过后重新运行 Pages 工作流；不要恢复向 `main` force-push 的旧流程。

## 常见问题

- clone 后看到旧博客：检查远端和本地默认分支是否为 `dev_tttt`。
- 改配置后页面异常：先 `npm run clean`，再运行对应的 `verify:*`。
- CI/手动发布工作流在 Actions 中不可见：工作流文件必须位于默认分支，先把默认分支改为 `dev_tttt`。
- 分类或标签页 404：确认 `source/categories/index.md` 和 `source/tags/index.md` 仍存在。
- 新文章构建失败：先运行 `npm run check:source`，重点检查 `title`、`date`、本地链接和标签大小写。

更详细的环境与发布记录见 [DEPLOYMENT.md](./DEPLOYMENT.md)，协作规则见 [AGENTS.md](./AGENTS.md)。
