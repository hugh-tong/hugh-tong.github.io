(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var relationLabels = {
    prerequisite: '建议先读', explains: '解释与展开', extends: '进一步扩展', compares: '对比阅读',
    tool: '配套工具', series: '同一系列', links: '文中链接', tag: '共同具体标签'
  };
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function svgElement(name, attributes) {
    var element = document.createElementNS(SVG_NS, name);
    Object.keys(attributes || {}).forEach(function (key) { element.setAttribute(key, attributes[key]); });
    return element;
  }

  function label(value, maximum) {
    return value.length > maximum ? value.slice(0, maximum - 1) + '…' : value;
  }

  function hash(value) {
    var result = 2166136261;
    for (var index = 0; index < value.length; index += 1) result = Math.imul(result ^ value.charCodeAt(index), 16777619);
    return result >>> 0;
  }

  function graphForCurrentNote(graph, currentId) {
    var byId = new Map(graph.nodes.map(function (node) { return [node.id, node]; }));
    var edges = graph.edges
      .filter(function (edge) { return edge.source === currentId || edge.target === currentId; })
      .sort(function (left, right) {
        var leftNode = byId.get(left.source === currentId ? left.target : left.source);
        var rightNode = byId.get(right.source === currentId ? right.target : right.source);
        return relationLabels[left.type].localeCompare(relationLabels[right.type]) || leftNode.title.localeCompare(rightNode.title);
      })
      .slice(0, 12);
    var ids = new Set([currentId]);
    edges.forEach(function (edge) { ids.add(edge.source === currentId ? edge.target : edge.source); });
    return { nodes: graph.nodes.filter(function (node) { return ids.has(node.id); }), edges: edges, currentId: currentId };
  }

  function graphForOverview(graph) {
    // 全局图保留孤立文章：它们是内容维护的有效信号，而不是应被悄悄丢弃的数据。
    return { nodes: graph.nodes, edges: graph.edges, currentId: null };
  }

  function createInteractiveGraph(canvas, graph, options) {
    if (!canvas || !graph.nodes.length || !graph.edges.length) return;
    var width = options.overview ? 1120 : 760;
    var height = options.overview ? 720 : 250;
    var center = { x: width / 2, y: height / 2 };
    var nodeIds = new Set(graph.nodes.map(function (node) { return node.id; }));
    var edges = graph.edges.filter(function (edge) { return nodeIds.has(edge.source) && nodeIds.has(edge.target); });
    var degree = new Map(graph.nodes.map(function (node) { return [node.id, 0]; }));
    edges.forEach(function (edge) {
      degree.set(edge.source, degree.get(edge.source) + 1);
      degree.set(edge.target, degree.get(edge.target) + 1);
    });
    var isolated = graph.nodes.filter(function (node) { return degree.get(node.id) === 0; }).sort(function (left, right) { return left.id.localeCompare(right.id); });
    var isolatedIndex = new Map(isolated.map(function (node, index) { return [node.id, index]; }));
    var outerRingRadius = Math.min(width, height) / 2 - 34;
    var nodeById = new Map();
    var nodes = graph.nodes.map(function (node, index) {
      var angle = (hash(node.id) % 628) / 100;
      var distance = options.overview ? 35 + (hash(node.id + 'radius') % 230) : 10 + index * 2;
      var item = Object.assign({}, node, {
        x: center.x + Math.cos(angle) * distance,
        y: center.y + Math.sin(angle) * distance,
        vx: 0,
        vy: 0,
        pinned: false,
        degree: degree.get(node.id),
        isolated: degree.get(node.id) === 0
      });
      item.radius = node.id === graph.currentId ? 14 : (options.overview ? (item.isolated ? 4.5 : 5 + Math.min(9, Math.sqrt(item.degree) * 2.4)) : 10);
      if (options.overview && item.isolated) {
        var ringAngle = -Math.PI / 2 + Math.PI * 2 * isolatedIndex.get(node.id) / isolated.length;
        item.x = center.x + Math.cos(ringAngle) * outerRingRadius;
        item.y = center.y + Math.sin(ringAngle) * outerRingRadius;
      }
      if (node.id === graph.currentId) { item.x = center.x; item.y = center.y; }
      nodeById.set(item.id, item);
      return item;
    });
    var svg = svgElement('svg', {
      viewBox: '0 0 ' + width + ' ' + height,
      class: 'note-relationship-graph__svg' + (options.overview ? ' note-relationship-graph__svg--overview' : ''),
      role: 'group',
      'aria-label': options.overview ? '全站笔记关系图谱；可拖动节点、拖动画布并使用滚轮缩放。' : '当前笔记与关联笔记的关系图；可拖动节点、拖动画布并使用滚轮缩放。'
    });
    var viewport = svgElement('g', { class: 'note-relationship-graph__viewport' });
    var edgeLayer = svgElement('g', { class: 'note-relationship-graph__edges' });
    var nodeLayer = svgElement('g', { class: 'note-relationship-graph__nodes' });
    viewport.appendChild(edgeLayer);
    viewport.appendChild(nodeLayer);
    svg.appendChild(viewport);

    var edgeElements = [];
    edges.forEach(function (edge) {
      var element = svgElement('line', { class: 'note-relationship-graph__edge', 'data-relation-type': edge.type });
      element.dataset.source = edge.source;
      element.dataset.target = edge.target;
      var edgeTitle = svgElement('title');
      edgeTitle.textContent = relationLabels[edge.type] || edge.type;
      element.appendChild(edgeTitle);
      edgeLayer.appendChild(element);
      edgeElements.push({ edge: edge, element: element });
    });

    var nodeElements = new Map();
    nodes.forEach(function (node) {
      var classes = 'note-relationship-graph__node' + (node.id === graph.currentId ? ' note-relationship-graph__node--current' : '') + (node.isolated && options.overview ? ' note-relationship-graph__node--isolated' : '') + (node.degree >= 3 && options.overview ? ' note-relationship-graph__node--hub' : '');
      var link = svgElement('a', { href: node.path, class: classes, tabindex: '0' });
      link.dataset.nodeId = node.id;
      link.setAttribute('aria-label', node.title);
      var nodeTitle = svgElement('title');
      nodeTitle.textContent = node.title;
      link.appendChild(nodeTitle);
      link.appendChild(svgElement('circle', { r: node.radius }));
      var text = svgElement('text', { 'text-anchor': 'middle' });
      text.textContent = label(node.title, options.overview ? 18 : (node.id === graph.currentId ? 21 : 16));
      link.appendChild(text);
      nodeLayer.appendChild(link);
      nodeElements.set(node.id, link);
    });

    var view = { x: 0, y: 0, scale: 1 };
    var framesRemaining = reducedMotion ? 0 : (options.overview ? 300 : 180);
    var animation = null;
    var drag = null;
    var suppressClick = false;

    function updateViewport() {
      viewport.setAttribute('transform', 'translate(' + view.x.toFixed(2) + ' ' + view.y.toFixed(2) + ') scale(' + view.scale.toFixed(3) + ')');
    }

    function draw() {
      edgeElements.forEach(function (item) {
        var source = nodeById.get(item.edge.source);
        var target = nodeById.get(item.edge.target);
        item.element.setAttribute('x1', source.x.toFixed(2));
        item.element.setAttribute('y1', source.y.toFixed(2));
        item.element.setAttribute('x2', target.x.toFixed(2));
        item.element.setAttribute('y2', target.y.toFixed(2));
      });
      nodes.forEach(function (node) {
        var element = nodeElements.get(node.id);
        element.setAttribute('transform', 'translate(' + node.x.toFixed(2) + ' ' + node.y.toFixed(2) + ')');
        element.querySelector('text').setAttribute('y', node.radius + (node.id === graph.currentId ? 17 : (options.overview ? 15 : 15)));
      });
      updateViewport();
    }

    function simulate() {
      var repulsion = options.overview ? 17000 : 9000;
      var springLength = options.overview ? 92 : 105;
      var coreRadius = Math.min(width, height) * .31;
      for (var left = 0; left < nodes.length; left += 1) {
        for (var right = left + 1; right < nodes.length; right += 1) {
          var one = nodes[left];
          var two = nodes[right];
          if (options.overview && (one.isolated || two.isolated)) continue;
          var dx = two.x - one.x;
          var dy = two.y - one.y;
          var distanceSquared = Math.max(dx * dx + dy * dy, 36);
          var distance = Math.sqrt(distanceSquared);
          var force = repulsion / distanceSquared;
          var fx = force * dx / distance;
          var fy = force * dy / distance;
          if (!one.pinned && one.id !== graph.currentId) { one.vx -= fx; one.vy -= fy; }
          if (!two.pinned && two.id !== graph.currentId) { two.vx += fx; two.vy += fy; }
        }
      }
      edges.forEach(function (edge) {
        var source = nodeById.get(edge.source);
        var target = nodeById.get(edge.target);
        var dx = target.x - source.x;
        var dy = target.y - source.y;
        var distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        var force = (distance - springLength) * .018;
        var fx = force * dx / distance;
        var fy = force * dy / distance;
        if (!source.pinned && source.id !== graph.currentId) { source.vx += fx; source.vy += fy; }
        if (!target.pinned && target.id !== graph.currentId) { target.vx -= fx; target.vy -= fy; }
      });
      nodes.forEach(function (node) {
        if (options.overview && node.isolated) return;
        if (node.id === graph.currentId) {
          node.x += (center.x - node.x) * .24;
          node.y += (center.y - node.y) * .24;
          node.vx = 0;
          node.vy = 0;
          return;
        }
        if (node.pinned) return;
        node.vx += (center.x - node.x) * (options.overview ? .005 : .0026);
        node.vy += (center.y - node.y) * (options.overview ? .005 : .0026);
        node.vx *= .79;
        node.vy *= .79;
        node.x = Math.max(24, Math.min(width - 24, node.x + node.vx));
        node.y = Math.max(24, Math.min(height - 24, node.y + node.vy));
        if (options.overview) {
          var coreDx = node.x - center.x;
          var coreDy = node.y - center.y;
          var coreDistance = Math.sqrt(coreDx * coreDx + coreDy * coreDy);
          if (coreDistance > coreRadius) {
            node.x = center.x + coreDx / coreDistance * coreRadius;
            node.y = center.y + coreDy / coreDistance * coreRadius;
            node.vx *= .3;
            node.vy *= .3;
          }
        }
      });
    }

    function animate() {
      animation = null;
      if (framesRemaining <= 0) {
        svg.classList.remove('is-simulating');
        return;
      }
      simulate();
      draw();
      framesRemaining -= 1;
      animation = window.requestAnimationFrame(animate);
    }

    function wake(frames) {
      if (reducedMotion) return;
      framesRemaining = Math.max(framesRemaining, frames || 100);
      if (!animation) {
        svg.classList.add('is-simulating');
        animation = window.requestAnimationFrame(animate);
      }
    }

    function pointerPosition(event) {
      var box = svg.getBoundingClientRect();
      return { x: (event.clientX - box.left) * width / box.width, y: (event.clientY - box.top) * height / box.height };
    }

    function worldPosition(event) {
      var point = pointerPosition(event);
      return { x: (point.x - view.x) / view.scale, y: (point.y - view.y) / view.scale };
    }

    function setHighlight(nodeId) {
      edgeElements.forEach(function (item) {
        var connected = item.edge.source === nodeId || item.edge.target === nodeId;
        item.element.classList.toggle('is-muted', !connected);
        item.element.classList.toggle('is-highlighted', connected);
      });
      nodeElements.forEach(function (element, id) {
        var connected = id === nodeId || edges.some(function (edge) { return (edge.source === nodeId && edge.target === id) || (edge.target === nodeId && edge.source === id); });
        element.classList.toggle('is-muted', !connected);
        element.classList.toggle('is-highlighted', connected);
      });
    }

    function clearHighlight() {
      edgeElements.forEach(function (item) { item.element.classList.remove('is-muted', 'is-highlighted'); });
      nodeElements.forEach(function (element) { element.classList.remove('is-muted', 'is-highlighted'); });
    }

    svg.addEventListener('pointerdown', function (event) {
      var nodeLink = event.target.closest('.note-relationship-graph__node');
      var point = pointerPosition(event);
      drag = nodeLink ? { kind: 'node', id: nodeLink.dataset.nodeId, start: point, moved: false } : { kind: 'pan', start: point, x: view.x, y: view.y, moved: false };
      svg.setPointerCapture(event.pointerId);
      svg.classList.add(drag.kind === 'node' ? 'is-dragging' : 'is-panning');
    });
    svg.addEventListener('pointermove', function (event) {
      if (!drag) return;
      var point = pointerPosition(event);
      drag.moved = drag.moved || Math.hypot(point.x - drag.start.x, point.y - drag.start.y) > 4;
      if (drag.kind === 'node') {
        var node = nodeById.get(drag.id);
        var world = worldPosition(event);
        node.pinned = true;
        node.x = Math.max(20, Math.min(width - 20, world.x));
        node.y = Math.max(20, Math.min(height - 20, world.y));
        node.vx = 0;
        node.vy = 0;
        draw();
      } else {
        view.x = drag.x + point.x - drag.start.x;
        view.y = drag.y + point.y - drag.start.y;
        updateViewport();
      }
    });
    function finishPointer(event) {
      if (!drag) return;
      if (drag.kind === 'node') {
        nodeById.get(drag.id).pinned = false;
        if (drag.moved) { suppressClick = true; wake(110); }
      }
      svg.classList.remove('is-dragging', 'is-panning');
      if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
      drag = null;
    }
    svg.addEventListener('pointerup', finishPointer);
    svg.addEventListener('pointercancel', finishPointer);
    svg.addEventListener('click', function (event) {
      if (suppressClick) {
        event.preventDefault();
        suppressClick = false;
      }
    });
    svg.addEventListener('wheel', function (event) {
      event.preventDefault();
      var point = pointerPosition(event);
      var before = { x: (point.x - view.x) / view.scale, y: (point.y - view.y) / view.scale };
      var factor = event.deltaY < 0 ? 1.12 : .89;
      view.scale = Math.max(.55, Math.min(2.6, view.scale * factor));
      view.x = point.x - before.x * view.scale;
      view.y = point.y - before.y * view.scale;
      updateViewport();
    }, { passive: false });
    svg.addEventListener('pointerover', function (event) {
      var nodeLink = event.target.closest('.note-relationship-graph__node');
      if (nodeLink) setHighlight(nodeLink.dataset.nodeId);
    });
    svg.addEventListener('pointerout', function (event) {
      var previousNode = event.target.closest('.note-relationship-graph__node');
      var nextNode = event.relatedTarget && event.relatedTarget.closest ? event.relatedTarget.closest('.note-relationship-graph__node') : null;
      if (previousNode && previousNode !== nextNode) clearHighlight();
    });
    svg.addEventListener('pointerleave', clearHighlight);

    canvas.replaceChildren(svg);
    canvas.closest('.note-relationship-graph, .note-graph-explorer').classList.add('is-ready');
    draw();
    if (framesRemaining) {
      svg.classList.add('is-simulating');
      animation = window.requestAnimationFrame(animate);
    }
  }

  function renderLocal(section, graph) {
    var currentId = section.getAttribute('data-note-graph-id');
    if (!graph.nodes.some(function (node) { return node.id === currentId; })) return;
    createInteractiveGraph(section.querySelector('.note-relationship-graph__canvas'), graphForCurrentNote(graph, currentId), { overview: false });
  }

  function renderOverview(section, graph) {
    createInteractiveGraph(section.querySelector('.note-relationship-graph__canvas'), graphForOverview(graph), { overview: true });
  }

  function start() {
    var localSections = Array.prototype.slice.call(document.querySelectorAll('[data-note-relationship-graph="true"]'));
    var overviewSections = Array.prototype.slice.call(document.querySelectorAll('[data-note-graph-overview="true"]'));
    if (!localSections.length && !overviewSections.length) return;
    fetch('/api/note-graph.json', { cache: 'force-cache' })
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(function (graph) {
        if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) return;
        localSections.forEach(function (section) { renderLocal(section, graph); });
        overviewSections.forEach(function (section) { renderOverview(section, graph); });
      })
      .catch(function () { /* 图谱是渐进增强层；页面主体仍可正常阅读。 */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}());
