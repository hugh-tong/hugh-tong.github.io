#!/usr/bin/env python3
"""check_math.py — 博客公式渲染校验器（blog-math-check skill）

用法:
  python3 check_math.py POST.md                 # 静态检查 markdown 源
  python3 check_math.py --html PAGE.html POST.md # 追加: 与生成 HTML 逐条比对
  python3 check_math.py --typeset POST.md        # 追加: node 端 TeX 编译检查

退出码 = ERROR 数量。
"""

import argparse
import html as htmlmod
import json
import os
import re
import subprocess
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))

FENCE_RE = re.compile(r'(^|\n)[ \t]*(`{3,}|~{3,})[\s\S]*?\2[ \t]*(?=\n|$)')
INLINE_CODE_RE = re.compile(r'(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)')
DISPLAY_MATH_RE = re.compile(r'\$\$([\s\S]+?)\$\$')
INLINE_MATH_RE = re.compile(r'(^|[^\\$])\$([^$\n]*[^\s$])\$(?!\d)')
CJK_RE = re.compile(r'[\u4e00-\u9fff]')


def mask_code(text):
    """把代码块/行内代码替换为等长空白(保留换行), 使后续定位与行号不受影响。"""
    def blank(m):
        return re.sub(r'[^\n]', ' ', m.group(0))
    text = FENCE_RE.sub(blank, text)
    text = INLINE_CODE_RE.sub(blank, text)
    return text


def line_of(text, offset):
    return text.count('\n', 0, offset) + 1


def extract_math(masked):
    """返回 [(kind, full, content, line)], kind in {'display','inline'}"""
    out = []
    for m in DISPLAY_MATH_RE.finditer(masked):
        out.append(('display', m.group(0), m.group(1), line_of(masked, m.start())))
    stripped = DISPLAY_MATH_RE.sub(lambda m: re.sub(r'[^\n]', ' ', m.group(0)), masked)
    for m in INLINE_MATH_RE.finditer(stripped):
        out.append(('inline', '$' + m.group(2) + '$', m.group(2),
                    line_of(stripped, m.start())))
    out.sort(key=lambda t: t[3])
    return out


def norm_ws(s):
    return re.sub(r'\s+', ' ', s).strip()


def article_text(htmlpath):
    src = open(htmlpath, encoding='utf-8').read()
    i = src.find('id="article-container"')
    if i >= 0:
        j = src.find('post-copyright', i)
        src = src[i:j] if j > 0 else src[i:]
    src = re.sub(r'<(script|style)[\s\S]*?</\1>', ' ', src)
    src = re.sub(r'<[^>]+>', ' ', src)
    src = htmlmod.unescape(src)
    return norm_ws(src)


def parse_front_matter(src):
    if src.startswith('---'):
        end = src.find('\n---', 3)
        if end > 0:
            return src[4:end]
    return ''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--html', metavar='PAGE.html', help='生成页面 HTML, 追加逐条比对')
    ap.add_argument('--typeset', action='store_true', help='node 端 TeX 编译检查')
    ap.add_argument('post')
    args = ap.parse_args()

    src = open(args.post, encoding='utf-8').read()
    fm = parse_front_matter(src)
    masked = mask_code(src)
    maths = extract_math(masked)

    errors, warns = [], []

    def err(msg):
        errors.append(msg)

    def warn(msg):
        warns.append(msg)

    # --- front matter ---
    has_mathjax = re.search(r'^mathjax:\s*true\s*$', fm, re.M) is not None
    if maths and not has_mathjax:
        err(f'front matter: 含 {len(maths)} 处公式但缺少 "mathjax: true"')

    # --- $$ 配对 ---
    leftover = DISPLAY_MATH_RE.sub('', masked)
    if '$$' in leftover:
        for m in re.finditer(r'\$\$', leftover):
            err(f'第 {line_of(leftover, m.start())} 行: 孤立的 $$（display 公式未闭合或嵌套）')

    # --- tag / label / eqref ---
    tags, labels, eqrefs = [], [], []
    for kind, full, content, ln in maths:
        tags += [(t, ln) for t in re.findall(r'\\tag\{([^}]*)\}', content)]
        labels += [(t, ln) for t in re.findall(r'\\label\{([^}]*)\}', content)]
        eqrefs += [(t, ln) for t in re.findall(r'\\eqref\{([^}]*)\}', content)]
        if kind == 'inline' and '\\tag' in content:
            err(f'第 {ln} 行: 行内公式含 \\tag（仅 display 公式有效）')
        if not content.strip():
            warn(f'第 {ln} 行: 空公式 {full!r}')
    tag_names = [t for t, _ in tags]
    dups = sorted({t for t in tag_names if tag_names.count(t) > 1})
    if dups:
        err(f'\\tag 编号重复: {", ".join(dups)}')
    label_names = [t for t, _ in labels]
    ldups = sorted({t for t in label_names if label_names.count(t) > 1})
    if ldups:
        warn(f'\\label 重复: {", ".join(ldups)}')
    missing_ref = sorted({t for t, _ in eqrefs} - set(label_names))
    if missing_ref:
        err(f'\\eqref 引用了不存在的 \\label: {", ".join(missing_ref)}')

    # --- CJK 混入公式 ---
    for kind, full, content, ln in maths:
        # display 数学不可能跨空行; 含空行说明是孤立 $$ 造成的伪 span, 已由配对检查报错
        if kind == 'display' and '\n\n' in content:
            continue
        if CJK_RE.search(content):
            frags = CJK_RE.findall(content)
            warn(f'第 {ln} 行: {kind} 公式含中文 {"".join(frags)[:12]!r}（MathJax 字体渲染风险, 建议移出数学环境）')

    # --- 表格行内的 display 公式 ---
    for kind, full, content, ln in maths:
        if kind == 'display':
            first_line = src.splitlines()[ln - 1]
            if first_line.lstrip().startswith('|'):
                warn(f'第 {ln} 行: display 公式出现在表格行内, MathJax 客户端渲染不稳, 建议改行内或移出表格')

    # --- HTML 比对 ---
    if args.html:
        try:
            page = article_text(args.html)
        except OSError as e:
            err(f'无法读取 HTML: {e}')
            page = ''
        if page:
            for kind, full, content, ln in maths:
                if norm_ws(full) not in page:
                    preview = norm_ws(full)[:60]
                    err(f'第 {ln} 行: 公式未在生成 HTML 中逐字出现（marked 破坏或过滤器失效）: {preview!r}')

    # --- TeX 编译 ---
    if args.typeset and maths:
        payload = [{'expr': c, 'display': k == 'display'} for k, _, c, _ in maths]
        try:
            r = subprocess.run(['node', os.path.join(HERE, 'typeset.mjs')],
                               input=json.dumps(payload), capture_output=True,
                               text=True, timeout=300)
            if r.returncode == 0 and r.stdout.strip():
                results = json.loads(r.stdout)
                for (kind, full, content, ln), res in zip(maths, results):
                    for e in res.get('errors', []):
                        err(f'第 {ln} 行: TeX 编译错误: {e} | {norm_ws(content)[:60]!r}')
            else:
                warn(f'TeX 编译检查不可用（node/typeset.mjs 失败）: {(r.stderr or r.stdout)[:120]!r}')
        except (OSError, subprocess.SubprocessError) as e:
            warn(f'TeX 编译检查不可用: {e}')

    # --- 汇总 ---
    print(f'文件: {args.post}')
    print(f'公式: {sum(1 for m in maths if m[0]=="display")} display + '
          f'{sum(1 for m in maths if m[0]=="inline")} inline; '
          f'front matter mathjax: {"yes" if has_mathjax else ("n/a" if not maths else "MISSING")}')
    for w in warns:
        print(f'WARN  {w}')
    for e in errors:
        print(f'ERROR {e}')
    print(f'结果: {len(errors)} error(s), {len(warns)} warning(s)')
    sys.exit(len(errors))


if __name__ == '__main__':
    main()
