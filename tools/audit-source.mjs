import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { parse } from 'hexo-front-matter';

const root = process.cwd();
const postsRoot = path.join(root, 'source', '_posts');
const errors = [];
const warnings = [];

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

function relative(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function report(collection, file, message) {
  collection.push(`${relative(file)}: ${message}`);
}

function flattenTaxonomy(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(flattenTaxonomy);
  return [String(value)];
}

const markdownFiles = (await walk(postsRoot)).filter(file => file.endsWith('.md')).sort();
const caseSensitivePaths = new Map();
const taxonomy = new Map();

for (const file of markdownFiles) {
  const relativePath = relative(file);
  const foldedPath = relativePath.toLocaleLowerCase('en-US');
  const existingPath = caseSensitivePaths.get(foldedPath);
  if (existingPath && existingPath !== relativePath) {
    report(errors, file, `文件名仅大小写不同，会在部分系统冲突: ${existingPath}`);
  } else {
    caseSensitivePaths.set(foldedPath, relativePath);
  }

  const source = await fs.readFile(file, 'utf8');
  let data;
  try {
    data = parse(source);
  } catch (error) {
    report(errors, file, `front-matter 无法解析: ${error.message}`);
    continue;
  }

  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    report(errors, file, 'title 必须是非空字符串');
  }
  if (!data.date) {
    report(errors, file, '缺少 date；构建时间会污染文章日期和生成结果');
  } else if (Number.isNaN(new Date(data.date).getTime())) {
    report(errors, file, `date 无法解析: ${data.date}`);
  }
  if (!data.description) {
    report(warnings, file, '缺少 description');
  } else if (typeof data.description !== 'string') {
    report(errors, file, 'description 必须是字符串');
  }
  if (flattenTaxonomy(data.categories).length === 0) report(warnings, file, '缺少 categories');

  if (/\bfile:\/\//i.test(source)) report(errors, file, '包含访客无法访问的 file:// 本机链接');

  const prose = source.replace(/^\s*(?:```|~~~)[^\n]*\n[\s\S]*?^\s*(?:```|~~~)\s*$/gm, '');
  for (const match of prose.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+['"][^)]*['"])?\)/g)) {
    const target = match[1].replace(/^<|>$/g, '');
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(target)) continue;
    if (target.startsWith('/')) continue;
    const cleanTarget = decodeURIComponent(target.split(/[?#]/, 1)[0]);
    if (!cleanTarget) continue;
    const resolved = path.resolve(path.dirname(file), cleanTarget);
    try {
      await fs.access(resolved);
    } catch {
      report(errors, file, `本地链接目标不存在: ${target}`);
    }
  }

  for (const kind of ['tags', 'categories']) {
    for (const value of flattenTaxonomy(data[kind])) {
      const key = `${kind}:${value.toLocaleLowerCase('en-US')}`;
      const previous = taxonomy.get(key);
      if (previous && previous.value !== value) {
        report(errors, file, `${kind} 仅大小写不同，会生成冲突路由: ${previous.value} / ${value}`);
      } else if (!previous) {
        taxonomy.set(key, { value, file });
      }
    }
  }
}

for (const warning of warnings) console.warn(`WARN  ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Checked ${markdownFiles.length} posts: ${errors.length} error(s), ${warnings.length} warning(s).`);
if (errors.length) process.exitCode = 1;
