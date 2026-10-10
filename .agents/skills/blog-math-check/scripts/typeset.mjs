// typeset.mjs — node 端 TeX 编译检查（blog-math-check skill）
// stdin:  JSON 数组 [{expr, display}, ...]
// stdout: JSON 数组 [{errors: [..]}, ...]（与输入一一对应）
// 首次运行向缓存目录安装 mathjax-full@3（约 20s），之后离线可用。

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CACHE = process.env.MJ_CACHE || '/tmp/zcode-blog-math-check';
const MJ_DIR = path.join(CACHE, 'node_modules', 'mathjax-full');

if (!fs.existsSync(path.join(MJ_DIR, 'package.json'))) {
  fs.mkdirSync(CACHE, { recursive: true });
  execSync('npm i mathjax-full@3 --no-audit --no-fund --silent', { cwd: CACHE, stdio: 'pipe' });
}

const require2 = createRequire(import.meta.url);
const { mathjax } = require2(path.join(MJ_DIR, 'js', 'mathjax.js'));
const { TeX } = require2(path.join(MJ_DIR, 'js', 'input', 'tex.js'));
const { AllPackages } = require2(path.join(MJ_DIR, 'js', 'input', 'tex', 'AllPackages.js'));
const { RegisterHTMLHandler } = require2(path.join(MJ_DIR, 'js', 'handlers', 'html.js'));
const { liteAdaptor } = require2(path.join(MJ_DIR, 'js', 'adaptors', 'liteAdaptor.js'));
const { SerializedMmlVisitor } = require2(
  path.join(MJ_DIR, 'js', 'core', 'MmlTree', 'SerializedMmlVisitor.js'));

RegisterHTMLHandler(liteAdaptor());
const tex = new TeX({
  packages: AllPackages.filter(p => p !== 'bussproofs'),
  tags: 'ams',
});
const doc = mathjax.document('', { InputJax: tex });
const visitor = new SerializedMmlVisitor();

const input = JSON.parse(fs.readFileSync(0, 'utf8'));
const out = input.map(({ expr, display }) => {
  try {
    const node = doc.convert(expr, { display: !!display });
    const mml = visitor.visitTree(node);
    const errors = [...mml.matchAll(/data-mjx-error="([^"]*)"/g)].map(m => m[1]);
    return { errors };
  } catch (e) {
    return { errors: [String(e.message || e).slice(0, 160)] };
  }
});
process.stdout.write(JSON.stringify(out));
