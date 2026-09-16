• 整体结论：博客目前“能稳定访问、能在本机生成”，但仓库治理仍偏手工，尚不适合放心地多机维护或自动发布。最需要先处理的是默认分支、构建可复现
  性和依赖安全，而不是页面样式。

  本轮没有修改、提交或部署任何文件。

  ## 已验证情况

  ### P0：下次部署前应处理

  1. 构建结果目前不确定

  source/_posts/hello-world.md:1 没有显式 date。我在临时目录重新生成 Butterfly 后：

  - 文件集合仍是 437 个。
  - 但有 390 个生成文件与线上 main 不同。
  - Hello World 被按当前文件修改时间解释成 2026-09-15，并突然排到最新文章。
  - 首页、分页、上一篇/下一篇、相关文章等随之大面积变化。

  此外，_config.yml:84 使用 updated_option: mtime，_config.yml:12 的时区又为空，也会让不同机器的生成结果更容易漂移。

  建议：

  - 给所有文章强制要求显式日期，先修复 hello-world.md。
  - 设置 timezone: Asia/Shanghai。
  - 将 updated_option 改为 date、empty，或者引入基于 Git 历史的统一更新时间方案。
  - CI 中增加“缺少日期即失败”。

  2. GitHub 默认分支仍是废弃的 master

  远端 HEAD 和 GitHub 仓库首页 都指向 master，所以：

  - 新 clone 默认得到 2023 年旧静态页面。
  - GitHub 首页看不到源码 README。
  - 新 PR 默认会指向旧部署分支。
  - 很多 GitHub 功能会围绕错误分支工作。

  最小风险方案是直接把 GitHub 默认分支改成 dev_tttt，暂时不必重命名分支，也不会改变 Pages 当前从 main 发布的设置。

  3. Dependabot 配置实际上不会生效

  .github/dependabot.yml:1 只存在于 dev_tttt，默认分支 master 没有该文件。GitHub 明确要求 dependabot.yml 必须位于默认分支，因此
  AGENTS.md:51 中“Dependabot 只在 dev_tttt 上跑”的说法并不成立。GitHub Dependabot 文档

  建议先把更新频率从 daily/20 PR 调整成 weekly、启用依赖分组，再修改默认分支，避免首次生效时产生大量 PR。

  4. HANDOFF 文件不应直接进入公开仓库

  当前未跟踪的 HANDOFF_CONTEXT_20260915.md:77 含有：

  - SSH 用户名。
  - 局域网 IP。
  - Mac 绝对路径。
  - 另一台机器地址提示。
  - SSH key 已授权状态。

  这些未必构成密钥泄漏，但不适合进入公开博客仓库。应放到仓库外、加入本地 exclude，或者先脱敏再提交。

  ### P1：近期维护应处理

  5. 发布模型存在结构性覆盖风险

  当前流程是：

  Mac / Ubuntu
      │
      ├─ 各自在 dev_tttt 写作
      │
      └─ 本地 Hexo 构建
             │
             └─ force-push main
                      │
                      └─ GitHub Pages 内置部署

  package.json:14 中的 deploy 脚本调用 hexo deploy；hexo-deployer-git 最终使用 git push --force。如果本机源码没有同步，旧内容就可能重新覆盖
  main，此前已经真实发生过一次。

  另外，hexo deploy 只有在 public/ 不存在或带 --generate 时才生成；直接运行 npm run deploy:butterfly 可能发布现存的旧 public/。README 推荐
  的 clean && deploy 当前能规避，但脚本自身仍不安全。Hexo 生成与部署说明

  长期推荐改成：

  dev_tttt（默认源码分支）
          │
          ├─ CI：npm ci + 审计 + 双主题构建
          │
          └─ GitHub Pages workflow
                   │
                   └─ Pages artifact 部署

  这样每台电脑只推源码，GitHub 在统一环境中生成并部署，不再由个人电脑 force-push 静态分支。GitHub 和 Hexo 都支持这种 Pages 工作流。GitHub
  Pages 自定义工作流、Hexo GitHub Pages 指南

  目前 GitHub 上看到的 Actions 只是对 main 已生成文件运行的 pages-build-deployment，不是源码构建 CI。当前 Actions 页面

  6. NexT 是无法自动恢复的裸 gitlink

  themes/next 在根仓库中是 mode 160000 的 gitlink，但没有 .gitmodules。当前电脑因为手工 clone 所以能构建；新电脑、CI 和普通 clone 得到的是
  空目录。

  建议将 NexT 改成 npm 依赖：

  - 锁定 hexo-theme-next@8.20.0。
  - 配置迁移到根目录 _config.next.yml。
  - 删除裸 gitlink。
  - 与 Butterfly 一样由 npm ci 恢复。

  NexT 官方也把 npm 安装列为 Hexo 5+ 的推荐方式，并建议把配置放在根目录 _config.next.yml。NexT 安装文档、NexT 配置文档

  7. 依赖链有较多已知漏洞

  当前 npm audit --package-lock-only 报告：

  - 27 个漏洞项。
  - 3 critical。
  - 9 high。
  - 9 moderate。
  - 6 low。

  主要来源：

  - Hexo 6.3.0 本身存在 include_code 路径穿越问题，7.2.0 已修复。GitHub Advisory
  - 未发现仓库实际使用 .swig 模板，但直接依赖了 hexo-renderer-swig，它带入 swig → optimist → minimist 的严重旧依赖链；Swig 本身存在任意本地
    文件读取问题且没有修复版本。GitHub Advisory

  - 根依赖中的 hexo-renderer-stylus@2.1.0 已落后，而 Butterfly 自己已经携带 3.0.1；但 NexT 确实需要 Stylus，因此不能直接删除，应升级并验
    证。

  - Landscape、EJS、Swig 很可能只为旧主题残留服务。

  由于线上是纯静态文件，这些不是“线上 Node 服务正在被直接攻击”；风险主要位于本地/CI 构建阶段，特别是未来自动导入外部 Markdown 时。建议在独
  立升级分支中：

  1. 删除确定未使用的 Swig。
  2. 决定是否彻底退役 Landscape 和 EJS。
  3. 升级 Stylus renderer。
  4. 将 Hexo 至少升级到 7.2+，再评估 Hexo 8。
  5. 双主题、MathJax、Mermaid、搜索全部回归后再合并。
  6. 文档存在明显漂移

  AGENTS.md:10 仍写：

  - main 最新于 2024-05-26，实际已更新到 2026-09-15。
  - 默认主题是 NexT，实际 _config.yml:102 是 Butterfly。
  - 现行主题 NexT，与 README、DEPLOYMENT 和线上不一致。
  - Hexo “锁定于 package.json”，但依赖写的是 ^6.3.0；真正锁定版本的是 package-lock.json 配合 npm ci。

  建议明确文档职责：

  - AGENTS.md：只保留分支、安全边界和验证门禁。
  - README.md：作者日常操作。
  - DEPLOYMENT.md：新机器恢复和故障处理。
  - CONTENTS.md：只管理文章台账。
  - 版本、主题和脚本尽量从配置读取，不在四份文档重复写死。

  ## 增强机会

  这些不会阻塞当前上线，但值得逐步处理：

  - 当前 Butterfly 两套主题均能成功生成：Butterfly 437 文件，NexT 469 文件。
  - 首页、归档、分类、标签、搜索和首页内部静态资源均返回 200。
  - 线上缺少自定义 404.html、robots.txt、sitemap.xml 和 feed。
  - 首页仍输出 lang="en"、og:locale="en_US"，并继承了主题默认的 https://github.com/xxxxxx “Follow Me”链接；对应配置入口在
    _config.butterfly.yml:35。

  - search.json 已约 577 KB，会随文章数量线性增长；目前可用，但移动端首次搜索成本会继续增大。
  - 生成路由存在 tags/Deploy/ 与 tags/deploy/ 的大小写碰撞，在默认大小写不敏感的 macOS 文件系统上有覆盖风险。
  - 有一张 2.6 MB 图片以完全相同内容存了两份，其中一份没有被引用。
  - source/.obsidian/workspace.json 属于易变的个人工作区状态；可以保留 Obsidian 的可移植配置，但考虑忽略 workspace.json。
  - post scaffold (scaffolds/post.md:1) 只有 title/date/tags，建议加入 categories、description，以及可选的 mathjax 标记。
  - 增加 .nvmrc 或 .node-version、package.json.engines，并把文档统一为 npm ci。本次 npm ci --dry-run 已通过，说明当前锁文件一致。

  ## 建议实施顺序

  1. 保护或脱敏 HANDOFF；明确处理现有 .gitignore、CONTENTS.md 修改。
  2. 修复缺失日期、时区和更新时间策略，确保重建不漂移。
  3. 修订 AGENTS/README/DEPLOYMENT 的冲突描述。
  4. 调整 Dependabot 配置，然后把默认分支改成 dev_tttt。
  5. 增加只读审计脚本和 CI：锁文件、双主题构建、缺失日期、内部资源、大小写路由碰撞。
  6. 把 NexT 改为 npm 管理。
  7. 清理旧 renderer，并分阶段升级 Hexo。
  8. 将 Pages 改为 GitHub Actions artifact 部署。
  9. 验证稳定后，把旧 master 和生成型 main 做标签归档，再决定是否删除。

  ## 未验证范围

  - 未登录 GitHub，因此没有确认 branch protection、Pages Settings、Environment protection 和 Dependabot Alerts 的后台开关。
  - 没有做 Lighthouse、移动端视觉、无障碍或跨浏览器测试。
  - 没有检查文章观点、技术内容和全部外部链接。
  - 没有实际尝试 Hexo 7/8 或移除旧 renderer；这些需要独立升级分支验证。
  - 没有执行任何真实 push、deploy 或 GitHub 设置修改。