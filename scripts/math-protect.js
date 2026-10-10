'use strict';

/**
 * math-protect.js — Hexo filter plugin
 *
 * hexo-renderer-marked 在 Markdown→HTML 阶段会破坏 LaTeX 数学里的转义:
 *   "\\" (换行)   → "\"        多行公式折断
 *   "\\;" "\\," "\\!" "\\:"     LaTeX 间距命令退化为裸标点
 *   "\\{" "\\}" "\\|" "\\#" "\\%" "\\$"   花括号/竖线等语义丢失
 *   "*", "~~", "_" 等           可能被当作 Markdown 强调吃掉
 *
 * 本过滤器在 before_post_render 把代码块与数学片段替换为字母数字占位符
 * (marked 不会动它们), 在 after_post_render 原样解码还原; < > & 由本插件
 * 自行转义为 HTML 实体, MathJax 读取 textContent 时会解码回来, 与未加保护时
 * 行为一致。占位符自带内容(十六进制编码), 过滤器无跨文档状态。
 *
 * 保护范围: $...$ 行内公式与 $$...$$ 展示公式(与主题 MathJax 配置的
 * inlineMath/displayMath 定界一致), 代码块/行内代码先于公式提取、不参与。
 */

const OPEN = 'qqmathqq';
const CLOSE = 'qqendqq';
const TOKEN_RE = new RegExp(OPEN + '([0-9a-f]+)' + CLOSE, 'g');

// 行内代码: `code` 与 ``code``, 先于公式提取, 避免 $ 在代码里被误判
const INLINE_CODE_RE = /(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/g;
// 围栏代码块: ``` 与 ~~~
const FENCE_RE = /(^|\n)([ \t]*)(`{3,}|~{3,})[\s\S]*?\3[ \t]*(?=\n|$)/g;
// 展示公式
const DISPLAY_MATH_RE = /\$\$([\s\S]+?)\$\$/g;
// 行内公式: 单行、内部无 $、定界 $ 两侧不贴空白、前一个字符不是反斜杠(\$ 转义)
const INLINE_MATH_RE = /(^|[^\\$])\$([^$\n]*[^\s$])\$(?!\d)/g;

const escapeHtmlEntities = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const encodeToken = (s) =>
  OPEN + Buffer.from(s, 'utf8').toString('hex') + CLOSE;

const decodeToken = (s) =>
  escapeHtmlEntities(Buffer.from(s, 'hex').toString('utf8'));

hexo.extend.filter.register('before_post_render', (data) => {
  let src = data.content !== undefined ? data.content : data;
  if (typeof src !== 'string' || src.indexOf('$') < 0) return data;

  const stash = (s) => encodeToken(s);

  src = src.replace(FENCE_RE, (m) => stash(m));
  src = src.replace(INLINE_CODE_RE, (m) => stash(m));
  src = src.replace(DISPLAY_MATH_RE, (m) => stash(m));
  // 前置字符 p1 保持在占位符之外, 只保护 $...$ 本身
  src = src.replace(INLINE_MATH_RE, (m, p1, inner) => p1 + stash('$' + inner + '$'));

  if (data.content !== undefined) {
    data.content = src;
    return data;
  }
  return src;
});

hexo.extend.filter.register('after_post_render', (data) => {
  let src = data.content !== undefined ? data.content : data;
  if (typeof src !== 'string' || src.indexOf(OPEN) < 0) return data;

  src = src.replace(TOKEN_RE, (_, hex) => decodeToken(hex));

  if (data.content !== undefined) {
    data.content = src;
    return data;
  }
  return src;
});
