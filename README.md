# hugh-tong.github.io 维护手册

个人博客(Hexo 静态站 + GitHub Pages)。本手册覆盖日常写作、发布、主题切换、故障排查。面向未来的自己,按需查阅。

## 一图看懂仓库

```
dev_tttt 分支(源码,一切修改在这)         main 分支(部署产物,勿手改)
├── source/_posts/*.md    ← 你的文章       由 hexo d 自动 force-push 生成
├── _config.yml           ← 站点配置       master 分支 = 2023 旧产物,忽略
├── _config.butterfly.yml ← Butterfly 主题配置(覆盖式,升级主题不丢)
├── themes/               ← NexT 主题(gitlink)+ 主题切换 mode 文件
├── scaffolds/            ← hexo new 的模板
└── package.json          ← 依赖与 npm scripts
```

## 环境准备(换新机器/重装后)

```bash
git clone git@github.com:hugh-tong/hugh-tong.github.io.git
cd hugh-tong.github.io
git checkout dev_tttt
npm install
git clone https://github.com/next-theme/hexo-theme-next.git themes/next   # NexT 需要,不用 NexT 可跳过
git -C themes/next checkout v8.20.0
```

日常只需要 Node.js(≥14,建议 22)和 npm。**不再需要系统安装 pandoc**(渲染器已换为 hexo-renderer-marked)。

## 日常写作流程(最常用)

```bash
git checkout dev_tttt                        # 确认在源码分支
npx hexo new "我的新文章"                     # 生成 source/_posts/我的新文章.md
# 用编辑器/Obsidian 写正文(front-matter 参考:categories/tags 写法见旧文)
npm run server:butterfly                     # 本地预览 http://localhost:4000
# 满意后:
npx hexo clean && npm run deploy:butterfly   # 推荐先 clean 再部署,干净上线
```

`hexo deploy` 会自动增量生成并推送到 main(缓存可疑时先 clean)。GitHub Pages 生效有约 1 分钟延迟。

**别忘了提交源码**(deploy 只推生成的 HTML 到 main,文章的 md 还在本地):

```bash
git add source/_posts/我的新文章.md
git commit -m "Add post: 我的新文章"
git push origin dev_tttt
```

## 发布时切换主题

两套主题已装好,配置文件决定用哪套。默认 `_config.yml` 里 `theme: butterfly`(与线上一致)。

| 目的 | 命令 |
|---|---|
| Butterfly 本地预览 | `npm run server:butterfly` |
| Butterfly 部署上线 | `npm run deploy:butterfly` |
| NexT 本地预览 | `npm run server:next` |
| NexT 部署上线 | `npm run deploy:next` |
| 切换默认主题 | 改 `_config.yml` 的 `theme:` 行(注意同步线上是哪个) |

机制(知其所以然):脚本底层是 `hexo --config _config.yml,themes/xxx.mode.yml`,逗号列表 = 深合并后者优先;**单文件 `--config custom.yml` 会整体替换站点配置,千万别单文件用**。切换时 Hexo 会生成临时 `_multiconfig.yml`(已 gitignore,不用管)。

## 常用配置入口

| 想改什么 | 改哪里 |
|---|---|
| 站点标题/作者/时区 | `_config.yml` 顶部 Site 段 |
| 文章链接格式(permalink) | `_config.yml` URL 段 |
| 粒子背景/烟花/暗色/侧栏公告 | `_config.butterfly.yml` |
| NexT 的样式(若切回) | `themes/next/_config.yml` |
| 新文章默认 front-matter | `scaffolds/post.md` |
| 首页每页篇数 | `_config.yml` 的 `index_generator.per_page` |

`_config.butterfly.yml` 是覆盖式配置:只写要改的键,会深合并到主题默认配置上,所以 `npm update hexo-theme-butterfly` 升级主题不会丢你的定制。

## 故障排查(踩过的坑,按症状对号)

**`hexo g` 报主题找不到 / themes/next 是空目录**
→ gitlink 机制:克隆仓库不会自动带下 NexT。执行环境准备里的两条 clone 命令。不想再踩就只用 Butterfly(它是 npm 装的,无此问题)。

**本地 server 起不来或巨慢**
→ 仓库在 /mnt/c(Windows 盘)时 WSL 的文件监听极慢,`hexo s` 启动可能要 60-90 秒,耐心等 "Hexo is running" 再访问。后台启动建议 `setsid nohup npx hexo s > /tmp/hexo.log 2>&1 &`(普通 `&` 会随终端关闭被杀)。

**git clone/push GitHub 超时(GnuTLS error)**
→ 强制 HTTP/1.1:`git -c http.version=HTTP/1.1 clone ...`。remote 已配置为 SSH(`git@github.com:...`),走 SSH key 通常无此问题。

**push 提示没权限**
→ SSH key 需在 GitHub 账号 Settings → SSH and GPG keys 里注册(2026-09-13 注册过一把 ed25519)。

**改了配置/换了主题后站点异常**
→ 先 `npx hexo clean` 再重新生成,九成是缓存。

**分类/标签页 404**
→ 需要对应的索引页:`source/categories/index.md` 和 `source/tags/index.md` 都已建好,别删。分类本身在文章 front-matter 的 `categories:` 里维护。

**数学公式**
→ 文章 front-matter 加 `mathjax: true`(参考 `test-math-func.md`),marked 渲染 `$$...$$` 正常。

## 版本与依赖现状(2026-09-13)

- Hexo **6.3.0**(锁定),Node 22,npm 锁文件:`package-lock.json`(yarn.lock 已删)
- Butterfly **5.7.0**(npm 安装)+ NexT **v8.20.0**(gitlink 指向 tag)
- 渲染器:marked(markdown)、pug(Butterfly 模板)、ejs/stylus/swig(NexT 用)
- 搜索:hexo-generator-searchdb(本地 `search.json`,Butterfly 前端调用)
- 部署:hexo-deployer-git → SSH → main 分支
- 无 CI/lint/测试:唯一验证手段是 `npm run server:*` 本地预览

## 每年一次的健康检查清单

```bash
npm outdated                              # 看依赖是否有大版本更新
npm update hexo-theme-butterfly           # 主题小版本升级(配置不丢)
npx hexo --version                        # Hexo 大版本升级需谨慎,先看官方迁移文档
npm run server:butterfly && curl -s localhost:4000 | head -5   # 升级后全站过一遍
```

升级后按「日常写作流程」预览+部署,没有自动化,眼睛就是 CI。

---

*AI 协作注意事项见 `AGENTS.md`(面向 agent 的仓库规则);Hexo 命令官方文档 https://hexo.io/docs/ ;Butterfly 配置文档 https://butterfly.js.org* 
