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
  'knowledge/graph/index.html',
  'search.json',
  'sitemap.xml',
  'atom.xml',
  'api/note-graph.json'
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

const graphPath = path.join(publicRoot, 'api', 'note-graph.json');
if (await exists(graphPath)) {
  try {
    const graph = JSON.parse(await fs.readFile(graphPath, 'utf8'));
    if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
      errors.push('api/note-graph.json: nodes 与 edges 必须是数组');
    } else {
      const ids = new Set(graph.nodes.map(node => node.id));
      for (const edge of graph.edges) {
        if (!ids.has(edge.source) || !ids.has(edge.target)) errors.push(`api/note-graph.json: 边指向不存在节点: ${edge.source} → ${edge.target}`);
      }
      for (const node of graph.nodes.filter(node => node.explicitId)) {
        const relativePage = node.path.replace(/^\/+/, '');
        const page = path.join(publicRoot, relativePage, 'index.html');
        if (!(await exists(page))) {
          errors.push(`api/note-graph.json: 显式节点页面不存在: ${node.path}`);
          continue;
        }
        const pageHtml = await fs.readFile(page, 'utf8');
        if (!pageHtml.includes('data-note-relationship-graph="true"')) {
          errors.push(`api/note-graph.json: 显式节点未渲染关系区块: ${node.path}`);
        }
      }
    }
  } catch (error) {
    errors.push(`api/note-graph.json: JSON 无法解析: ${error.message}`);
  }
}

const overviewPath = path.join(publicRoot, 'knowledge', 'graph', 'index.html');
if (await exists(overviewPath)) {
  const overviewHtml = await fs.readFile(overviewPath, 'utf8');
  if (!overviewHtml.includes('data-note-graph-overview="true"')) {
    errors.push('knowledge/graph/index.html: 未渲染全站关系图谱容器');
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
