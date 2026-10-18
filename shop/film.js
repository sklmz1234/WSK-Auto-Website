const section = document.querySelector('#experience');
const trigger = document.querySelector('#preview-film');
const player = document.querySelector('#brand-film-player');
const video = document.querySelector('#brand-film');
const close = document.querySelector('#film-close');
const loading = document.querySelector('#film-loading');
const error = document.querySelector('#film-error');
const introduction = [section.querySelector('.experience-copy'), section.querySelector('.experience-right')];
let closeTimer;
let attempt = 0;

function setIntroductionHidden(hidden) {
  introduction.forEach(element => {
    element.inert = hidden;
    if (hidden) element.setAttribute('aria-hidden', 'true');
    else element.removeAttribute('aria-hidden');
  });
}

function returnToIntroduction() {
  attempt++;
  video.pause();
  section.classList.remove('is-video', 'has-video');
  player.inert = true;
  player.setAttribute('aria-hidden', 'true');
  setIntroductionHidden(false);
  trigger.setAttribute('aria-expanded', 'false');
  trigger.focus({ preventScroll: true });
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    if (!section.classList.contains('is-video')) player.hidden = true;
  }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500);
}

function playbackFailed(currentAttempt) {
  if (currentAttempt !== attempt || !section.classList.contains('is-video')) return;
  returnToIntroduction();
  error.textContent = '影片暂时无法播放，请再次点击“预览风采”，或刷新页面重试。';
  error.hidden = false;
}

trigger.addEventListener('click', () => {
  clearTimeout(closeTimer);
  const currentAttempt = ++attempt;
  error.hidden = true;
  loading.hidden = false;
  player.hidden = false;
  player.inert = false;
  player.removeAttribute('aria-hidden');
  // Establish the hidden-opacity frame before starting the crossfade.
  player.getBoundingClientRect();
  section.classList.add('is-video');
  trigger.setAttribute('aria-expanded', 'true');
  close.focus({ preventScroll: true });
  setIntroductionHidden(true);
  if (video.error) video.load();
  if (video.readyState > 0) video.currentTime = 0;
  // Call play directly from the click, preserving the browser's user gesture.
  video.play().catch(() => playbackFailed(currentAttempt));
});

video.addEventListener('playing', () => {
  if (!section.classList.contains('is-video')) return;
  loading.hidden = true;
  section.classList.add('has-video');
});
video.addEventListener('error', () => playbackFailed(attempt));
close.addEventListener('click', returnToIntroduction);
section.addEventListener('keydown', event => {
  if (event.key === 'Escape' && section.classList.contains('is-video')) {
    event.preventDefault();
    returnToIntroduction();
  }
});
