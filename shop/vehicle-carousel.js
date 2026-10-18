// Slow right-to-left autoplay; native scrolling and arrow keys remain available.
export function createVehicleCarousel(root) {
  const viewport = root.querySelector('.vehicle-carousel-viewport');
  const track = root.querySelector('.vehicle-carousel-track');
  const group = root.querySelector('.vehicle-carousel-group');
  const win = root.ownerDocument.defaultView;
  const doc = root.ownerDocument;
  const reducedMotion = win.matchMedia('(prefers-reduced-motion: reduce)');
  const cleanups = [];
  let duplicate;
  let frame = 0;
  let lastTime = null;
  let scrollPosition = 0;
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
      // Accumulate fractional pixels so slow motion also works on high-refresh displays.
      scrollPosition = (scrollPosition + Math.min(time - lastTime, 64) * 0.024) % loopWidth();
      viewport.scrollLeft = scrollPosition;
    } else scrollPosition = viewport.scrollLeft;
    lastTime = time;
    frame = win.requestAnimationFrame(tick);
  }
  function sync() {
    const scrollable = loopWidth() > viewport.clientWidth;
    root.classList.toggle('is-static', !scrollable);
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
  listen(viewport, 'pointerover', event => {
    if (event.target.tagName === 'IMG') { hovered = true; sync(); }
  });
  listen(viewport, 'pointerout', event => {
    if (event.target.tagName === 'IMG') {
      hovered = Boolean(event.relatedTarget?.closest?.('.vehicle-carousel-viewport img'));
      sync();
    }
  });
  listen(viewport, 'click', event => {
    const repeated = event.target.closest('[data-carousel-select]');
    if (repeated) group.querySelector(`[data-select="${repeated.dataset.carouselSelect}"]`)?.click();
  });
  listen(viewport, 'pointerleave', () => { hovered = false; sync(); });
  listen(root, 'focusin', event => { focused = event.target.matches(':focus-visible'); sync(); });
  listen(root, 'focusout', event => {
    if (!root.contains(event.relatedTarget)) { focused = false; sync(); }
  });
  listen(viewport, 'pointerdown', () => { touching = true; sync(); });
  listen(win, 'pointerup', () => { touching = false; sync(); });
  listen(win, 'pointercancel', () => { touching = false; sync(); });
  listen(doc, 'visibilitychange', sync);
  listen(reducedMotion, 'change', event => { paused = event.matches; sync(); });
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
