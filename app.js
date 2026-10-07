'use strict';
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('copy-address').addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText('CARBO — عمّان، تلاع العلي، سوق السلطان');
    status.textContent = 'تم نسخ العنوان';
  } catch {
    status.textContent = 'العنوان: CARBO — عمّان، تلاع العلي، سوق السلطان';
  }
});

const categories = window.CARBO_MENU;
function foodImage(category, name) {
  if (name.includes('رايز') || name.includes('ريزو') || name.includes('أرز')) return 'rice';
  if (name.includes('سيزر')) return 'salad';
  if (name.includes('الصحية')) return 'healthy';
  if (name.includes('الأطفال')) return 'chickenburger';
  if (category === 'الإضافات والمشروبات') {
    if (/مشروبات|مياه|شنينة/.test(name)) return 'drinks';
    if (/جارلك/.test(name)) return 'bread';
    if (/حلقات/.test(name)) return 'onionrings';
    if (/ودجز/.test(name)) return 'wedges';
    if (/بطاطا/.test(name)) return 'fries';
    return 'sauce';
  }
  if (category === 'وينجز وبونلس') return name === 'وينجز' ? 'wings' : 'boneless';
  return ({'ساندويشات شاورما':'shawarma','وجبات شاورما':'family','الوجبات العائلية':'family','شاورما بالوزن':'family','دجاج على الفحم':'chicken','كالزوني':'calzone','برجر دجاج':'chickenburger','أنجوس بيف برجر':'beefburger','بيتزا':'pizza','سناكات':'sandwich'})[category] || 'healthy';
}
const viewer = document.getElementById('food-viewer');
const viewerImage = document.getElementById('viewer-image');
const viewerTitle = document.getElementById('viewer-title');
document.getElementById('viewer-close').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });

const tabs = document.getElementById('category-tabs');
const content = document.getElementById('menu-content');
const search = document.getElementById('menu-search');
let selected = 'الكل';
const normalize = text => text.normalize('NFKC').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[\u064B-\u065F]/g, '').toLowerCase().trim();
for (const title of ['الكل', ...categories.map(category => category.title)]) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = title;
  button.setAttribute('aria-pressed', String(title === selected));
  button.addEventListener('click', () => {
    selected = title;
    for (const tab of tabs.children) tab.setAttribute('aria-pressed', String(tab.textContent === selected));
    renderMenu();
  });
  tabs.append(button);
}
function renderMenu() {
  content.replaceChildren();
  const query = normalize(search.value);
  let total = 0;
  for (const category of categories) {
    if (selected !== 'الكل' && selected !== category.title) continue;
    const items = category.items.filter(item => normalize(category.title + ' ' + item[0] + ' ' + (item[2] || '')).includes(query));
    if (!items.length) continue;
    total += items.length;
    const section = document.createElement('section');
    section.className = 'menu-category';
    const heading = document.createElement('h3');
    heading.textContent = category.title;
    section.append(heading);
    if (category.note) {
      const note = document.createElement('p'); note.className = 'category-note'; note.textContent = category.note; section.append(note);
    }
    const grid = document.createElement('div'); grid.className = 'menu-grid';
    for (const [name, price, description] of items) {
      const card = document.createElement('article'); card.className = 'food-card';
      const photo = document.createElement('button'); photo.type = 'button'; photo.className = 'food-photo';
      photo.setAttribute('aria-label', 'تكبير الصورة التوضيحية: ' + name);
      const img = document.createElement('img'); img.src = 'assets/menu/' + foodImage(category.title, name) + '.webp';
      img.alt = 'صورة توضيحية لفئة ' + category.title; img.loading = 'lazy'; img.decoding = 'async'; img.width = 640; img.height = 640;
      photo.append(img);
      const zoom = document.createElement('span'); zoom.className = 'photo-zoom'; zoom.textContent = '+'; zoom.setAttribute('aria-hidden','true'); photo.append(zoom);
      photo.addEventListener('click', () => { viewerImage.src = img.src; viewerImage.alt = img.alt; viewerTitle.textContent = name; viewer.showModal(); });
      card.append(photo);
      const title = document.createElement('h4'); title.textContent = name; card.append(title);
      if (description) { const detail = document.createElement('p'); detail.textContent = description; card.append(detail); }
      const prices = document.createElement('div'); prices.className = 'food-prices';
      (Array.isArray(price) ? price : [price]).forEach((amount, index) => {
        const line = document.createElement('div');
        const label = document.createElement('span'); label.textContent = Array.isArray(price) ? category.variants[index] : 'السعر';
        const value = document.createElement('strong'); value.textContent = amount.toFixed(2) + ' د.أ';
        line.append(label, value); prices.append(line);
      });
      card.append(prices); grid.append(card);
    }
    section.append(grid); content.append(section);
  }
  document.getElementById('results-status').textContent = total ? `${total} صنف · ${selected}` : 'ما لقينا أصناف مطابقة. جرّب كلمة ثانية أو اختار «الكل».';
}
search.addEventListener('input', renderMenu);
renderMenu();
