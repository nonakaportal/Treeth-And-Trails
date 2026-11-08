/* तीर्थ & Trails Co. — interactions and motion, shared by all five pages.
   Everything works without GSAP/Lenis (CDN failure) or with reduced motion: content is visible, menu/drawer/tabs still work. */
(() => {
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap, ST = window.ScrollTrigger;
  const motion = !reduce && !!G && !!ST;
  const fine = matchMedia('(pointer: fine)').matches;
  let lenis = null;
  let menuOpen = false, drawerOpen = false;

  /* ---------- smooth scroll ---------- */
  if (motion) {
    G.registerPlugin(ST);
    html.classList.add('anim');
    if (window.Lenis) {
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
      lenis.on('scroll', ST.update);
      G.ticker.add(t => lenis.raf(t * 1000));
      G.ticker.lagSmoothing(0);
    }
  }
  const navOffset = () => -($('.top').offsetHeight || 0) + 1;
  const scrollToEl = el => {
    if (lenis) lenis.scrollTo(el, { offset: el.id === 'top' ? 0 : navOffset(), duration: 1.6 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  /* ---------- text splitting: words (masked slide) or letters (blur-in, nothing clipped) ---------- */
  function split(el, mode) {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 1) { walk(n); return; }
        if (n.nodeType !== 3) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const w = document.createElement('span');
          w.setAttribute('aria-hidden', 'true');
          if (mode === 'chars') {
            w.className = 'wc';
            // keep Devanagari clusters whole: letters only for Latin words
            const parts = /[ऀ-ॿ]/.test(part) ? [part] : [...part];
            parts.forEach(ch => { const c = document.createElement('span'); c.className = 'c'; c.textContent = ch; w.append(c); });
          } else {
            const i = document.createElement('span');
            w.className = 'w'; i.textContent = part; w.append(i);
          }
          frag.append(w);
        });
        n.replaceWith(frag);
      });
    };
    walk(el);
  }
  if (motion) {
    $$('[data-split]').forEach(el => split(el, el.dataset.split));
    const word = $('.lk-word');
    if (word) split(word, 'chars');
  }
  const pieces = el => (el.dataset.split === 'chars' ? $$('.c', el) : $$('.w > span', el));
  const reveal = (el, extra = {}) => (el.dataset.split === 'chars'
    ? G.to(pieces(el), { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.1, stagger: 0.035, ease: 'power3.out', ...extra })
    : G.to(pieces(el), { y: 0, duration: 1.2, stagger: 0.06, ease: 'power4.out', ...extra }));

  /* ---------- curtain: page entrance ---------- */
  const loader = $('.loader');
  const hero = $('.hero, .banner');
  const isHome = !!$('.hero-classic');
  // refresh / back-forward keep the reader's scroll spot, so skip the curtain and scroll lock there
  const navType = performance.getEntriesByType('navigation')[0]?.type;
  const fresh = navType !== 'reload' && navType !== 'back_forward';
  if (!fresh) history.scrollRestoration = 'auto';
  if (motion && loader && fresh) {
    // the first screen stays locked until its entrance has fully played, then scrolling is handed back
    const root = document.documentElement;
    history.scrollRestoration = 'manual'; scrollTo(0, 0);
    root.style.overflow = 'hidden'; lenis?.stop();
    const tl = G.timeline({ defaults: { ease: 'power4.inOut' }, onComplete: () => { root.style.overflow = ''; lenis?.start(); } });
    tl.timeScale(1 / 0.9); // entrance plays 10% faster
    tl.to('.loader-line span', { scaleX: 1, duration: isHome ? 0.9 : 0.6, ease: 'power2.inOut' }).to({}, { duration: 0.1 });
    tl.to(loader, { yPercent: -100, duration: isHome ? 1.1 : 0.9 }).set(loader, { display: 'none' });
    if (isHome) {
      // the centred lockup assembles: तीर्थ sharpens, & turns in, mountains draw up, TRAILS rises letter by letter
      G.set('.lk-hi', { opacity: 0, y: 30, filter: 'blur(12px)' });
      G.set('.lk-amp', { opacity: 0, scale: 0.6, rotate: -14 });
      G.set('.lk-mtn', { clipPath: 'inset(100% 0 0 0)', y: 10 });
      G.set('.lk-word .c', { opacity: 0, yPercent: 60, filter: 'blur(6px)' });
      G.set(['.lk-co', '.hero-quote', '.hero-intro', '.hero-center .btn', '.scroll-cue'], { opacity: 0, y: 24 });
      G.set('.lk-orn .ln', { scaleX: 0 });
      G.set('.chakra', { opacity: 0 });
      G.set('.lk-orn i', { scale: 0 });
      tl.fromTo('.hero-img img', { scale: 1.18 }, { scale: 1.03, duration: 2.6, ease: 'power3.out' }, '-=0.9')
        .to('.chakra', { opacity: 0.14, duration: 2.4, ease: 'power2.out' }, '-=2.3')
        .to('.lk-hi', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' }, '-=2.1')
        .to('.lk-amp', { opacity: 1, scale: 1, rotate: 0, duration: 1, ease: 'back.out(1.6)' }, '-=0.9')
        .to('.lk-mtn', { clipPath: 'inset(0% 0 0 0)', y: 0, duration: 1.1, ease: 'power3.out' }, '-=0.7')
        .to('.lk-word .c', { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.06, ease: 'power3.out' }, '-=0.9')
        .to('.lk-co', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
        .to('.lk-orn .ln', { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }, '-=0.6')
        .to('.lk-orn i', { scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(3)' }, '-=0.5')
        .to('.hero-quote', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.4')
        .to('.hero-intro', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.75')
        .to('.hero-center .btn', { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, '-=0.7')
        .to('.scroll-cue', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4');
    } else if ($('.banner')) {
      G.set(['.crumb', '.banner-sub'], { opacity: 0, y: 20 });
      tl.fromTo('.banner .hero-img img', { scale: 1.15 }, { scale: 1, duration: 2.2, ease: 'power3.out' }, '-=0.7')
        .to('.crumb', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=1.8')
        .add(reveal($('.banner h1')), '-=1.6')
        .to('.banner-sub', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.9');
    }
    tl.from('.top', { opacity: 0, y: -16, duration: 0.9, ease: 'power3.out' }, '-=1.4');
  } else if (loader) G ? G.set(loader, { display: 'none' }) : loader.remove();
  if (motion && hero) {
    // the hero/banner drifts slower than the page and its content fades as it leaves
    G.to(hero.querySelector('.hero-img'), { yPercent: 18, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    G.to(hero.querySelector('.hero-center, .banner-inner'), { opacity: 0, y: -60, ease: 'none', scrollTrigger: { trigger: hero, start: '25% top', end: '85% top', scrub: true } });
  }

  /* ---------- links: smooth in-page scrolling; other pages navigate normally and their own loader covers the switch ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (href.startsWith('#')) {
      const t = href.length > 1 && document.getElementById(href.slice(1));
      if (!t) return;
      e.preventDefault();
      if (menuOpen) closeMenu(false);
      scrollToEl(t);
    }
  });
  // back/forward from the page cache: never leave the curtain covering the page
  addEventListener('pageshow', e => { if (e.persisted && loader && G) { G.set(loader, { display: 'none' }); lenis?.start(); } });

  /* ---------- header turns solid after the hero ---------- */
  const top = $('.top');
  if (motion) ST.create({ trigger: hero, start: 'bottom 80px', onEnter: () => top.classList.add('solid'), onLeaveBack: () => top.classList.remove('solid') });
  else { const set = () => top.classList.toggle('solid', hero.getBoundingClientRect().bottom < 80); addEventListener('scroll', set, { passive: true }); set(); }

  /* ---------- scroll reveals ---------- */
  if (motion) {
    $$('[data-split]').forEach(el => {
      if (el.closest('.hero, .banner')) return;
      reveal(el, { scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('[data-fade]').forEach(el => {
      G.to(el, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
    });
    $$('[data-wipe]').forEach(el => {
      const st = { trigger: el, start: 'top 85%' };
      G.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'power4.inOut', scrollTrigger: st });
      G.to($('img', el), { scale: el.closest('.track') ? 1 : 1.12, duration: 2, ease: 'power3.out', scrollTrigger: st });
    });
    // images glide a little slower than the page
    $$('img[data-parallax]').forEach(img => {
      G.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-parallax-wrap]').forEach(m => {
      G.fromTo(m, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: m.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    if ($('.steps')) G.to('.step .bar', { scaleX: 1, duration: 1.4, stagger: 0.25, ease: 'power3.inOut', scrollTrigger: { trigger: '.steps', start: 'top 80%' } });
    $$('[data-count]').forEach(el => {
      const n = { v: 0 }, end = +el.dataset.count, suf = el.dataset.suffix || '';
      el.textContent = '0' + suf;
      G.to(n, { v: end, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 85%' }, onUpdate: () => { el.textContent = Math.round(n.v) + suf; } });
    });
    addEventListener('load', () => ST.refresh());
  }

  /* ---------- magnetic primary buttons (desktop, motion on): a gentle pull toward the cursor ---------- */
  if (motion && fine) {
    $$('.hero-center .btn, .top .btn, .pkg-actions .btn.solid').forEach(btn => {
      btn.classList.add('magnetic');
      const qx = G.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' }), qy = G.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * 0.22);
        qy((e.clientY - (r.top + r.height / 2)) * 0.3);
      });
      btn.addEventListener('pointerleave', () => { qx(0); qy(0); });
    });
  }

  /* ---------- journeys carousel: drag, buttons, progress ---------- */
  const track = $('.track');
  if (track) {
    const bar = $('.track-bar span');
    const progress = () => { bar.style.transform = `scaleX(${Math.min(1, (track.scrollLeft + track.clientWidth) / track.scrollWidth)})`; };
    track.addEventListener('scroll', progress, { passive: true });
    addEventListener('resize', progress);
    progress();
    const step = () => ($('.card', track).offsetWidth + 28);
    $('.track-ui .next').addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    $('.track-ui .prev').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    let down = null, moved = false;
    track.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = { x: e.clientX, left: track.scrollLeft, lx: e.clientX, lt: performance.now(), v: 0 }; moved = false;
    });
    addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('dragging'); }
      if (moved) track.scrollLeft = down.left - dx;
      const now = performance.now();
      down.v = (e.clientX - down.lx) / Math.max(1, now - down.lt); down.lx = e.clientX; down.lt = now;
    });
    addEventListener('pointerup', () => {
      if (!down) return;
      const v = down.v;
      down = null;
      if (moved) {
        track.classList.remove('dragging');
        // settle on the nearest card; a fast flick (velocity, not distance) carries on to the next one
        const w = step(), base = track.scrollLeft / w;
        const target = Math.abs(v) > 0.4 ? (v < 0 ? Math.ceil(base) : Math.floor(base)) : Math.round(base);
        track.scrollTo({ left: target * w, behavior: 'smooth' });
      }
    });
    track.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  }

  /* ---------- trek categories: a pop-up whose cards roll sideways ---------- */
  const pop = $('#trek-pop');
  let popOpen = false, closePop = () => {};
  if (pop) {
    const panel = $('.tp-panel', pop), shade = $('.tp-shade', pop);
    const rolls = $$('.roll', pop);
    let active = null, lastTile = null;
    const SPEED = 42; // px per second
    // per strip: clone the card set until the strip is wider than the panel plus one set, so the loop never shows a gap
    const strips = new Map(rolls.map(r => [r, { x: 0, set: 0, paused: false, drag: null, ready: false }]));
    const prepare = roll => {
      const st = strips.get(roll), track = $('.roll-track', roll);
      if (st.ready || !motion) return;
      const originals = $$('.tc', track);
      st.set = track.scrollWidth;
      while (track.scrollWidth < panel.clientWidth + st.set + 10) {
        originals.forEach(li => {
          const c = li.cloneNode(true);
          c.setAttribute('aria-hidden', 'true'); c.inert = true;
          track.append(c);
        });
      }
      st.ready = true;
    };
    if (motion) G.ticker.add((t, dt) => {
      if (!popOpen || !active) return;
      const st = strips.get(active);
      if (!st.paused && !st.drag) st.x -= SPEED * dt / 1000;
      if (st.x <= -st.set) st.x += st.set;
      if (st.x > 0) st.x -= st.set;
      $('.roll-track', active).style.transform = `translate3d(${st.x}px,0,0)`;
    });
    rolls.forEach(roll => {
      const st = strips.get(roll);
      ['mouseenter', 'focusin'].forEach(ev => roll.addEventListener(ev, () => { st.paused = true; }));
      ['mouseleave', 'focusout'].forEach(ev => roll.addEventListener(ev, () => { st.paused = false; }));
      roll.addEventListener('pointerdown', e => {
        if (!motion || e.button !== 0) return;
        st.drag = { x0: e.clientX, from: st.x, moved: false };
        roll.setPointerCapture(e.pointerId);
      });
      roll.addEventListener('pointermove', e => {
        if (!st.drag) return;
        const dx = e.clientX - st.drag.x0;
        if (!st.drag.moved && Math.abs(dx) > 6) { st.drag.moved = true; roll.classList.add('dragging'); }
        if (st.drag.moved) st.x = st.drag.from + dx;
      });
      const end = () => { if (!st.drag) return; roll.classList.remove('dragging'); st.drag = null; };
      roll.addEventListener('pointerup', end);
      roll.addEventListener('pointercancel', end);
    });
    const open = tile => {
      lastTile = tile;
      $('.tp-count', pop).textContent = tile.dataset.total;
      $('.tp-title', pop).textContent = tile.dataset.name;
      $('.tp-q', pop).textContent = tile.dataset.intro;
      rolls.forEach(r => { r.hidden = r.dataset.cat !== tile.dataset.cat; });
      active = rolls.find(r => !r.hidden);
      popOpen = true; pop.classList.add('open'); lenis?.stop(); document.body.style.overflow = 'hidden';
      prepare(active);
      const st = strips.get(active); st.x = 0; st.paused = false;
      if (motion) {
        G.to(shade, { opacity: 1, duration: 0.3 });
        G.fromTo(panel, { clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 0.5, ease: 'expo.out' });
        G.fromTo($$('.tp-head > div > *', pop), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, delay: 0.12, ease: 'expo.out' });
        // cards roll in from the right, one after another, then keep rolling
        G.fromTo($$('.tc', active), { x: () => innerWidth * 0.9, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, stagger: 0.06, delay: 0.15, ease: 'expo.out', clearProps: 'transform' });
      } else shade.style.opacity = 1;
      $('.tp-close', pop).focus({ preventScroll: true });
    };
    closePop = (instant = false) => {
      popOpen = false; lenis?.start(); document.body.style.overflow = '';
      const done = () => { pop.classList.remove('open'); lastTile?.focus({ preventScroll: true }); };
      if (motion) {
        G.to(shade, { opacity: 0, duration: instant ? 0.12 : 0.25 });
        G.to(panel, { clipPath: 'inset(50% 0 50% 0)', duration: instant ? 0.12 : 0.3, ease: 'expo.out', onComplete: done });
      } else { shade.style.opacity = ''; done(); }
    };
    // arrows move one card; wheel / trackpad scroll moves the strip sideways
    const step = () => { const c = $('.tc', active); return c ? c.offsetWidth + 24 : 300; };
    const nudge = dir => {
      if (!active) return;
      const st = strips.get(active);
      if (motion) { st.paused = true; G.to(st, { x: st.x - dir * step(), duration: 0.45, ease: 'expo.out', overwrite: true, onComplete: () => { st.paused = active.matches(':hover'); } }); }
      else active.scrollBy({ left: dir * step(), behavior: 'smooth' });
    };
    $('.tp-next', pop).addEventListener('click', () => nudge(1));
    $('.tp-prev', pop).addEventListener('click', () => nudge(-1));
    rolls.forEach(roll => roll.addEventListener('wheel', e => {
      if (!motion) return; // without motion the strip scrolls natively
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      e.preventDefault();
      strips.get(roll).x -= d;
    }, { passive: false }));
    $$('.cat-tile').forEach(tile => tile.addEventListener('click', () => open(tile)));
    $('.tp-close', pop).addEventListener('click', closePop);
    shade.addEventListener('click', closePop);
  }

  /* ---------- testimonials ---------- */
  const quotes = $$('.quote'), dots = $$('.dots button');
  if (quotes.length) {
    let qi = 0, qTimer = null;
    const showQuote = i => {
      quotes[qi].classList.remove('on'); dots[qi].removeAttribute('aria-current');
      qi = (i + quotes.length) % quotes.length;
      quotes[qi].classList.add('on'); dots[qi].setAttribute('aria-current', 'true');
      if (motion) G.fromTo(quotes[qi], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
    };
    const play = () => { if (!reduce) { clearInterval(qTimer); qTimer = setInterval(() => showQuote(qi + 1), 6500); } };
    dots.forEach((d, i) => d.addEventListener('click', () => { showQuote(i); play(); }));
    const box = $('.quotes').parentElement;
    ['mouseenter', 'focusin'].forEach(ev => box.addEventListener(ev, () => clearInterval(qTimer)));
    ['mouseleave', 'focusout'].forEach(ev => box.addEventListener(ev, play));
    play();
  }

  /* ---------- full-screen menu ---------- */
  const menu = $('#menu'), menuBtn = $('.top .menu-btn');
  function openMenu() {
    menuOpen = true; menu.classList.add('open'); html.classList.add('menu-open'); menuBtn.setAttribute('aria-expanded', 'true'); lenis?.stop();
    if (motion) {
      G.to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.5, ease: 'power3.inOut' });
      G.fromTo($$('nav a span', menu), { yPercent: 110 }, { yPercent: 0, duration: 0.6, stagger: 0.04, ease: 'expo.out', delay: 0.12 });
    } else menu.style.clipPath = 'none';
    $('nav a', menu).focus({ preventScroll: true });
  }
  function closeMenu(focusBack = true, instant = false) {
    menuOpen = false; html.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); lenis?.start();
    const done = () => { menu.classList.remove('open'); if (focusBack) menuBtn.focus({ preventScroll: true }); };
    if (motion) G.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: instant ? 0.12 : 0.35, ease: 'power3.inOut', onComplete: done });
    else { menu.style.clipPath = ''; done(); }
  }
  menuBtn.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  $('.menu-close').addEventListener('click', () => closeMenu());

  /* ---------- journey drawer (pages that list journeys) ---------- */
  const drawer = $('#drawer');
  let closeDrawer = () => {};
  if (drawer) {
    const data = JSON.parse($('#journey-data').textContent);
    const panel = $('.drawer-panel', drawer), shade = $('.drawer-shade', drawer);
    let lastFocus = null;
    const WA = 'https://wa.me/917387407857?text=';
    const el = (tag, text) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; return n; };
    const fill = j => {
      $('.drawer-media img', drawer).src = j.img;
      $('.drawer-hi', drawer).textContent = j.hi;
      const [main, sub] = j.title.split(' — ');
      const title = $('#drawer-title');
      title.textContent = main;
      if (sub) title.append(el('span', sub)), title.lastChild.className = 'dr-sub';
      $('.drawer-blurb', drawer).textContent = j.blurb;
      $('.facts', drawer).replaceChildren(...j.facts.map(([k, v]) => { const d = el('div'); d.append(el('dt', k), el('dd', v)); return d; }));
      const stops = j.route.split('→').map(x => x.trim()).filter(Boolean);
      $('.route-stops', drawer).replaceChildren(...stops.map(x => el('li', x)));
      buildJourney(j, stops);
      $('.drawer-price', drawer).textContent = j.price;
      $('.drawer-wa', drawer).href = WA + encodeURIComponent(`Hi! I'd like to know more about ${j.title} with Teerth & Trails Co.`);
    };
    // ---- the itinerary as a journey: a toy car (road) or helicopter (air) travels down the route ----
    const CAR = '<svg viewBox="0 0 40 64" aria-hidden="true"><rect x="6" y="5" width="28" height="54" rx="12" fill="#2C0A0A" opacity=".25" transform="translate(1.5 2)"/><rect x="7" y="6" width="26" height="52" rx="11" fill="#8B1A1A"/><rect x="11" y="15" width="18" height="12" rx="4" fill="#E8C06A" opacity=".9"/><rect x="11" y="38" width="18" height="9" rx="3" fill="#E8C06A" opacity=".55"/><rect x="3" y="12" width="5" height="11" rx="2.5" fill="#2C0A0A"/><rect x="32" y="12" width="5" height="11" rx="2.5" fill="#2C0A0A"/><rect x="3" y="41" width="5" height="11" rx="2.5" fill="#2C0A0A"/><rect x="32" y="41" width="5" height="11" rx="2.5" fill="#2C0A0A"/><circle cx="13" cy="56" r="2" fill="#FDF6F0"/><circle cx="27" cy="56" r="2" fill="#FDF6F0"/></svg>';
    const HELI = '<svg viewBox="0 0 64 64" aria-hidden="true"><g class="rotor"><rect x="4" y="9" width="56" height="2.4" rx="1.2" fill="#2C0A0A"/></g><rect x="30.8" y="10" width="2.4" height="8" fill="#2C0A0A"/><path d="M14 30c0-7 6-12 14-12h6c9 0 16 6 16 14v4H18c-2.2 0-4-1.8-4-4z" fill="#8B1A1A"/><path d="M36 22h4c4 0 7 3 8 7h-12z" fill="#E8C06A" opacity=".9"/><path d="M14 31 2 28l1-5 12 3z" fill="#8B1A1A"/><circle cx="3" cy="25" r="3.5" fill="none" stroke="#2C0A0A" stroke-width="1.4"/><path d="M20 40v6M42 40v6M14 46h34" stroke="#2C0A0A" stroke-width="2" stroke-linecap="round"/></svg>';
    let journeyRun = null;
    const NS = 'http://www.w3.org/2000/svg';
    const buildJourney = (j, stops) => {
      const air = /^heli/.test(j.id || '') || /Helicopter/.test(j.title);
      const tl = $('.tl', drawer);
      tl.className = 'tl ' + (air ? 'tl-air' : 'tl-road');
      // sticky strip: the wave road, numbered stops and the vehicle
      const strip = el('div'); strip.className = 'tl-strip';
      const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'tl-path'); svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = '<path class="tl-way"/><path class="tl-done"/>';
      // one marker per place on the route, so the vehicle passes every stop, not just every day card
      const marks = el('div'); marks.className = 'tl-marks';
      stops.forEach((x, i) => {
        const m = el('span', String(i + 1)); m.className = 'tl-mark';
        const name = el('em', (x.match(/\(([^)]+)\)/) || [, x])[1]); name.className = 'tl-name';
        m.append(name); marks.append(m);
      });
      const vehicle = el('span'); vehicle.className = 'tl-vehicle'; vehicle.innerHTML = air ? HELI : CAR;
      strip.append(svg, marks, vehicle);
      // the route pills ride along with the strip; the .tl itself is just scroll runway for the drive
      const stick = el('div'); stick.className = 'tl-stick';
      stick.append($('.route-stops', drawer), strip);
      tl.replaceChildren(stick);
    };
    // zigzag road: straight runs between stops, each corner rounded off with a quadratic curve (never pointed).
    // Returns the path and the apex of every rounded corner, which is where that stop's marker sits.
    const zigzagPath = (pts, f = 0.3) => {
      const f1 = n => n.toFixed(1), apex = [];
      let d = `M ${f1(pts[0].x)} ${f1(pts[0].y)}`;
      for (let i = 1; i < pts.length - 1; i++) {
        const a = pts[i - 1], p = pts[i], b = pts[i + 1];
        const e = { x: p.x + (a.x - p.x) * f, y: p.y + (a.y - p.y) * f }, x = { x: p.x + (b.x - p.x) * f, y: p.y + (b.y - p.y) * f };
        d += ` L ${f1(e.x)} ${f1(e.y)} Q ${f1(p.x)} ${f1(p.y)} ${f1(x.x)} ${f1(x.y)}`;
        apex.push({ x: (e.x + 2 * p.x + x.x) / 4, y: (e.y + 2 * p.y + x.y) / 4 });
      }
      const z = pts[pts.length - 1];
      return { d: `${d} L ${f1(z.x)} ${f1(z.y)}`, apex };
    };
    // the vehicle drives sideways along the route as the reader scrolls through the runway
    const startJourney = () => {
      cancelAnimationFrame(journeyRun);
      const tl = $('.tl', drawer), strip = $('.tl-strip', tl), svg = $('.tl-path', tl);
      const way = $('.tl-way', svg), done = $('.tl-done', svg), vehicle = $('.tl-vehicle', tl);
      const marks = $$('.tl-mark', tl), air = tl.classList.contains('tl-air');
      const W = strip.clientWidth, H = strip.clientHeight, mid = H / 2 + 6, amp = Math.min(30, H / 4.4), pad = W > 600 ? 48 : 26; // room for the end place names
      const n = marks.length, chips = $$('.route-stops li', drawer);
      const corners = marks.map((_, i) => ({ x: n === 1 ? W / 2 : pad + (i * (W - pad * 2)) / (n - 1), y: mid + (i % 2 ? amp : -amp) }));
      // lead-in and lead-out keep the road going past the first and last stop
      const { d, apex: stopsXY } = zigzagPath([{ x: 0, y: mid }, ...corners, { x: W, y: mid }], W > 600 ? 0.2 : 0.3);
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      way.setAttribute('d', d); done.setAttribute('d', d);
      const len = way.getTotalLength();
      done.style.strokeDasharray = `${len} ${len}`;
      marks.forEach((m, i) => { m.style.left = stopsXY[i].x + 'px'; m.style.top = stopsXY[i].y + 'px'; });
      // path length at each stop, so "reached" is exact along the curve
      const stopLen = stopsXY.map(q => { let lo = 0, hi = len; for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (way.getPointAtLength(m).x < q.x) lo = m; else hi = m; } return lo; });
      const first = stopLen[0], last = stopLen[n - 1];
      const vw = vehicle.offsetWidth, vh = vehicle.offsetHeight;
      const place = q => {
        const at = first + q * (last - first), a = way.getPointAtLength(at), b2 = way.getPointAtLength(Math.min(len, at + 2));
        const heading = Math.atan2(b2.y - a.y, b2.x - a.x) * 180 / Math.PI;
        const rot = air ? heading * 0.5 : heading + 90; // car drawing faces up; the helicopter only tilts
        vehicle.style.transform = `translate(${a.x - vw / 2}px, ${a.y - vh / 2}px) rotate(${rot}deg)`;
        done.style.strokeDashoffset = len - at;
        let now = 0;
        marks.forEach((m, i) => { const on = stopLen[i] <= at + 3; if (on) now = i; m.classList.toggle('on', on); chips[i]?.classList.toggle('on', on); });
        chips.forEach((c, i) => c.classList.toggle('now', i === now));
      };
      if (!motion) { place(1); return; }
      let p = 0;
      drive = 0; driveSpan = n * (W > 600 ? 110 : 90);
      const target = () => {
        // scrolled past by scrollbar or keyboard (no wheel/touch to steer): treat the drive as done
        if (tl.getBoundingClientRect().bottom < panel.getBoundingClientRect().top + 60) drive = 1;
        return drive;
      };
      const step = () => {
        if (!drawerOpen) return;
        const t = target();
        p += (t - p) * 0.09;
        if (Math.abs(t - p) < 0.0005) p = t;
        place(p);
        vehicle.classList.toggle('moving', Math.abs(t - p) > 0.002);
        journeyRun = requestAnimationFrame(step);
      };
      journeyRun = requestAnimationFrame(step);
    };
    // scroll pause: while the whole route is in view, wheel/touch scrolling drives the vehicle instead of the panel
    let drive = 0, driveSpan = 1, touchY = 0;
    const routeInView = () => {
      const r = $('.tl', drawer).getBoundingClientRect(), pr = panel.getBoundingClientRect();
      return r.top >= pr.top + 60 && r.bottom <= pr.bottom;
    };
    const steer = (dy, e) => {
      if (!drawerOpen || !motion || !dy || (dy > 0 ? drive >= 1 : drive <= 0) || !routeInView()) return;
      e.preventDefault();
      drive = Math.min(1, Math.max(0, drive + dy / driveSpan));
    };
    panel.addEventListener('wheel', e => steer(e.deltaMode ? e.deltaY * 40 : e.deltaY, e), { passive: false });
    panel.addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
    panel.addEventListener('touchmove', e => { const y = e.touches[0].clientY; steer(touchY - y, e); touchY = y; }, { passive: false });
    const open = id => {
      const j = data[id]; if (!j) return;
      lastFocus = document.activeElement; fill(j); panel.scrollTop = 0;
      drawerOpen = true; drawer.classList.add('open'); lenis?.stop(); document.body.style.overflow = 'hidden';
      if (motion) {
        G.to(shade, { opacity: 1, duration: 0.3 });
        G.fromTo(panel, { opacity: 0, y: 24, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'expo.out' });
        G.fromTo($$('.drawer-body > *', drawer), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, delay: 0.08, ease: 'expo.out' });
      } else shade.style.opacity = 1;
      $('.drawer-close button', drawer).focus({ preventScroll: true });
      requestAnimationFrame(startJourney);
    };
    closeDrawer = (instant = false) => {
      drawerOpen = false; lenis?.start(); document.body.style.overflow = '';
      const done = () => { drawer.classList.remove('open'); lastFocus?.focus({ preventScroll: true }); };
      if (motion) { G.to(shade, { opacity: 0, duration: instant ? 0.12 : 0.22 }); G.to(panel, { opacity: 0, y: 12, scale: 0.97, duration: instant ? 0.12 : 0.25, ease: 'power2.out', onComplete: done }); }
      else { shade.style.opacity = ''; done(); }
    };
    document.addEventListener('click', e => { const b = e.target.closest('[data-journey]'); if (b) open(b.dataset.journey); });
    $('.drawer-close button', drawer).addEventListener('click', closeDrawer);
    shade.addEventListener('click', closeDrawer);
  }

  /* ---------- keyboard: Escape closes, Tab stays inside open dialogs ---------- */
  document.addEventListener('keydown', e => {
    const box = drawerOpen ? drawer : popOpen ? pop : menuOpen ? menu : null;
    if (!box) return;
    if (e.key === 'Escape') { drawerOpen ? closeDrawer(true) : popOpen ? closePop(true) : closeMenu(true, true); return; }
    if (e.key !== 'Tab') return;
    const f = [...(box === menu ? [menuBtn] : []), ...$$('a[href], button', box).filter(n => n.offsetParent !== null && !n.closest('[inert]'))];
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
})();
