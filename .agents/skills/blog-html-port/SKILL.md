---
name: blog-html-port
description: 把自包含 HTML（交互教程/可视化实验室/分析报告/参数工具）移植发布为博客内容并归档到 TODO/archived。在本仓库（hugh-tong.github.io）里，用户要求"移植/发布/上线"某个 HTML 页面、TODO 目录出现新的 HTML、或提到把交互教程、实验室、可视化页面做成博客时，默认必须使用。
---

# HTML 页面移植发布与归档（blog-html-port）

## 流程总览

```
定位分类 → 摸底检查 → 部署 → （需博文时）包装 → 校验 → 归档 → 提交
```

## 第 1 步：定位分类（三个命名空间）

| 类型 | 命名空间 | 博文包装 | 判定 |
|---|---|---|---|
| 参数计算工具（输入参数出结果） | `/tools/<slug>/` | 无（由 `/tools/` 索引页聚合） | 以"算"为主，叙事少 |
| 分析报告（数据/源码核验类长文） | `/report/<slug>/` | 有，`<slug>-live.md` | 以"读"为主，静态结论 |
| 交互教程（叙事 + 滑杆/实验） | `/tutorial/<slug>/` | 有，`<slug>-tutorial-live.md` | 以"学"为主，有交互 |

拿不准就问用户；这是内容定位决策，不是技术决策。`_config.yml` 的 `skip_render` 已登记 `tools/report/tutorial` 三类 `**/*.html`，新增其他命名空间时要补登记。

## 第 2 步：摸底检查（部署前必做）

```bash
python3 - <<'EOF'
import re
s = open('<HTML文件>', encoding='utf-8').read()
print('size:', len(s))
print('external scripts:', re.findall(r'<script[^>]*src="(htt[^"]*)"', s))
print('external css:', re.findall(r'<link[^>]*href="(htt[^"]*)"', s))
print('file:// 链接:', len(re.findall(r'file://', s)), '| /home 路径:', len(re.findall(r'/home/[a-z]', s)))
print('viewport:', 'viewport' in s[:s.find('</head>')])
print('canvas/svg/input/onclick:', s.count('<canvas'), s.count('<svg'), s.count('<input'), s.count('onclick')+s.count('oninput'))
EOF
```

判定标准：
- `file://` 或 `/home/` 路径 > 0 → **必须先清理**，不能直接部署；
- 有外链 script（CDN 等）→ 参照先例 bc-layer-calculator：部署版曾把原件的 tailwind CDN 移除、离线化后再上线；不能简单照搬；
- 无 viewport → 需补 `<meta name="viewport">`（移动端）；
- 公式若为预渲染 MathJax（含 `mjx-` 标记、无外链）→ 零运行时依赖，原样部署即可。

## 第 3 步：部署

```bash
mkdir -p source/<namespace>/<slug>
cp <原件> source/<namespace>/<slug>/index.html
```

页面本体不重写（source-first 原则），除非第 2 步发现 CDN 依赖或隐私残留。

## 第 4 步：博文包装（report/tutorial 需要）

复制 `assets/wrapper-post-template.md` 为 `source/_posts/<slug>-live.md`（教程类命名 `<slug>-tutorial-live.md`），替换占位符。要点：

- front matter：固定 `date`、`categories`、`tags`、`description`；有公式加 `mathjax: true`；
- 速览表：从页面 `<h2>` 提取章节标题生成（读原文，不要凭空编）；
- iframe 指向 `/<namespace>/<slug>/`，必须带独立页兜底链接（RSS 环境用）；
- 移动端自适应 CSS 模板里已带，不要重新发明；
- 正文若有公式 → 运行 blog-math-check skill 校验。

## 第 5 步：校验

```bash
npm run check:source   # 元数据、链接
npm run verify         # 双主题 clean/build/生成物检查
ls public/<namespace>/<slug>/   # 确认页面进了构建产物
```

改过 `_config.yml` 或怀疑缓存时必须 clean 再生成（db.json 缓存会跳过未变源文件的渲染）。

## 第 6 步：归档

```bash
mv TODO/<原件> TODO/archived/
```

并在 `TODO/archived/README.md` 对照表**登记一行**（原件 → 部署位置 → 博文包装）。做完后 TODO 顶层只应剩流程 md 和未移植文件。

## 第 7 步：提交与发布

- 只暂存本次明确改动的路径（页面、博文、配置），禁止 `git add .`；
- 提交信息说明部署位置与命名空间决策；
- 发布由用户执行：push → CI 绿 → 手动触发 "Deploy GitHub Pages"，agent 不自行触发部署。
