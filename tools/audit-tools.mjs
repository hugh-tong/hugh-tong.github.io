import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const generated = process.argv.includes('--generated');
const root = generated ? 'public/tools' : 'source/tools';
const errors = [];
const warnings = [];

function report(kind, file, message) {
  (kind === 'error' ? errors : warnings).push(`${file}: ${message}`);
}

function read(file) {
  return readFileSync(file, 'utf8');
}

function inlineScripts(html) {
  return [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
}

function canvasHasFallback(html) {
  return [...html.matchAll(/<canvas\b[^>]*>([\s\S]*?)<\/canvas>/gi)].every((match) => match[1].trim().length > 0);
}

if (!existsSync(root)) {
  console.error(`ERROR ${root}: directory does not exist`);
  process.exit(1);
}

const toolNames = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(root, entry.name, 'index.html')))
  .map((entry) => entry.name)
  .sort();

for (const name of toolNames) {
  const file = join(root, name, 'index.html');
  const html = read(file);
  const prefix = `${root}/${name}/index.html`;

  if (!/^<!doctype html>/i.test(html.trimStart())) report('error', prefix, '缺少 HTML5 doctype');
  if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) report('error', prefix, '缺少 html lang');
  if (!/<meta\b[^>]*\bname=["']viewport["']/i.test(html)) report('error', prefix, '缺少 viewport meta');
  if (!/<meta\b[^>]*\bname=["']description["']/i.test(html)) report('error', prefix, '缺少 description meta');
  if (!/<title>\S[\s\S]*?<\/title>/i.test(html)) report('error', prefix, '缺少可读 title');
  if (!/href=["']\/tools\/assets\/tool-shell\.css["']/i.test(html)) report('error', prefix, '未接入共享 tool-shell.css');
  if (!/src=["']\/tools\/assets\/tool-shell\.js["']/i.test(html)) report('error', prefix, '未接入共享 tool-shell.js');
  if (!/<body\b[^>]*\bdata-tool-scheme=["'](?:light|dark)["']/i.test(html)) report('error', prefix, '未声明 data-tool-scheme');
  if (!/data-tool-shell-root|data-tool-shell-native-nav/.test(html)) report('error', prefix, '未声明共享或原生工具导航');
  if (/<canvas\b/i.test(html) && !canvasHasFallback(html)) report('error', prefix, 'Canvas 缺少文本回退');
  if (/file:\/\//i.test(html)) report('error', prefix, '包含 file:// 本机链接');

  for (const [index, script] of inlineScripts(html).entries()) {
    try {
      new vm.Script(script, { filename: `${prefix} inline script ${index + 1}` });
    } catch (error) {
      report('error', prefix, `内联脚本语法错误：${error.message.split('\n')[0]}`);
    }
  }

  if (/<script\b[^>]*\bsrc=["']https?:\/\//i.test(html)) {
    report('warning', prefix, '包含外部脚本依赖；需保留离线失败状态');
  }
}

if (generated) {
  for (const asset of ['tool-shell.css', 'tool-shell.js']) {
    if (!existsSync(join(root, 'assets', asset))) report('error', `${root}/assets/${asset}`, '共享资产未生成');
  }
}

const indexFile = join(root, 'index.html');
if (!existsSync(indexFile)) {
  report('error', indexFile, '工具箱索引不存在');
} else {
  const indexHtml = read(indexFile);
  for (const name of toolNames) {
    if (!indexHtml.includes(`/tools/${name}/`)) report('error', indexFile, `缺少 /tools/${name}/ 入口`);
  }
}

for (const warning of warnings) console.warn(`WARN  ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Checked ${toolNames.length} tool page(s): ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
