/* ============================================================
   STACKSOL TECHNOLOGIES — Motion & Interaction Engine
   Loader, page transitions, smooth scroll, split text, cursor,
   magnetic/tilt/spotlight, hero particle globe, pinned scroll,
   counters, marquee, filters, forms.
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  var lenis = null;
  var PHONE = '919319596653';
  var EMAIL = 'dhruv.sandilya2005@gmail.com';

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.error(e); } }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------- Split text ---------- */
  function splitNode(node, mode, counter) {
    var kids = Array.prototype.slice.call(node.childNodes);
    kids.forEach(function (child) {
      if (child.nodeType === 3) {
        var parts = child.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span');
          w.className = 'w';
          if (mode === 'chars') {
            Array.prototype.forEach.call(p, function (ch) {
              var c = document.createElement('span');
              c.className = 'c';
              c.style.setProperty('--i', counter.n++);
              c.textContent = ch;
              w.appendChild(c);
            });
          } else {
            var i = document.createElement('span');
            i.className = 'w__i';
            i.style.setProperty('--i', counter.n++);
            i.textContent = p;
            w.appendChild(i);
          }
          frag.appendChild(w);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1 && child.tagName !== 'BR') {
        splitNode(child, mode, counter);
      }
    });
  }
  function splitAll(scope) {
    $$('[data-split]', scope).forEach(function (el) {
      if (el.dataset.splitDone) return;
      el.dataset.splitDone = '1';
      el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      splitNode(el, el.dataset.split === 'chars' ? 'chars' : 'words', { n: 0 });
      $$('.w', el).forEach(function (w) { w.setAttribute('aria-hidden', 'true'); });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var io;
  function initReveals() {
    $$('[data-stagger]').forEach(function (p) {
      var step = parseInt(p.dataset.stagger, 10) || 90;
      $$('[data-reveal]', p).forEach(function (el, i) { el.style.setProperty('--d', (i * step) + 'ms'); });
    });
    var targets = $$('[data-split], [data-reveal], .process, .tl__item, [data-count]');
    if (!('IntersectionObserver' in window) || reduce) {
      targets.forEach(function (el) { el.classList.add('in'); if (el.dataset.count) countUp(el); });
      return;
    }
    // Chrome clips the intersection rect by the target's own clip-path, so
    // clip-revealed elements are observed through their parent instead.
    var proxies = new Map();
    function show(el) {
      el.classList.add('in');
      if (el.dataset.count) countUp(el);
    }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var list = proxies.get(e.target);
        if (list) list.forEach(show);
        if (!list || targets.indexOf(e.target) > -1) show(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) {
      if (el.dataset.reveal === 'clip' && el.parentElement) {
        var p = el.parentElement;
        if (!proxies.has(p)) proxies.set(p, []);
        proxies.get(p).push(el);
        io.observe(p);
      } else io.observe(el);
    });
  }

  /* ---------- Counters ---------- */
  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    var target = parseFloat(el.dataset.count);
    var dec = (el.dataset.count.split('.')[1] || '').length;
    if (reduce) { el.textContent = target.toFixed(dec); return; }
    var dur = 2200, start = null;
    function tick(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = (target * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Loader + intro ---------- */
  function initLoader(done) {
    var loader = $('.loader');
    var pt = $('.pt');
    var first = root.classList.contains('first');
    try { sessionStorage.setItem('ss-visited', '1'); } catch (e) {}

    if (!loader || !first || reduce) {
      if (loader) loader.classList.add('gone');
      if (pt) requestAnimationFrame(function () { requestAnimationFrame(function () { pt.classList.add('is-open'); }); });
      setTimeout(done, reduce ? 0 : 350);
      return;
    }
    if (pt) pt.classList.add('is-open');
    var num = $('.loader__count', loader);
    var bar = $('.loader__bar i', loader);
    var dur = 1900, start = null;
    function tick(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      var v = Math.round(e * 100);
      if (num) num.textContent = v;
      if (bar) bar.style.transform = 'scaleX(' + e + ')';
      if (p < 1) requestAnimationFrame(tick);
      else {
        setTimeout(function () {
          loader.classList.add('done');
          setTimeout(done, 350);
          setTimeout(function () { loader.classList.add('gone'); }, 1300);
        }, 200);
      }
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Page transitions ---------- */
  function initTransitions() {
    var pt = $('.pt');
    if (!pt) return;
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      var href = a.getAttribute('href');
      if (!href || /^(mailto:|tel:|https?:|\/\/|javascript:)/i.test(href)) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      var samePage = url.pathname === location.pathname || (href.charAt(0) === '#');
      if (samePage && url.hash) {
        var target = document.getElementById(url.hash.slice(1));
        if (target) {
          e.preventDefault();
          closeMenu();
          if (lenis) lenis.scrollTo(target, { offset: -90, duration: 1.6 });
          else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
          history.replaceState(null, '', url.hash);
        }
        return;
      }
      if (samePage && !url.hash) { e.preventDefault(); closeMenu(); return; }
      e.preventDefault();
      closeMenu();
      pt.classList.remove('is-open');
      pt.classList.add('is-leaving');
      setTimeout(function () { location.href = url.href; }, reduce ? 0 : 1000);
    });
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) { pt.classList.remove('is-leaving'); pt.classList.add('is-open'); }
    });
  }

  /* ---------- Smooth scroll ---------- */
  function initLenis() {
    if (reduce || !window.Lenis) return;
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 });
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
    if (location.hash) {
      var t = document.getElementById(location.hash.slice(1));
      if (t) setTimeout(function () { lenis.scrollTo(t, { offset: -90, immediate: true }); }, 60);
    }
  }

  /* ---------- Header, progress, menu ---------- */
  function initHeader() {
    var hdr = $('.hdr');
    var bar = $('.progress i');
    var last = 0;
    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (hdr) {
        hdr.classList.toggle('scrolled', y > 30);
        var hide = y > 500 && y > last + 2 && !document.body.classList.contains('menu-open');
        if (y < last - 2 || y < 500) hdr.classList.remove('hide');
        else if (hide) hdr.classList.add('hide');
      }
      if (bar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
      }
      last = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var page = document.body.dataset.page;
    $$('[data-nav]').forEach(function (a) { if (a.dataset.nav === page) a.classList.add('active'); });
    $$('.menu__links a').forEach(function (a, i) { a.style.setProperty('--i', i); });

    var burger = $('.burger');
    if (burger) burger.addEventListener('click', function () {
      var open = !document.body.classList.contains('menu-open');
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open);
      if (lenis) open ? lenis.stop() : lenis.start();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }
  function closeMenu() {
    if (!document.body.classList.contains('menu-open')) return;
    document.body.classList.remove('menu-open');
    var b = $('.burger'); if (b) b.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
  }

  /* ---------- Cursor ---------- */
  function initCursor() {
    if (!fine || reduce) return;
    var ring = $('.cursor'), dot = $('.cursor-dot');
    if (!ring || !dot) return;
    var label = $('.cursor__label', ring);
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    }, { passive: true });
    (function loop() {
      rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      var lab = e.target.closest('[data-cursor]');
      if (lab) {
        ring.classList.add('is-label'); ring.classList.remove('is-hover');
        if (label) label.textContent = lab.dataset.cursor;
        dot.classList.add('is-hidden');
        return;
      }
      ring.classList.remove('is-label'); dot.classList.remove('is-hidden');
      ring.classList.toggle('is-hover', !!e.target.closest('a, button, input, select, textarea, label, .cat'));
    });
    document.addEventListener('mouseleave', function () { ring.classList.add('is-hidden'); dot.classList.add('is-hidden'); });
    document.addEventListener('mouseenter', function () { ring.classList.remove('is-hidden'); dot.classList.remove('is-hidden'); });
  }

  /* ---------- Magnetic / tilt / spotlight ---------- */
  function initPointerFX() {
    if (!fine || reduce) return;
    $$('[data-magnetic]').forEach(function (el) {
      var strength = parseFloat(el.dataset.magnetic) || 0.35;
      el.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transition = 'transform .15s linear';
        el.style.transform = 'translate(' + x * strength + 'px,' + y * strength + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform .8s cubic-bezier(.22,1,.36,1)';
        el.style.transform = '';
      });
    });
    $$('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.dataset.tilt) || 7;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = 'transform .1s linear, border-color .5s';
        el.style.transform = 'perspective(1000px) rotateX(' + (-py * max) + 'deg) rotateY(' + (px * max) + 'deg) translateZ(0)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform .9s cubic-bezier(.22,1,.36,1), border-color .5s';
        el.style.transform = '';
      });
    });
    document.addEventListener('mousemove', function (e) {
      var c = e.target.closest && e.target.closest('.card, .sol');
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------- Hero particle globe ---------- */
  function initGlobe() {
    var wrap = $('.hero__canvas');
    if (!wrap) return;
    var cv = $('canvas', wrap), ctx = cv.getContext('2d');
    var W, H, dpr, cx, cy, R, pts = [], ring = [];
    var ay = 0, ax = 0.35, tax = 0.35, tay = 0, time = 0;
    var mouse = { x: -9999, y: -9999 }, visible = true, scrollP = 0;

    function build() {
      var N = innerWidth < 700 ? 650 : 1400;
      pts = [];
      var phi = Math.PI * (3 - Math.sqrt(5));
      for (var i = 0; i < N; i++) {
        var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = phi * i;
        pts.push({ x: Math.cos(th) * r, y: y, z: Math.sin(th) * r, ox: 0, oy: 0 });
      }
      ring = [];
      for (var j = 0; j < 180; j++) ring.push(j / 180 * Math.PI * 2);
    }
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth; H = wrap.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var wide = W > 960;
      cx = wide ? W * 0.74 : W * 0.5;
      cy = wide ? H * 0.44 : H * 0.3;
      R = wide ? Math.min(W * 0.26, H * 0.34) : Math.min(W * 0.46, H * 0.26);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      time += 0.01;
      ay += 0.0022; tay = lerp(tay, 0, 0.02);
      ax = lerp(ax, tax, 0.04);
      var sx = Math.sin(ax), cxA = Math.cos(ax), sy = Math.sin(ay + tay), cyA = Math.cos(ay + tay);
      var spread = 1 + scrollP * 0.9, fade = 1 - scrollP * 0.85;
      var rad = R * spread, fov = 2.6;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var wob = 1 + Math.sin(time * 2 + p.y * 5 + p.x * 3) * 0.035;
        var x = p.x * wob, y = p.y * wob, z = p.z * wob;
        var x1 = x * cyA - z * sy, z1 = x * sy + z * cyA;
        var y1 = y * cxA - z1 * sx, z2 = y * sx + z1 * cxA;
        var s = fov / (fov + z2);
        var px = cx + x1 * rad * s, py = cy + y1 * rad * s;
        var dx = px - mouse.x, dy = py - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 16000) { var f = (1 - d2 / 16000) * 28; var d = Math.sqrt(d2) || 1; p.ox = lerp(p.ox, dx / d * f, 0.2); p.oy = lerp(p.oy, dy / d * f, 0.2); }
        else { p.ox = lerp(p.ox, 0, 0.06); p.oy = lerp(p.oy, 0, 0.06); }
        px += p.ox; py += p.oy;
        var depth = (1 - z2) / 2;
        var a = (0.12 + depth * 0.85) * fade;
        var t = (x1 + 1) / 2;
        var rC = Math.round(lerp(78, 79, t)), gC = Math.round(lerp(224, 124, t)), bC = Math.round(lerp(194, 255, t));
        ctx.fillStyle = 'rgba(' + rC + ',' + gC + ',' + bC + ',' + a.toFixed(3) + ')';
        var sz = (0.45 + depth * 1.15) * s;
        ctx.beginPath(); ctx.arc(px, py, sz, 0, 6.2832); ctx.fill();
      }
      // orbit rings
      for (var k = 0; k < 2; k++) {
        var tilt = k ? 1.15 : 1.35, rr = rad * (k ? 1.55 : 1.32), spd = k ? -0.6 : 0.4;
        for (var m = 0; m < ring.length; m++) {
          var ang = ring[m] + time * spd;
          var ox = Math.cos(ang), oz = Math.sin(ang);
          var oy = oz * Math.cos(tilt), oz2 = oz * Math.sin(tilt);
          var ox1 = ox * cyA - oz2 * sy * 0.3;
          var s2 = fov / (fov + oz2 * 0.8);
          var qx = cx + ox1 * rr * s2, qy = cy + oy * rr * s2 * 0.35 + (k ? 10 : -10);
          var al = ((1 - oz2) / 2 * 0.5 + 0.05) * fade;
          ctx.fillStyle = 'rgba(238,241,246,' + al.toFixed(3) + ')';
          ctx.fillRect(qx, qy, m % 15 === 0 ? 2.4 : 1, m % 15 === 0 ? 2.4 : 1);
        }
      }
    }
    function loop() {
      if (visible && !document.hidden) draw();
      if (!reduce) requestAnimationFrame(loop);
    }
    build(); size();
    window.addEventListener('resize', function () { size(); });
    var hero = wrap.parentElement;
    hero.addEventListener('mousemove', function (e) {
      var r = cv.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      tax = 0.35 + (e.clientY / innerHeight - 0.5) * 0.6;
      tay = (e.clientX / innerWidth - 0.5) * 0.6;
    });
    hero.addEventListener('mouseleave', function () { mouse.x = mouse.y = -9999; });
    window.addEventListener('scroll', function () { scrollP = clamp(window.scrollY / (innerHeight * 0.9), 0, 1); }, { passive: true });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(wrap);
    if (reduce) draw(); else loop();
  }

  /* ---------- Marquee ---------- */
  function initMarquees() {
    $$('[data-marquee]').forEach(function (mq) {
      var track = $('.marquee__track', mq);
      var group = $('.marquee__group', mq);
      if (!track || !group || reduce) return;
      var copies = Math.max(2, Math.ceil((innerWidth * 2) / group.offsetWidth));
      for (var i = 1; i < copies; i++) { var c = group.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); }
      var base = parseFloat(mq.dataset.marquee) || 0.6;
      var dir = mq.dataset.dir === 'right' ? -1 : 1;
      var x = 0, boost = 0, lastY = window.scrollY, gw = group.offsetWidth;
      window.addEventListener('resize', function () { gw = group.offsetWidth; });
      window.addEventListener('scroll', function () {
        var y = window.scrollY, d = y - lastY; lastY = y;
        boost = clamp(boost + Math.abs(d) * 0.08, 0, 14);
        if (Math.abs(d) > 1) dir = (d > 0 ? 1 : -1) * (mq.dataset.dir === 'right' ? -1 : 1);
      }, { passive: true });
      (function loop() {
        boost = lerp(boost, 0, 0.05);
        x -= (base + boost) * dir;
        if (x <= -gw) x += gw;
        if (x > 0) x -= gw;
        track.style.transform = 'translate3d(' + x + 'px,0,0)';
        requestAnimationFrame(loop);
      })();
    });
  }

  /* ---------- GSAP scroll scenes ---------- */
  function initScenes() {
    if (!hasGSAP || reduce) {
      $$('.tl__line i').forEach(function (i) { i.style.transform = 'none'; });
      return;
    }
    var mm = gsap.matchMedia();

    // Text fill
    $$('[data-fill]').forEach(function (el) {
      splitFill(el);
      el.classList.add('has-fill');
      gsap.to($$('.fw', el), {
        opacity: 1, stagger: 0.08, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: 0.6 }
      });
    });

    // Parallax
    $$('[data-speed]').forEach(function (el) {
      var s = parseFloat(el.dataset.speed);
      gsap.fromTo(el, { y: -s * 60 }, { y: s * 60, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Horizontal pinned solutions
    mm.add('(min-width: 961px)', function () {
      var sec = $('.hscroll');
      if (!sec) return;
      var track = $('.hscroll__track', sec), prog = $('.hscroll__prog i', sec);
      sec.classList.add('is-pinned');
      var dist = function () { return Math.max(0, track.scrollWidth - innerWidth); };
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: sec, start: 'top top', end: function () { return '+=' + dist(); },
          pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (self) { if (prog) prog.style.transform = 'scaleX(' + self.progress + ')'; }
        }
      });
      $$('.sol', track).forEach(function (card) {
        gsap.from(card, { rotate: 4, y: 60, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 100%', end: 'left 60%', scrub: true } });
      });
      return function () { sec.classList.remove('is-pinned'); gsap.set(track, { clearProps: 'all' }); };
    });

    // Stacked cards
    mm.add('(min-width: 961px)', function () {
      var cards = $$('.scard');
      cards.forEach(function (c, i) {
        if (i === cards.length - 1) return;
        gsap.to(c, {
          scale: 0.9, filter: 'brightness(0.45)', ease: 'none',
          scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 20%', scrub: true }
        });
      });
    });

    // Timeline progress
    $$('.tl').forEach(function (tl) {
      var line = $('.tl__line i', tl);
      if (line) gsap.to(line, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 65%', end: 'bottom 65%', scrub: true } });
    });

    // Hero title drifts on scroll
    var ht = $('.hero__title');
    if (ht) gsap.to(ht, { yPercent: -18, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // Visual scale-in
    $$('[data-zoom]').forEach(function (el) {
      gsap.fromTo(el, { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  function splitFill(el) {
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var s = document.createElement('span'); s.className = 'fw'; s.textContent = p; frag.appendChild(s);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) walk(ch);
      });
    }
    walk(el);
  }

  /* ---------- Testimonials ---------- */
  function initTestimonials() {
    var wrap = $('.testi');
    if (!wrap) return;
    var items = $$('.testi__item', wrap), bar = $('.testi__bar', wrap), count = $('.testi__count', wrap);
    if (!items.length) return;
    items.forEach(function (it) { var q = $('.testi__q', it); if (q) splitNode(q, 'words', { n: 0 }); });
    var idx = 0, timer;
    function go(n) {
      items[idx].classList.remove('active');
      idx = (n + items.length) % items.length;
      items[idx].classList.add('active');
      if (count) count.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0');
      if (bar) { bar.classList.remove('run'); void bar.offsetWidth; bar.classList.add('run'); }
      clearTimeout(timer);
      if (!reduce) timer = setTimeout(function () { go(idx + 1); }, 7000);
    }
    var prev = $('[data-prev]', wrap), next = $('[data-next]', wrap);
    if (prev) prev.addEventListener('click', function () { go(idx - 1); });
    if (next) next.addEventListener('click', function () { go(idx + 1); });
    go(0);
  }

  /* ---------- FAQ ---------- */
  function initFAQ() {
    $$('.faq__q').forEach(function (q) {
      q.addEventListener('click', function () {
        var item = q.closest('.faq__item');
        var open = !item.classList.contains('open');
        $$('.faq__item.open', item.parentElement).forEach(function (o) { o.classList.remove('open'); $('.faq__q', o).setAttribute('aria-expanded', 'false'); });
        item.classList.toggle('open', open);
        q.setAttribute('aria-expanded', open);
        if (hasGSAP) setTimeout(function () { ScrollTrigger.refresh(); }, 650);
      });
    });
  }

  /* ---------- Portfolio filter (FLIP) ---------- */
  function initFilters() {
    var btns = $$('.filter');
    var works = $$('.work');
    if (!btns.length || !works.length) return;
    btns.forEach(function (b) {
      var f = b.dataset.filter;
      var n = f === 'all' ? works.length : works.filter(function (w) { return w.dataset.cats.split(' ').indexOf(f) > -1; }).length;
      var sup = document.createElement('sup'); sup.textContent = String(n).padStart(2, '0'); b.appendChild(sup);
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b); });
        var first = new Map();
        works.forEach(function (w) { if (!w.classList.contains('hidden')) first.set(w, w.getBoundingClientRect()); });
        works.forEach(function (w) {
          var show = f === 'all' || w.dataset.cats.split(' ').indexOf(f) > -1;
          w.classList.toggle('hidden', !show);
          w.classList.add('in');
        });
        if (reduce || !Element.prototype.animate) return;
        works.forEach(function (w, i) {
          if (w.classList.contains('hidden')) return;
          var last = w.getBoundingClientRect();
          var f0 = first.get(w);
          if (f0) {
            var dx = f0.left - last.left, dy = f0.top - last.top;
            w.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 800, easing: 'cubic-bezier(.22,1,.36,1)' });
          } else {
            w.animate([{ opacity: 0, transform: 'translateY(40px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: i * 40, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
          }
        });
        if (hasGSAP) setTimeout(function () { ScrollTrigger.refresh(); }, 850);
      });
    });
  }

  /* ---------- Forms ---------- */
  function toast(msg) {
    var t = $('.toast');
    if (!t) {
      t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status');
      t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span></span>';
      document.body.appendChild(t);
    }
    $('span', t).textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 5000);
  }
  function validate(form) {
    var ok = true;
    $$('[required]', form).forEach(function (inp) {
      var field = inp.closest('.field');
      var bad = !inp.value.trim() ||
        (inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value)) ||
        (inp.type === 'tel' && inp.value.replace(/\D/g, '').length < 10);
      if (field) field.classList.toggle('error', bad);
      if (bad && ok) { inp.focus(); ok = false; }
    });
    return ok;
  }
  function collect(form) {
    var lines = [];
    $$('[name]', form).forEach(function (el) {
      if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return;
      if (!el.value.trim() || el.type === 'hidden' && el.name === '_via') return;
      lines.push((el.dataset.label || el.name) + ': ' + el.value.trim());
    });
    return lines.join('\n');
  }
  function initForms() {
    $$('.field select').forEach(function (s) {
      var set = function () { s.classList.toggle('has-value', !!s.value); };
      s.addEventListener('change', set); set();
    });
    $$('.field input, .field textarea, .field select').forEach(function (inp) {
      inp.addEventListener('input', function () { var f = inp.closest('.field'); if (f) f.classList.remove('error'); });
    });

    // Order categories
    var cats = $$('.cat');
    var catField = $('#products');
    function syncCats() {
      if (!catField) return;
      catField.value = cats.filter(function (c) { return c.classList.contains('selected'); }).map(function (c) { return c.dataset.cat; }).join(', ');
      catField.dispatchEvent(new Event('input'));
    }
    cats.forEach(function (c) {
      c.addEventListener('click', function () {
        c.classList.toggle('selected');
        c.setAttribute('aria-pressed', c.classList.contains('selected'));
        syncCats();
      });
    });
    var q = new URLSearchParams(location.search).get('product');
    if (q) cats.forEach(function (c) { if (c.dataset.cat.toLowerCase() === q.toLowerCase()) { c.classList.add('selected'); c.setAttribute('aria-pressed', 'true'); } });
    syncCats();

    $$('form[data-form]').forEach(function (form) {
      var via = 'email';
      $$('[data-via]', form).forEach(function (b) { b.addEventListener('click', function () { via = b.dataset.via; }); });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate(form)) return;
        var kind = form.dataset.form;
        var subject = kind === 'quote' ? 'Quote request — Stacksol Technologies' : 'Website enquiry — Stacksol Technologies';
        var sub = $('[name="Subject"]:checked', form) || $('select[name="Subject"]', form);
        if (sub && sub.value) subject = sub.value + ' — Stacksol Technologies';
        var body = collect(form);
        if (via === 'whatsapp') {
          window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(subject + '\n\n' + body), '_blank', 'noopener');
          toast('Opening WhatsApp with your request pre-filled.');
        } else {
          location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
          toast('Opening your email app — hit send and we\'ll reply within 24 hours.');
        }
      });
    });
  }

  /* ---------- Misc ---------- */
  function initMisc() {
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
    $$('[data-top]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        if (lenis) lenis.scrollTo(0, { duration: 2 }); else window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
    // live clock (IST) in hero/footer
    var clocks = $$('[data-clock]');
    if (clocks.length) {
      var fmt = function () {
        try { return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }); }
        catch (e) { return ''; }
      };
      var upd = function () { var t = fmt(); clocks.forEach(function (c) { c.textContent = t; }); };
      upd(); setInterval(upd, 15000);
    }
  }

  /* ---------- Boot ---------- */
  safe(splitAll);
  safe(initHeader);
  safe(initTransitions);
  safe(initLenis);
  safe(initCursor);
  safe(initPointerFX);
  safe(initGlobe);
  safe(initMarquees);
  safe(initTestimonials);
  safe(initFAQ);
  safe(initFilters);
  safe(initForms);
  safe(initMisc);
  safe(initScenes);
  initLoader(function () {
    root.classList.add('ready');
    safe(initReveals);
  });
})();
