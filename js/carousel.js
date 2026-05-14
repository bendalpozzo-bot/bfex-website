(function () {
  'use strict';

  var INTERVAL = 5000;
  var FADE_MS  = 700;

  async function init() {
    var config;
    try {
      config = await fetch('images/media-config.json?t=' + Date.now()).then(function (r) { return r.json(); });
    } catch (e) { return; }
    document.querySelectorAll('[data-slot]').forEach(function (el) { setup(config, el); });
  }

  function setup(config, el) {
    var key   = el.dataset.slot;
    var files = config[key];
    if (!files || files.length < 2) return;

    var cs = getComputedStyle(el);
    if (cs.position === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden';

    function mkLayer(src, opacity) {
      var d = document.createElement('div');
      d.style.cssText =
        'position:absolute;inset:0;background-size:cover;background-position:center;' +
        'transition:opacity ' + FADE_MS + 'ms ease;z-index:0;pointer-events:none;' +
        "background-image:url('images/" + src + "');opacity:" + opacity;
      return d;
    }

    var layA = mkLayer(files[0], 1);
    var layB = mkLayer(files[1], 0);
    el.insertBefore(layB, el.firstChild);
    el.insertBefore(layA, el.firstChild);

    Array.from(el.children).forEach(function (c) {
      if (c !== layA && c !== layB) {
        if (!c.style.position) c.style.position = 'relative';
        if (!c.style.zIndex)   c.style.zIndex   = '1';
      }
    });

    el.style.backgroundImage = 'none';

    var dots = mkDots(el, files.length);
    var cur  = 0;
    var useA = true;

    function show(idx) {
      var f = files[idx];
      if (useA) {
        layB.style.backgroundImage = "url('images/" + f + "')";
        layB.style.opacity = '1';
        layA.style.opacity = '0';
      } else {
        layA.style.backgroundImage = "url('images/" + f + "')";
        layA.style.opacity = '1';
        layB.style.opacity = '0';
      }
      useA = !useA;
      updateDots(dots, idx);
    }

    var timer = setInterval(function () {
      cur = (cur + 1) % files.length;
      show(cur);
    }, INTERVAL);

    var arrows = mkArrows(el);
    arrows[0].onclick = function (e) {
      e.stopPropagation();
      clearInterval(timer);
      cur = (cur - 1 + files.length) % files.length;
      show(cur);
    };
    arrows[1].onclick = function (e) {
      e.stopPropagation();
      clearInterval(timer);
      cur = (cur + 1) % files.length;
      show(cur);
    };
  }

  function mkDots(el, count) {
    var wrap = document.createElement('div');
    wrap.style.cssText =
      'position:absolute;bottom:10px;left:50%;transform:translateX(-50%);' +
      'display:flex;gap:6px;z-index:2;pointer-events:none';
    for (var i = 0; i < count; i++) {
      var d = document.createElement('span');
      d.style.cssText =
        'width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,' +
        (i === 0 ? '0.95' : '0.35') + ');transition:background 0.3s';
      wrap.appendChild(d);
    }
    el.appendChild(wrap);
    return wrap;
  }

  function updateDots(wrap, idx) {
    if (!wrap) return;
    Array.from(wrap.children).forEach(function (d, i) {
      d.style.background = 'rgba(255,255,255,' + (i === idx ? '0.95' : '0.35') + ')';
    });
  }

  function mkArrows(el) {
    var base =
      'position:absolute;top:50%;transform:translateY(-50%);z-index:2;' +
      'background:rgba(0,0,0,0.4);border:none;color:#fff;width:34px;height:34px;' +
      'border-radius:50%;cursor:pointer;font-size:20px;line-height:1;' +
      'display:flex;align-items:center;justify-content:center;' +
      'opacity:0;transition:opacity 0.2s';
    var prev = document.createElement('button');
    prev.innerHTML = '&#8249;';
    prev.style.cssText = base + ';left:10px';
    var next = document.createElement('button');
    next.innerHTML = '&#8250;';
    next.style.cssText = base + ';right:10px';
    el.appendChild(prev);
    el.appendChild(next);
    el.addEventListener('mouseenter', function () { prev.style.opacity = '1'; next.style.opacity = '1'; });
    el.addEventListener('mouseleave', function () { prev.style.opacity = '0'; next.style.opacity = '0'; });
    return [prev, next];
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
