import { catalog } from './vehicle-data.js';

const swatches = { gt: '#c8cbcb', x: '#28443b', s: '#aebfcc' };
const initialModel = new URLSearchParams(location.search).get('model');
let selected = Object.hasOwn(catalog, initialModel) ? initialModel : 'gt';
const radios = [...document.querySelectorAll('input[name="model"]')];
const dialog = document.querySelector('#purchase-review');
const confirmButton = document.querySelector('#purchase-confirm');
const status = document.querySelector('#purchase-status');

function paintName(vehicle) { return vehicle.paint.split(' · ')[0]; }
function selectModel(key, updateUrl = true) {
  if (!Object.hasOwn(catalog, key)) return;
  selected = key;
  const vehicle = catalog[key];
  const paint = paintName(vehicle);
  const image = document.querySelector('#purchase-image');
  image.src = `assets/model-${key}.png`;
  image.alt = `${paint} ${vehicle.name} 概念车`;
  document.querySelector('#purchase-name').textContent = vehicle.name;
  document.querySelector('#purchase-category').textContent = vehicle.category;
  document.querySelector('#purchase-tagline').textContent = vehicle.tagline;
  document.querySelector('#purchase-description').textContent = vehicle.description;
  document.querySelector('#purchase-body').textContent = vehicle.body;
  document.querySelector('#purchase-paint').textContent = paint;
  document.querySelector('#purchase-paint-dot').style.backgroundColor = swatches[key];
  document.querySelector('#summary-paint').textContent = paint;
  document.querySelector('#summary-journey').textContent = vehicle.journey;
  document.querySelector('#purchase-details').href = `models.html?model=${key}`;
  document.querySelector('#purchase-specs').replaceChildren(...[
    ['车身形态', vehicle.body], ['动力定位', '纯电概念'], ['出行灵感', vehicle.journey],
    ['外观配色', paint], ['设计主张', vehicle.design], ['造型语言', vehicle.detail],
  ].map(([label, value]) => {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    row.append(term, description);
    return row;
  }));
  radios.forEach(radio => {
    const active = radio.value === key;
    radio.checked = active;
    radio.closest('label').classList.toggle('is-selected', active);
    radio.closest('label').querySelector('.purchase-choice-state').textContent = active ? '已选择' : '选择车型';
  });
  status.hidden = true;
  status.textContent = '';
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set('model', key);
    history.replaceState(null, '', url);
  }
}

radios.forEach(radio => radio.addEventListener('change', () => {
  if (radio.checked) selectModel(radio.value);
}));
window.addEventListener('popstate', () => {
  const key = new URLSearchParams(location.search).get('model');
  selectModel(Object.hasOwn(catalog, key) ? key : 'gt', false);
});
confirmButton.addEventListener('click', () => {
  const vehicle = catalog[selected];
  document.querySelector('#review-name').textContent = vehicle.name;
  document.querySelector('#review-paint').textContent = paintName(vehicle);
  const image = document.querySelector('#review-image');
  image.src = `assets/model-${selected}.png`;
  image.alt = `${paintName(vehicle)} ${vehicle.name} 概念车`;
  dialog.showModal();
});
function closeReview() { dialog.close(); }
document.querySelector('#review-close').addEventListener('click', closeReview);
document.querySelector('#review-edit').addEventListener('click', closeReview);
dialog.addEventListener('close', () => confirmButton.focus({ preventScroll: true }));
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeReview();
});
document.querySelector('#review-confirm').addEventListener('click', () => {
  status.textContent = `已在本页确认 ${catalog[selected].name} 的选车意向。此为演示，未生成订单或产生费用。`;
  status.hidden = false;
  closeReview();
});

const menu = document.querySelector('.menu');
const navigation = document.querySelector('header nav');
menu.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  menu.textContent = open ? '×' : '☰';
});
navigation.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  navigation.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', '打开导航');
  menu.textContent = '☰';
});
selectModel(selected);
