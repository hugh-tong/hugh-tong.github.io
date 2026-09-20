import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { parse } from 'hexo-front-matter';

const root = process.cwd();
const postsRoot = path.join(root, 'source', '_posts');
const errors = [];
const warnings = [];
const allowedTypes = new Set(['prerequisite', 'explains', 'extends', 'compares', 'tool', 'series']);
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(absolute);
  }
  return files;
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function report(collection, file, message) {
  collection.push(`${relative(file)}: ${message}`);
}

const records = [];
const ids = new Map();
for (const file of (await walk(postsRoot)).sort()) {
  let data;
  try {
    data = parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    report(errors, file, `front matter 无法解析，无法审计图谱元数据: ${error.message}`);
    continue;
  }
  const graph = data.graph;
  if (graph == null) continue;
  if (typeof graph !== 'object' || Array.isArray(graph)) {
    report(errors, file, 'graph 必须是对象');
    continue;
  }
  if (typeof graph.id !== 'string' || !idPattern.test(graph.id)) {
    report(errors, file, 'graph.id 必须是小写 ASCII kebab-case');
    continue;
  }
  if (ids.has(graph.id)) {
    report(errors, file, `graph.id 重复: ${graph.id}（已在 ${relative(ids.get(graph.id).file)} 使用）`);
  } else {
    ids.set(graph.id, { file, data });
  }
  if (graph.relations != null && !Array.isArray(graph.relations)) {
    report(errors, file, 'graph.relations 必须是数组');
    continue;
  }
  for (const [index, relation] of (graph.relations || []).entries()) {
    if (!relation || typeof relation !== 'object' || Array.isArray(relation)) {
      report(errors, file, `graph.relations[${index}] 必须是对象`);
      continue;
    }
    if (typeof relation.target !== 'string' || !idPattern.test(relation.target)) {
      report(errors, file, `graph.relations[${index}].target 必须是小写 ASCII kebab-case`);
    }
    if (!allowedTypes.has(relation.type)) {
      report(errors, file, `graph.relations[${index}].type 非法: ${relation.type}`);
    }
    if (relation.target === graph.id) report(errors, file, `graph.relations[${index}] 不能指向自身`);
  }
  records.push({ file, graph });
}

for (const { file, graph } of records) {
  for (const relation of graph.relations || []) {
    if (typeof relation.target === 'string' && !ids.has(relation.target)) {
      report(errors, file, `关系目标不存在: ${relation.target}`);
    }
  }
}

const relationCount = records.reduce((count, record) => count + (record.graph.relations || []).length, 0);
if (records.length === 0) warnings.push('当前没有文章声明 graph 元数据；关系图谱不会显示。');
for (const warning of warnings) console.warn(`WARN  ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Checked graph metadata in ${records.length} opted-in post(s): ${relationCount} explicit relation(s), ${errors.length} error(s), ${warnings.length} warning(s).`);
if (errors.length) process.exitCode = 1;
