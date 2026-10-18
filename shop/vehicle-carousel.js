// Native horizontal scrolling keeps touch, keyboard and manual controls available.
export function createVehicleCarousel(root) {
  const viewport = root.querySelector('.vehicle-carousel-viewport');
  const track = root.querySelector('.vehicle-carousel-track');
  const group = root.querySelector('.vehicle-carousel-group');
  const toggle = root.querySelector('[data-carousel-toggle]');
  const count = root.querySelector('[data-carousel-count]');
  const win = root.ownerDocument.defaultView;
  const doc = root.ownerDocument;
  const reducedMotion = win.matchMedia('(prefers-reduced-motion: reduce)');
  const cleanups = [];
  let duplicate;
  let frame = 0;
  let lastTime = null;
  let paused = reducedMotion.matches;
  let hovered = false;
  let focused = false;
  let touching = false;
  let visible = true;

  function listen(target, event, handler) {
    target.addEventListener(event, handler);
    cleanups.push(() => target.removeEventListener(event, handler));
  }

  function loopWidth() { return group.getBoundingClientRect().width; }
  function canRun() {
    return !paused && !hovered && !focused && !touching && visible && !doc.hidden
      && loopWidth() > viewport.clientWidth;
  }
  function stop() {
    if (frame) win.cancelAnimationFrame(frame);
    frame = 0;
    lastTime = null;
  }
  function tick(time) {
    frame = 0;
    if (!canRun()) { lastTime = null; return; }
    if (lastTime !== null) {
      // 32px/s: slow enough to browse; cap elapsed time after a suspended frame.
      viewport.scrollLeft = (viewport.scrollLeft + Math.min(time - lastTime, 64) * 0.032) % loopWidth();
    }
    lastTime = time;
    frame = win.requestAnimationFrame(tick);
  }
  function sync() {
    const scrollable = loopWidth() > viewport.clientWidth;
    root.classList.toggle('is-static', !scrollable);
    root.querySelector('[data-carousel-prev]').disabled = !scrollable;
    root.querySelector('[data-carousel-next]').disabled = !scrollable;
    toggle.setAttribute('aria-label', paused ? '播放自动轮播' : '暂停自动轮播');
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
    if (canRun()) {
      if (!frame) frame = win.requestAnimationFrame(tick);
    } else stop();
  }
  function refresh({ reset = false } = {}) {
    duplicate?.remove();
    duplicate = group.cloneNode(true);
    duplicate.setAttribute('aria-hidden', 'true');
    // Repeat visuals without duplicate keyboard/assistive-technology controls.
    // Pointer clicks on repeated cards forward to the original model button.
    duplicate.querySelectorAll('button').forEach(button => {
      const visual = doc.createElement('div');
      visual.className = button.className;
      visual.dataset.carouselSelect = button.dataset.select;
      visual.append(...button.childNodes);
      button.replaceWith(visual);
    });
    duplicate.querySelectorAll('[data-card]').forEach(card => card.removeAttribute('data-card'));
    duplicate.querySelectorAll('[data-gallery]').forEach(card => card.removeAttribute('data-gallery'));
    duplicate.querySelectorAll('img').forEach(image => image.alt = '');
    track.append(duplicate);
    const total = [...group.children].filter(card => !card.hidden).length;
    count.textContent = `${String(total).padStart(2, '0')} IMAGES`;
    if (reset) viewport.scrollLeft = 0;
    sync();
  }
  function move(direction) {
    const first = [...group.children].find(card => !card.hidden);
    if (!first) return;
    stop();
    const width = loopWidth();
    const step = first.getBoundingClientRect().width + (parseFloat(win.getComputedStyle(group).gap) || 0);
    // Normalize before manual movement, including stepping backwards from the start.
    if (direction < 0 && viewport.scrollLeft < step) viewport.scrollLeft += width;
    if (direction > 0 && viewport.scrollLeft >= width) viewport.scrollLeft -= width;
    viewport.scrollBy({ left: direction * step, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  listen(viewport, 'pointerenter', () => { hovered = true; sync(); });
  listen(viewport, 'click', event => {
    const repeated = event.target.closest('[data-carousel-select]');
    if (repeated) group.querySelector(`[data-select="${repeated.dataset.carouselSelect}"]`)?.click();
  });
  listen(viewport, 'pointerleave', () => { hovered = false; sync(); });
  listen(root, 'focusin', () => { focused = true; sync(); });
  listen(root, 'focusout', event => {
    if (!root.contains(event.relatedTarget)) { focused = false; sync(); }
  });
  listen(viewport, 'pointerdown', () => { touching = true; sync(); });
  listen(win, 'pointerup', () => { touching = false; sync(); });
  listen(win, 'pointercancel', () => { touching = false; sync(); });
  listen(doc, 'visibilitychange', sync);
  listen(reducedMotion, 'change', event => { paused = event.matches; sync(); });
  listen(toggle, 'click', () => {
    paused = !paused;
    // An explicit Play request also works while the Play button keeps focus.
    if (!paused && doc.activeElement === toggle) focused = false;
    sync();
  });
  listen(root.querySelector('[data-carousel-prev]'), 'click', () => move(-1));
  listen(root.querySelector('[data-carousel-next]'), 'click', () => move(1));
  listen(viewport, 'keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  const resize = win.ResizeObserver ? new win.ResizeObserver(sync) : null;
  resize?.observe(viewport);
  resize?.observe(group);
  const intersection = win.IntersectionObserver ? new win.IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }) : null;
  intersection?.observe(root);
  refresh();
  return {
    refresh,
    destroy() { stop(); duplicate?.remove(); resize?.disconnect(); intersection?.disconnect(); cleanups.forEach(fn => fn()); },
  };
}
