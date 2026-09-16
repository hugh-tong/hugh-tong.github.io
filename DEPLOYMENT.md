# 部署与环境手册

本手册记录可复现的建站、验证和发布过程。日常命令速查见 `README.md`，agent 操作边界见 `AGENTS.md`。

## 已验证环境（2026-09-15）

| 项目 | 版本或约束 |
|---|---|
| Node.js | 22.23.2（支持范围 `>=20.19.0 <23`） |
| npm | 10.9.8 |
| Hexo | 8.1.2 |
| Butterfly | 5.7.0 |
| NexT | 8.29.0 |
| Markdown 渲染 | `hexo-renderer-marked`，无需 Pandoc |
| 锁文件 | `package-lock.json` |

## 从零恢复工作区

```bash
git clone git@github.com:hugh-tong/hugh-tong.github.io.git
cd hugh-tong.github.io
git checkout dev_tttt
nvm install
nvm use
npm ci
npm run verify
```

`npm ci` 会严格按锁文件恢复依赖。两个主题都来自 npm，仓库不再包含 `themes/next` 裸 gitlink，不需要 `git clone` 主题。

## 本地预览

```bash
npm run server:butterfly
# 或
npm run server:next
```

默认地址为 <http://localhost:4000>。发布前除自动检查外，还应人工抽查：首页、文章页、分类页、标签页、搜索、代码块、公式与移动端布局。

## 自动验证边界

`npm run verify` 包括：

- 文章必须具有字符串 `title` 和可解析的 `date`。
- `description` 若存在必须为字符串；缺失只产生 warning。
- 拒绝 `file://` 本机链接和不存在的 Markdown 本地文件引用。
- 拒绝仅大小写不同的文章路径、标签和分类。
- Butterfly 与 NexT 分别 clean build，生成错误立即失败。
- 检查 `404.html`、`robots.txt`、`sitemap.xml`、`atom.xml`、搜索与索引页。
- 遍历生成 HTML 的站内 `href`/`src`，检查目标存在和大小写路径冲突。

CI 在 push 或 pull request 指向 `dev_tttt` 时执行相同验证，并额外运行高危依赖审计。

## GitHub Pages artifact 发布

仓库中的 `.github/workflows/pages.yml` 保持手动发布语义：只有在 Actions 页面触发 `workflow_dispatch` 时才发布。它不提交生成 HTML，也不修改 `main`。

### 一次性仓库设置

1. 推送本次源码改造到 `dev_tttt`。
2. Settings → General → Default branch：选择 `dev_tttt`。
3. Settings → Pages → Build and deployment → Source：选择 `GitHub Actions`。
4. Actions → Deploy GitHub Pages → Run workflow，选择 `dev_tttt`。
5. 验证线上首页、文章、搜索、404、`/sitemap.xml` 和 `/atom.xml`。

为什么需要先改默认分支：GitHub 只从默认分支展示和接收手动工作流；Dependabot 也从默认分支读取配置。

### 迁移期回退

Pages 设置切换完成前，可继续使用旧路径：

```bash
npm run deploy:butterfly
```

该命令先完整验证，再由 `hexo-deployer-git` 把 `public/` 推送到 `main`。这是临时回退手段；新 Pages 工作流验证稳定后，再单独删除 `hexo-deployer-git`、`deploy` 配置和旧部署脚本，并决定是否归档 `main` / `master`。不要在同一次发布中同时运行新旧流程。

## 发布后检查

```bash
curl -I https://hugh-tong.github.io/
curl -I https://hugh-tong.github.io/404.html
curl -I https://hugh-tong.github.io/sitemap.xml
curl -I https://hugh-tong.github.io/atom.xml
```

GitHub Pages 生效存在短暂延迟。HTTP 200 只能说明资源可访问，仍需浏览器人工确认交互和视觉效果。

## 依赖维护

Dependabot 每周一 09:00（Asia/Shanghai）检查 npm minor/patch 更新，并按组创建 PR。合并依赖更新前必须让 CI 通过，并人工预览当前发布主题。

```bash
npm outdated
npm audit
npm run verify
```

大版本升级单独处理，不与文章更新混在同一提交中。
