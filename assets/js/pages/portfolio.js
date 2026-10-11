// =========================================================
// Портфолио: рендер из манифеста + lightbox с галереей объекта
// =========================================================
document.addEventListener('DOMContentLoaded', function () {
  const grid = document.getElementById('portfolioGrid');
  const filterEl = document.getElementById('portfolioFilter');
  if (!grid) return;

  const IMG_BASE = 'assets/img/projects/';

  function loadManifest() {
    return fetch('assets/data/projects.json').then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  loadManifest()
    .then(manifest => {
      window.__PROJECTS = manifest;
      // Проверяем ?cat= в URL
      const params = new URLSearchParams(window.location.search);
      const initial = params.get('cat') || 'all';
      render(initial);
      filterEl.querySelector(`button[data-filter="${initial}"]`)?.classList.add('active');
      if (window.STUGNUM) STUGNUM.setLang(STUGNUM.getLang());
    })
    .catch(err => {
      console.error('[portfolio] failed to load manifest', err);
      grid.innerHTML = '<p class="portfolio-empty" data-ru="Не удалось загрузить портфолио. Попробуйте позже." data-et="Portfoolio laadimine ebaõnnestus. Proovige hiljem.">Не удалось загрузить портфолио. Попробуйте позже.</p>';
    });

  // Рендер карточек по фильтру
  function render(filter) {
    const m = window.__PROJECTS;
    if (!m) return;
    grid.innerHTML = '';
    let visible = 0;
    m.objects.forEach(obj => {
      if (filter !== 'all' && obj.category !== filter) return;
      visible++;

      const cat = m.categories[obj.category] || { ru: obj.category, et: obj.category };

      const article = document.createElement('article');
      article.className = 'portfolio-item';
      article.dataset.slug = obj.category;
      article.dataset.objId = obj.id;
      article.dataset.gallery = JSON.stringify(obj.gallery); // список фото в галерее
      article.innerHTML = `
        <img src="${IMG_BASE + obj.cover}" alt="${obj.title_ru}" loading="lazy" />
        <div class="overlay">
          <span class="cat" data-ru="${cat.ru}" data-et="${cat.et}">${cat.ru}</span>
          <span class="title" data-ru="${obj.title_ru}" data-et="${obj.title_et}">${obj.title_ru}</span>
          <span class="gallery-count"><i class="fa-solid fa-images"></i> ${obj.gallery.length}</span>
          <span class="price" data-ru="${obj.price_ru}" data-et="${obj.price_et}">${obj.price_ru}</span>
        </div>
      `;
      grid.appendChild(article);
    });

    if (visible === 0) {
      const empty = document.createElement('p');
      empty.id = 'portfolioEmpty';
      empty.className = 'portfolio-empty';
      empty.setAttribute('data-ru', 'В этой категории пока нет работ. Загляните позже!');
      empty.setAttribute('data-et', 'Selles kategoorias pole veel töid. Tulge hiljem tagasi!');
      empty.textContent = 'В этой категории пока нет работ. Загляните позже!';
      grid.appendChild(empty);
    }

    if (window.STUGNUM) STUGNUM.setLang(window.STUGNUM.getLang());
  }

  // Фильтр
  filterEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    filterEl.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render(btn.dataset.filter);
  });

  // =========================================================
  // Lightbox — открывает ГАЛЕРЕЮ конкретного объекта
  // =========================================================
  const lightbox = document.getElementById('lightbox');
  const lbImg = lightbox ? lightbox.querySelector('.lb-img') : null;
  const lbCaption = lightbox ? lightbox.querySelector('.lb-caption') : null;
  const lbCount = lightbox ? lightbox.querySelector('.lb-count') : null;
  const lbClose = lightbox ? lightbox.querySelector('.lb-close') : null;
  const lbPrev = lightbox ? lightbox.querySelector('.lb-prev') : null;
  const lbNext = lightbox ? lightbox.querySelector('.lb-next') : null;

  let lbPhotos = []; // список фото текущего объекта
  let lbIndex = 0;
  let lbTitle = '';

  function openLightbox(objId, photoIdx) {
    if (!lightbox) return;
    const item = grid.querySelector(`[data-obj-id="${objId}"]`);
    if (!item) return;
    try {
      lbPhotos = JSON.parse(item.dataset.gallery || '[]');
    } catch (e) { lbPhotos = []; }
    if (lbPhotos.length === 0) return;
    lbTitle = item.querySelector('.title')?.textContent || '';
    lbIndex = photoIdx || 0;
    showLb();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function showLb() {
    if (!lbPhotos[lbIndex] || !lbImg) return;
    lbImg.src = IMG_BASE + lbPhotos[lbIndex];
    if (lbCaption) lbCaption.textContent = lbTitle;
    if (lbCount) lbCount.textContent = (lbIndex + 1) + ' / ' + lbPhotos.length;
    // Скрыть стрелки если 1 фото
    const single = lbPhotos.length <= 1;
    if (lbPrev) lbPrev.style.display = single ? 'none' : '';
    if (lbNext) lbNext.style.display = single ? 'none' : '';
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function nextLb() {
    if (lbPhotos.length === 0) return;
    lbIndex = (lbIndex + 1) % lbPhotos.length;
    showLb();
  }
  function prevLb() {
    if (lbPhotos.length === 0) return;
    lbIndex = (lbIndex - 1 + lbPhotos.length) % lbPhotos.length;
    showLb();
  }

  // Делегированный клик по карточке
  grid.addEventListener('click', function (e) {
    const item = e.target.closest('.portfolio-item');
    if (!item) return;
    e.preventDefault();
    e.stopPropagation();
    openLightbox(item.dataset.objId, 0);
  });

  if (lbClose) lbClose.addEventListener('click', function (e) { e.stopPropagation(); closeLightbox(); });
  if (lbNext) lbNext.addEventListener('click', function (e) { e.stopPropagation(); nextLb(); });
  if (lbPrev) lbPrev.addEventListener('click', function (e) { e.stopPropagation(); prevLb(); });
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') nextLb();
    else if (e.key === 'ArrowLeft') prevLb();
  });
});
