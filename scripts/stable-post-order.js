/* global hexo */

'use strict';

// Butterfly 的“最新文章”只按 date 排序。先为 site.posts 提供稳定的
// path 次序，保证发布时间相同的批量导入文章不会随异步读取顺序跳动。
const getPosts = hexo.locals.getters.posts;
hexo.locals.set('posts', () => getPosts().sort('-date path'));
