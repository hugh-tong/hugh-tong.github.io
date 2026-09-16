import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const publicRoot = path.join(root, 'public');
const errors = [];
const required = [
  'index.html',
  '404.html',
  'archives/index.html',
  'categories/index.html',
  'tags/index.html',
  'search.json',
  'sitemap.xml',
  'atom.xml'
];

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    if (entry.isFile()) files.push(absolute);
  }
  return files;
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function relative(file) {
  return path.relative(publicRoot, file).split(path.sep).join('/');
}

for (const requiredPath of required) {
  if (!await exists(path.join(publicRoot, requiredPath))) errors.push(`缺少必要产物: ${requiredPath}`);
}

const files = (await walk(publicRoot)).sort();
const foldedPaths = new Map();
for (const file of files) {
  const relativePath = relative(file);
  const folded = relativePath.toLocaleLowerCase('en-US');
  const previous = foldedPaths.get(folded);
  if (previous && previous !== relativePath) {
    errors.push(`生成路径仅大小写不同: ${previous} / ${relativePath}`);
  } else {
    foldedPaths.set(folded, relativePath);
  }
}

const htmlFiles = files.filter(file => file.endsWith('.html'));
for (const file of htmlFiles) {
  const html = await fs.readFile(file, 'utf8');
  for (const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
    const reference = match[1].trim();
    if (/^file:\/\//i.test(reference)) {
      errors.push(`${relative(file)}: 包含 file:// 链接: ${reference}`);
      continue;
    }
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(reference)) continue;

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(reference, `https://hugh-tong.github.io/${relative(file)}`).pathname);
    } catch {
      errors.push(`${relative(file)}: 无法解析链接: ${reference}`);
      continue;
    }

    const candidate = path.join(publicRoot, pathname.replace(/^\/+/, ''));
    const resolvedCandidate = path.resolve(candidate);
    const resolvedPublic = path.resolve(publicRoot);
    if (resolvedCandidate !== resolvedPublic && !resolvedCandidate.startsWith(resolvedPublic + path.sep)) {
      errors.push(`${relative(file)}: 链接逃逸 public 目录: ${reference}`);
      continue;
    }
    const candidates = path.extname(candidate)
      ? [candidate]
      : [candidate, `${candidate}.html`, path.join(candidate, 'index.html')];
    if (!(await Promise.all(candidates.map(exists))).some(Boolean)) {
      errors.push(`${relative(file)}: 站内链接目标不存在: ${reference}`);
    }
  }
}

for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Checked ${files.length} generated files and ${htmlFiles.length} HTML pages: ${errors.length} error(s).`);
if (errors.length) process.exitCode = 1;
