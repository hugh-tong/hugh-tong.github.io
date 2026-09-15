// 全站 MathJax 补丁:主题的 math 加载器只覆盖 post/page 类型,
// 首页、分类页、标签页、归档页的摘要里 $...$ 会以源码露出。
// 本脚本在非 post/page 页面复刻主题的 MathJax 加载逻辑(同版本、同配置)。
// 注意:列表页没有 #article-container 容器,直接 typeset 整个 body。
;(() => {
  const cfg = window.GLOBAL_CONFIG_SITE || {}
  if (cfg.pageType === 'post' || cfg.pageType === 'page') return

  const load = () => {
    if (!window.MathJax) {
      window.MathJax = {
        loader: { load: ['[tex]/mhchem', 'ui/lazy'] },
        output: { font: 'mathjax-newcm' },
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          tags: 'none',
          packages: { '[+]': ['mhchem'] }
        },
        chtml: { scale: 1.1 },
        options: { lazyMargin: '200px', enableMenu: true }
      }
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/mathjax@4.1.3/tex-mml-chtml.min.js'
      s.id = 'MathJax-script'
      s.async = true
      document.head.appendChild(s)
    } else {
      MathJax.typesetClear()
      MathJax.typesetPromise([document.body])
    }
  }

  window.pjax ? load() : window.addEventListener('load', load)
})()
