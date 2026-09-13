# AGENTS.md

Hexo 静态博客(GitHub Pages: hugh-tong.github.io)。**三分支仓库,职责完全不同,改错分支 = 白干**。

## 分支模型(先读这个)

| 分支 | 内容 | 操作 |
|---|---|---|
| `dev_tttt` | Hexo 源码:`source/_posts/*.md` 全部文章、`_config.yml`、`package.json`、`scaffolds/`、`themes/` | **一切修改只在这里** |
| `main` | `hexo deploy` 生成的静态 HTML(最新 2024-05-26),由 hexo-deployer-git 自动推送 | 不要手改 |
| `master` | 旧部署输出,2023-08-19 后停滞(旧 landscape 主题时代产物);`origin/HEAD` 仍指向它,有误导性 | 忽略 |

本目录若检出的是 `master`,看到的只是 2023 年的旧生成结果。开始任何工作前先 `git checkout dev_tttt`。

## 标准工作流(在 dev_tttt 分支)

```bash
npm install                # 首次;Hexo 6.3.0 锁定于 package.json
npx hexo new "post title"  # 在 source/_posts/ 生成 markdown,用编辑器写
npx hexo clean             # 清缓存,改配置或换主题后必须先跑
npx hexo g                 # 生成;等价 npm run build
npx hexo s                 # 本地预览 http://localhost:4000;等价 npm run server
npx hexo d                 # 部署:force-push 生成结果到 main;等价 npm run deploy
```

顺序:`clean → g → s 验证 → d`。部署后 GitHub Pages 生效有延迟。

## 坑(踩过才知道)

- **`themes/next` 是无 `.gitmodules` 的裸 gitlink**(现指向 `v8.20.0` tag,commit `ba7ec07`;原始 commit `9c8cea6` 已被上游 force-push 消失,无法 fetch)。克隆/切换到 dev_tttt 后该目录是**空的**,`hexo g` 直接失败。需先手动补主题:`git clone https://github.com/next-theme/hexo-theme-next.git themes/next && git -C themes/next checkout v8.20.0`。根治方案是改造成正规 submodule 或用 npm 安装主题。
- **依赖 `hexo-renderer-pandoc`** → 系统必须装有 `pandoc` 可执行文件,否则 markdown 渲染失败。WSL/Linux 上先 `apt install pandoc` 或从官网装。
- 双锁文件并存(`package-lock.json` + `yarn.lock`),从未统一。建议统一 npm(scripts 已按 npm 定义)。
- ~~`_config.yml` 的 `url` 仍是默认 `http://example.com`~~ 已于 2026-09-13 修复为 `https://hugh-tong.github.io`;`deploy.repo` 同步改为 SSH 地址。
- `_config.landscape.yml` 是旧主题残留;现行主题为 `next`(`theme: next`),其配置在 `themes/next/_config.yml`(因上面的 gitlink 问题常缺失,主题以默认配置跑)。
- `source/.obsidian/` 是作者用 Obsidian 写作的配置,已入库,勿删勿改。
- Deploy 目标是 `main`(`_config.yml` 的 `deploy.branch`),不是 `master`。

## 无测试 / lint / CI

纯静态站,没有任何检查流水线。唯一验证手段:`hexo s` 本地预览确认渲染正常再部署。Dependabot 只在 dev_tttt 上跑(`.github/dependabot.yml`,npm 生态)。

## 维护备忘

作者自己写过一篇 Hexo 备忘录(`source/_posts/reminder-of-hexo.md`,即 2024-05-26 最后一篇),命令速查以它和 https://hexo.io/docs/ 为准。
