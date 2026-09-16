(function () {
  'use strict';

  var metaUrl = '/deploy-meta.json';
  var widgetId = 'site-deploy-age';

  function formatElapsed(milliseconds) {
    var minutes = Math.floor(milliseconds / 60000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return minutes + ' 分钟前';
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + ' 小时 ' + (minutes % 60) + ' 分钟前';
    var days = Math.floor(hours / 24);
    return days + ' 天 ' + (hours % 24) + ' 小时前';
  }

  function render(meta) {
    var old = document.getElementById(widgetId);
    if (old) old.remove();

    var wrapper = document.createElement('div');
    wrapper.className = 'site-deploy-age-wrap';

    var handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'site-deploy-age__handle';
    handle.setAttribute('aria-label', '显示网站部署状态');
    handle.setAttribute('title', '显示网站部署状态');
    wrapper.appendChild(handle);

    var box = document.createElement('aside');
    box.id = widgetId;
    box.className = 'site-deploy-age';
    box.setAttribute('aria-label', '网站部署状态');
    wrapper.appendChild(box);

    var title = document.createElement('div');
    title.className = 'site-deploy-age__title';
    title.textContent = '本站部署状态';
    box.appendChild(title);

    var detail = document.createElement('div');
    detail.className = 'site-deploy-age__detail';
    box.appendChild(detail);

    if (!meta || !meta.deployedAt) {
      detail.textContent = '等待下一次 GitHub Actions 发布写入时间';
      document.body.appendChild(wrapper);
      scheduleHide(wrapper);
      return;
    }

    var deployedAt = new Date(meta.deployedAt);
    if (Number.isNaN(deployedAt.getTime())) {
      detail.textContent = '部署时间格式无效';
      document.body.appendChild(wrapper);
      scheduleHide(wrapper);
      return;
    }

    var timestamp = document.createElement('time');
    timestamp.dateTime = deployedAt.toISOString();
    timestamp.textContent = '上次部署：' + deployedAt.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
    detail.appendChild(timestamp);

    var age = document.createElement('span');
    age.className = 'site-deploy-age__elapsed';
    detail.appendChild(document.createTextNode(' · '));
    detail.appendChild(age);

    function updateAge() {
      age.textContent = '已过去 ' + formatElapsed(Date.now() - deployedAt.getTime());
    }
    updateAge();
    window.setInterval(updateAge, 60000);
    document.body.appendChild(wrapper);
    scheduleHide(wrapper);

    function scheduleHide(target) {
      var hideTimer;
      function hide() {
        target.classList.add('is-hidden');
      }
      function show() {
        window.clearTimeout(hideTimer);
        target.classList.remove('is-hidden');
        hideTimer = window.setTimeout(hide, 12000);
      }
      wrapper.addEventListener('mouseenter', show);
      wrapper.addEventListener('mouseleave', function () {
        window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(hide, 2500);
      });
      handle.addEventListener('click', function () {
        if (target.classList.contains('is-hidden')) show();
        else hide();
      });
      hideTimer = window.setTimeout(hide, 12000);
    }
  }

  function start() {
    window.fetch(metaUrl, { cache: 'no-store' })
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(render)
      .catch(function () { render(null); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
}());
