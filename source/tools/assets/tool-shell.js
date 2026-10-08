(() => {
  "use strict";

  const root = document.querySelector("[data-tool-shell-root]");
  if (!root) return;

  const nav = document.createElement("nav");
  nav.className = "tool-shell-nav";
  nav.setAttribute("aria-label", "工具站点导航");
  nav.innerHTML = [
    '<a class="tool-shell-nav__link" href="/tools/">← 工具箱</a>',
    '<span class="tool-shell-nav__separator" aria-hidden="true"></span>',
    '<a class="tool-shell-nav__link" href="/">博客首页</a>'
  ].join("");
  root.prepend(nav);
  root.dataset.toolShellReady = "true";

  window.ToolShell = Object.freeze({
    reportError(message) {
      const banner = document.createElement("div");
      banner.className = "tool-shell-runtime-error";
      banner.setAttribute("role", "alert");
      banner.textContent = message;
      nav.insertAdjacentElement("afterend", banner);
    }
  });
})();
