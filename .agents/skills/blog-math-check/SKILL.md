---
name: blog-math-check
description: 校验 Hexo+Butterfly+MathJax 博客文章的公式渲染完整性。在本仓库（hugh-tong.github.io）写、改、发布任何包含数学公式的博文（$...$、$$...$$、LaTeX、MathJax）时默认必须使用；用户报告"公式显示不对/乱码/有杂散标点"时也使用。检测 markdown 源与生成 HTML 中公式被 marked 破坏（\\ 折叠、\\; \\, \\{ 被吃）、\\tag/\\label 不一致、CJK 混入公式、缺 mathjax front matter、TeX 语法错误等问题。
---

# 博客公式渲染校验（blog-math-check）

## 背景（为什么需要）

本站用 `hexo-renderer-marked` 渲染 markdown、MathJax 4 在浏览器端渲染公式。
历史上 marked 会破坏数学环境里的转义（`\\` 折叠成 `\`、`\;` `\,` `\!` `\:` `\{` `\}` `\|` 等被当成 markdown 转义吃掉、`*`/`~~` 被当强调符号），导致公式出现杂散标点或多行公式折断——这就是"经常有公式显示问题"的根因。`scripts/math-protect.js`（Hexo 过滤器）已在渲染管线根治它；本 skill 的 `--html` 比对是对该防护的回归测试，其余检查覆盖 front matter、编号引用、字体与语法。

## 何时运行

- 写完或修改完任何含公式的博文之后（`npm run check:source` 之前）
- `hexo generate` 之后、提交之前
- 排查线上公式显示问题时

## 校验流程

设博文为 `source/_posts/<name>.md`，生成后的页面为 `public/<year>/<month>/<day>/<name>/index.html`。

### 第 1 步：静态检查（源文件）

```bash
python3 .agents/skills/blog-math-check/scripts/check_math.py source/_posts/<name>.md
```

### 第 2 步：生成并比对 HTML（关键一步，必须有）

```bash
npx hexo clean && npx hexo generate --config _config.yml,themes/butterfly.mode.yml --bail
python3 .agents/skills/blog-math-check/scripts/check_math.py \
  --html public/<year>/<month>/<day>/<name>/index.html source/_posts/<name>.md
```

改了源文件但没 clean 时，hexo 的 db.json 缓存会跳过重新渲染，比对会误报——务必先 clean。

### 第 3 步（可选但推荐）：TeX 语法编译检查

```bash
python3 .agents/skills/blog-math-check/scripts/check_math.py --typeset source/_posts/<name>.md
```

首次运行会向缓存目录（`/tmp/zcode-blog-math-check`）安装 `mathjax-full@3`（node 端 TeX 编译器，与站点 MathJax 同源），之后离线可用。能抓未闭合 `\left`、重复 `\tag`、未定义宏等编译级错误。

三条可合并：`--html <path> --typeset` 同一次调用完成。退出码 = ERROR 数，0 才算过。

## 输出与判定

- `ERROR`：必须修复（HTML 比对缺失、`\eqref` 无对应 `\label`、有数学却缺 `mathjax: true`、TeX 编译错误、`$$` 不成对）
- `WARN`：应修复或确认（CJK 混入公式、`\tag` 重复或跳号、display 公式放进表格行、`\label` 重复）
- `INFO`：供参考

## 修复规则速查

| 症状/检查项 | 修复 |
|---|---|
| HTML 比对报公式缺失 | 源文件公式含被 marked 吃的字符；确认 `scripts/math-protect.js` 存在且已 `hexo clean` 后重新 generate |
| CJK 在 `$...$` 内（如 `\text{壁面热流}`） | 中文移出数学环境，公式里只留变量与数字 |
| `\eqref{x}` 无 `\label{x}` | 补 label 或改引用；也可直接写"式 (12)" |
| `\tag` 重复 | 全文重排为连续编号 |
| 缺 `mathjax: true` | front matter 补一行（有公式就必须有） |
| 表格行内放 `$$...$$` | 改行内 `$...$` 或把公式移出表格 |
| `\eqref` 报 "??""（typeset 不报） | 静态检查负责 label 一致性，以第 1 步结果为准 |

## 边界

- 只处理 `$`/`$$` 定界（与主题 MathJax 配置一致）；`` ` `` 代码与围栏代码块内的 `$` 自动排除。
- `--html` 需要文章已按本站 permalink 规则生成（`:year/:month/:day/:title/`）。
- 交给 `npm run verify` 的元数据/链接检查不覆盖公式，两者互补，都要跑。
