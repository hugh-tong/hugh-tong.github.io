/* global hexo */

'use strict';

const path = require('node:path');

const MARKER = 'data-note-relationship-graph="true"';
const BLOCK_PATTERN = /\n?<section class="note-relationship-graph" data-note-relationship-graph="true"[\s\S]*?<\/section>\n?/g;
const EXPLICIT_TYPES = new Set(['prerequisite', 'explains', 'extends', 'compares', 'tool', 'series']);
const TYPE_LABELS = {
  prerequisite: '建议先读',
  explains: '解释与展开',
  extends: '进一步扩展',
  compares: '对比阅读',
  tool: '配套工具',
  series: '同一系列',
  links: '文中链接',
  tag: '共同具体标签'
};
let cachedGraph;

function htmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function collectionToArray(collection) {
  if (!collection) return [];
  if (typeof collection.toArray === 'function') return collection.toArray();
  return Array.isArray(collection) ? collection : [];
}

function toTagNames(post) {
  return collectionToArray(post.tags).map(tag => tag.name).filter(Boolean).map(String).sort();
}

function rootUrl() {
  const root = hexo.config.root || '/';
  return root.endsWith('/') ? root : `${root}/`;
}

function publicUrl(postPath) {
  return `${rootUrl()}${String(postPath).replace(/^\/+/, '')}`.replace(/\/+/g, '/');
}

function pathKey(value) {
  let normalized = String(value || '').replace(/[?#].*$/, '');
  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    return '';
  }
  const root = rootUrl().replace(/\/$/, '');
  if (root && normalized.startsWith(root + '/')) normalized = normalized.slice(root.length);
  normalized = normalized.replace(/^\/+/, '').replace(/\/index\.html$/, '').replace(/\/+$/, '');
  return normalized;
}

function automaticId(post) {
  return `path:${pathKey(post.path)}`;
}

function getGraphConfig() {
  const data = hexo.locals.get('data') || {};
  return data['note-taxonomy'] || { tags: {}, weak_edges: {} };
}

function relationEntries(post) {
  const graph = post.graph;
  if (!graph || typeof graph !== 'object' || !Array.isArray(graph.relations)) return [];
  return graph.relations.filter(item => item && typeof item.target === 'string' && EXPLICIT_TYPES.has(item.type));
}

function resolveInternalPath(href, fromPath) {
  const value = String(href || '').trim();
  if (!value || /^(?:#|mailto:|tel:|data:|javascript:|\/\/)/i.test(value)) return '';

  let candidate = value;
  if (/^https?:/i.test(candidate)) {
    try {
      const url = new URL(candidate);
      const site = new URL(hexo.config.url || 'https://hugh-tong.github.io');
      if (url.host !== site.host) return '';
      candidate = url.pathname;
    } catch {
      return '';
    }
  }

  candidate = candidate.replace(/[?#].*$/, '');
  if (!candidate) return '';
  if (!candidate.startsWith('/')) {
    candidate = path.posix.join('/', path.posix.dirname(`/${fromPath}`), candidate);
  }
  return pathKey(candidate);
}

function findInternalLinks(post, byPath) {
  const links = new Set();
  const html = String(post.content || '');
  const hrefPattern = /<a\b[^>]*?\bhref\s*=\s*(["'])(.*?)\1/gi;
  for (const match of html.matchAll(hrefPattern)) {
    const targetPath = resolveInternalPath(match[2], post.path);
    const target = byPath.get(targetPath);
    if (target && target.id !== post.__noteGraphId) links.add(target.id);
  }
  return [...links].sort();
}

function pairKey(source, target) {
  return [source, target].sort().join('\u0000');
}

function buildGraph(posts) {
  const config = getGraphConfig();
  const tagConfig = config.tags || {};
  const weakConfig = config.weak_edges || {};
  const nodes = [];
  const byId = new Map();
  const byPath = new Map();

  for (const post of posts) {
    const explicitId = post.graph && typeof post.graph === 'object' ? post.graph.id : null;
    const id = typeof explicitId === 'string' && explicitId ? explicitId : automaticId(post);
    const node = {
      id,
      title: String(post.title || post.path),
      path: publicUrl(post.path),
      tags: toTagNames(post),
      kind: 'note',
      explicitId: Boolean(explicitId)
    };
    post.__noteGraphId = id;
    nodes.push(node);
    byId.set(id, node);
    byPath.set(pathKey(post.path), node);
  }

  const edgesByPair = new Map();
  function addEdge(edge, priority) {
    const key = pairKey(edge.source, edge.target);
    const existing = edgesByPair.get(key);
    if (!existing || priority > existing.priority || (priority === existing.priority && edge.type < existing.type)) {
      edgesByPair.set(key, { ...edge, priority });
    }
  }

  for (const post of posts) {
    for (const relation of relationEntries(post)) {
      if (byId.has(relation.target)) {
        addEdge({ source: post.__noteGraphId, target: relation.target, type: relation.type, origin: 'explicit' }, 3);
      }
    }
  }

  for (const post of posts) {
    for (const target of findInternalLinks(post, byPath)) {
      addEdge({ source: post.__noteGraphId, target, type: 'links', origin: 'link' }, 2);
    }
  }

  const eligibleTags = new Map();
  for (const node of nodes) {
    const tags = node.tags.filter(tag => Number(tagConfig[tag] && tagConfig[tag].relation_weight) > 0);
    for (const tag of tags) {
      if (!eligibleTags.has(tag)) eligibleTags.set(tag, []);
      eligibleTags.get(tag).push(node.id);
    }
  }

  const weakCandidates = new Map();
  for (const [tag, ids] of eligibleTags) {
    const weight = Number(tagConfig[tag].relation_weight);
    for (let left = 0; left < ids.length; left += 1) {
      for (let right = left + 1; right < ids.length; right += 1) {
        const key = pairKey(ids[left], ids[right]);
        const candidate = weakCandidates.get(key) || { source: ids[left], target: ids[right], tags: [], score: 0 };
        candidate.tags.push(tag);
        candidate.score += weight;
        weakCandidates.set(key, candidate);
      }
    }
  }

  const minimumSharedTags = Number(weakConfig.minimum_shared_tags || 2);
  const maximumPerNode = Number(weakConfig.maximum_per_node || 2);
  const weakDegree = new Map(nodes.map(node => [node.id, 0]));
  const rankedCandidates = [...weakCandidates.values()]
    .filter(candidate => candidate.tags.length >= minimumSharedTags)
    .sort((left, right) => right.score - left.score || left.source.localeCompare(right.source) || left.target.localeCompare(right.target));
  for (const candidate of rankedCandidates) {
    const key = pairKey(candidate.source, candidate.target);
    if (edgesByPair.has(key)) continue;
    if (weakDegree.get(candidate.source) >= maximumPerNode || weakDegree.get(candidate.target) >= maximumPerNode) continue;
    addEdge({ source: candidate.source, target: candidate.target, type: 'tag', origin: 'tag', tags: candidate.tags.sort() }, 1);
    weakDegree.set(candidate.source, weakDegree.get(candidate.source) + 1);
    weakDegree.set(candidate.target, weakDegree.get(candidate.target) + 1);
  }

  const edges = [...edgesByPair.values()]
    .map(({ priority, ...edge }) => edge)
    .sort((left, right) => left.source.localeCompare(right.source) || left.target.localeCompare(right.target) || left.type.localeCompare(right.type));
  const typeCounts = {};
  for (const edge of edges) typeCounts[edge.type] = (typeCounts[edge.type] || 0) + 1;
  return {
    version: 1,
    nodes: nodes.sort((left, right) => left.id.localeCompare(right.id)),
    edges,
    stats: {
      nodes: nodes.length,
      explicit_nodes: nodes.filter(node => node.explicitId).length,
      edges: edges.length,
      edge_types: typeCounts
    }
  };
}

function localRelations(graph, currentId) {
  const byId = new Map(graph.nodes.map(node => [node.id, node]));
  return graph.edges
    .filter(edge => edge.source === currentId || edge.target === currentId)
    .map(edge => ({ edge, node: byId.get(edge.source === currentId ? edge.target : edge.source) }))
    .filter(item => item.node)
    .sort((left, right) => TYPE_LABELS[left.edge.type].localeCompare(TYPE_LABELS[right.edge.type]) || left.node.title.localeCompare(right.node.title))
    .slice(0, 12);
}

function renderGraphBlock(node, relations) {
  if (!relations.length) return '';
  return `\n<section class="note-relationship-graph" ${MARKER} data-note-graph-id="${htmlEscape(node.id)}" aria-label="笔记关系图谱">\n  <div class="note-relationship-graph__canvas" role="img" aria-label="当前笔记与 ${relations.length} 篇相关笔记的关系图"></div>\n</section>\n`;
}

function refreshGraph() {
  const posts = collectionToArray(hexo.locals.get('posts'));
  cachedGraph = buildGraph(posts);
  return cachedGraph;
}

hexo.extend.filter.register('before_generate', () => {
  refreshGraph();
});

// 主题取得文章 content 的时机早于 before_generate；因此在完整 HTML 已渲染后
// 插入静态关系区块。两套主题的文章页都有 article 容器，Butterfly 的相关推荐
// 位于 article 之后，满足“正文下、相关推荐前”的位置要求。
hexo.extend.filter.register('after_render:html', (html, data) => {
  if (html.includes(MARKER)) return html;
  const graph = cachedGraph || refreshGraph();
  const route = data && data.path ? data.path : '';
  const node = graph.nodes.find(item => pathKey(item.path) === pathKey(route));
  if (!node) return html;
  const block = renderGraphBlock(node, localRelations(graph, node.id));
  if (!block) return html;
  const articleEnd = html.lastIndexOf('</article>');
  if (articleEnd < 0) return html;
  return `${html.slice(0, articleEnd)}${block}${html.slice(articleEnd)}`;
});

hexo.extend.generator.register('note-graph', () => {
  const graph = cachedGraph || refreshGraph();
  return {
    path: 'api/note-graph.json',
    data: JSON.stringify(graph, null, 2)
  };
});
