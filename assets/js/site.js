/* =========================================================
   STUGNUM — site.js
   Общий скрипт для всех страниц:
   - header / footer / cookie-баннер (вставляются в #header-slot / #footer-slot)
   - переключение языка RU / ET по data-атрибутам
   - мобильное меню, кнопка «Наверх», sticky header
   - scroll-reveal, счётчики, плавная прокрутка к якорям
   Подключается с defer, поэтому DOM уже разобран.
   ========================================================= */

const STUGNUM = (() => {
  const LANGS = ['ru', 'et'];

  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* private mode */ } },
  };

  function getLang() {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (LANGS.includes(fromUrl)) return fromUrl;
    const saved = store.get('stugnum-lang');
    return LANGS.includes(saved) ? saved : 'ru';
  }

  const t = (ru, et) => (getLang() === 'et' ? et : ru);

  // Пары атрибутов data-ru-* / data-et-* → свойство элемента
  const I18N_ATTRS = [
    ['', 'textContent'],
    ['-html', 'innerHTML'],
    ['-placeholder', 'placeholder'],
    ['-title', 'title'],
  ];

  function setLang(lang) {
    if (!LANGS.includes(lang)) lang = 'ru';
    store.set('stugnum-lang', lang);
    document.documentElement.lang = lang;
    I18N_ATTRS.forEach(([suffix, prop]) => {
      document.querySelectorAll(`[data-ru${suffix}]`).forEach((el) => {
        el[prop] = el.getAttribute(`data-${lang}${suffix}`) ?? el.getAttribute(`data-ru${suffix}`);
      });
    });
    const toggle = document.getElementById('langToggle');
    if (toggle) toggle.textContent = lang === 'et' ? 'RU' : 'ET';
  }

  // '' для корня, '../' для /docs/ и /services/
  function getBase() {
    return /\/(docs|services)\//.test(window.location.pathname) ? '../' : '';
  }

  const NAV = [
    ['home', 'index.html', 'Главная', 'Avaleht'],
    ['services', 'services.html', 'Услуги', 'Teenused'],
    ['portfolio', 'portfolio.html', 'Работы', 'Tööd'],
    ['faq', 'faq.html', 'FAQ', 'KKK'],
    ['docs', 'docs.html', 'Документы', 'Dokumendid'],
    ['contact', 'contact.html', 'Контакты', 'Kontakt'],
  ];

  const PHONE = '+372 550 3347';
  const PHONE_HREF = 'tel:+3725503347';
  const EMAIL = 'lehtlad.vvood@gmail.com';
  const ADDRESS = 'Sõnajala 4-2, Ahtme linnaosa,<br/>31027 Kohtla-Järve, Ida-Virumaa';
  const FACEBOOK = 'https://www.facebook.com/vvod.lehtlad';

  const logo = (base, extraClass = '') => `
    <a href="${base}index.html" class="logo ${extraClass}">
      <span class="logo-mark" aria-hidden="true">
        <img class="logo-deer-only" src="${base}assets/img/logo-deer.png" alt="" />
      </span>
      <span class="logo-text-stugnum">
        <img class="logo-word-only" src="${base}assets/img/logo-word.png" alt="STUGNUM" />
      </span>
    </a>`;

  // i18n-текст: <tag data-ru data-et>текст</tag>
  const tr = (tag, ru, et, attrs = '') =>
    `<${tag} ${attrs} data-ru="${ru}" data-et="${et}">${t(ru, et)}</${tag}>`;

  function renderHeader(activePage) {
    const slot = document.getElementById('header-slot');
    if (!slot) return;
    const base = getBase();
    // services-besedki → services и т.п.
    const section = (activePage || 'home').split('-')[0];
    const items = NAV.map(([key, href, ru, et]) =>
      `<li class="${key === section ? 'active' : ''}">${tr('a', ru, et, `href="${base}${href}"`)}</li>`
    ).join('');

    slot.innerHTML = `
<header class="site-header" id="siteHeader">
  <div class="container header-inner">
    ${logo(base)}
    <nav class="main-nav" id="mainNav"><ul>${items}</ul></nav>
    <div class="header-actions">
      <button id="langToggle" class="lang-toggle" aria-label="Switch language">${getLang() === 'et' ? 'RU' : 'ET'}</button>
      <a href="${PHONE_HREF}" class="header-phone"><i class="fa-solid fa-phone"></i> ${PHONE}</a>
      <a href="${base}contact.html" class="btn btn-primary btn-sm">
        ${tr('span', 'Оставить заявку', 'Esita tellimus')}
        <i class="fa-solid fa-arrow-right"></i>
      </a>
      <button class="mobile-toggle" id="mobileToggle" aria-label="Menu" aria-expanded="false" aria-controls="mainNav"><i class="fa-solid fa-bars"></i></button>
    </div>
  </div>
</header>`;

    document.getElementById('langToggle').addEventListener('click', () => {
      setLang(getLang() === 'ru' ? 'et' : 'ru');
    });
  }

  function renderFooter() {
    const slot = document.getElementById('footer-slot');
    if (!slot) return;
    const base = getBase();
    slot.innerHTML = `
<footer class="footer footer-compact">
  <div class="container">
    <div class="footer-grid">
      <div>
        ${logo(base, 'footer-logo')}
        ${tr('p',
          'Строим деревянные постройки по всей Эстонии. Беседки, террасы, садовые домики, крыши, фасады. С 2021 года. Гарантия 2 года.',
          'Ehitame puitrajatisi üle Eesti. Lehtlad, terrassid, aiamajad, katused, fassaadid. Alates 2021. 2-aastane garantii.',
          'class="footer-note"')}
      </div>
      <div>
        ${tr('h4', 'Контакты', 'Kontakt')}
        <ul class="footer-list">
          <li><a href="${PHONE_HREF}">${PHONE}</a></li>
          <li class="footer-address">${ADDRESS}</li>
          <li><a href="mailto:${EMAIL}">${EMAIL}</a></li>
        </ul>
      </div>
      <div>
        ${tr('h4', 'Мы в соцсетях', 'Sotsiaalmeedias')}
        <div class="footer-social">
          <a href="${FACEBOOK}" target="_blank" rel="noopener" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} STUGNUM · VVood Lehtlad OÜ</span>
      <span>${tr('a', 'Политика конфиденциальности', 'Privaatsuspoliitika', `href="${base}privacy.html"`)}</span>
    </div>
  </div>
</footer>`;
  }

  function renderCookieBanner() {
    if (store.get('stugnum-cookies-ok')) return;
    document.body.insertAdjacentHTML('beforeend', `
<div id="cookieBanner" class="cookie-banner">
  ${tr('p',
    'Сайт сохраняет в браузере только выбранный язык. Статистика посещений собирается без cookie и без персональных данных.',
    'Sait salvestab brauserisse ainult valitud keele. Külastusstatistikat kogutakse ilma küpsiste ja isikuandmeteta.')}
  ${tr('button', 'Понятно', 'Selge', 'id="cookieAccept"')}
</div>`);
    document.getElementById('cookieAccept').addEventListener('click', () => {
      store.set('stugnum-cookies-ok', '1');
      document.getElementById('cookieBanner').remove();
    });
  }

  return { getLang, setLang, getBase, renderHeader, renderFooter, renderCookieBanner };
})();

/* ---------------------------------------------------------
   UI-поведение. Запускается ПОСЛЕ того, как вставлен header,
   иначе обработчики не найдут #siteHeader / #mobileToggle.
   --------------------------------------------------------- */
function initSiteUI() {
  // Sticky header: тень при прокрутке
  const header = document.getElementById('siteHeader');

  // Кнопка «Наверх»
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.className = 'scroll-top';
  scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
  scrollTopBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(scrollTopBtn);

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (header) header.classList.toggle('is-stuck', y > 30);
      scrollTopBtn.classList.toggle('visible', y > 400);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Мобильное меню
  const nav = document.getElementById('mainNav');
  const toggle = document.getElementById('mobileToggle');
  const setMenu = (open) => {
    if (!nav || !toggle) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  };
  if (nav && toggle) {
    toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('open')) return;
      if (e.target.closest('.main-nav a') || (!nav.contains(e.target) && !toggle.contains(e.target))) setMenu(false);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  }

  // Scroll-reveal: контент видим по умолчанию, анимация — поверх
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach((el) => el.classList.add('is-visible'));
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  // Анимированные счётчики
  const counters = document.querySelectorAll('.counter-num');
  if ('IntersectionObserver' in window && counters.length) {
    const animate = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / 1800, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { animate(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => cio.observe(c));
  }

  // Плавная прокрутка к якорям с учётом фиксированного header
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  STUGNUM.renderHeader(document.body.dataset.page || 'home');
  STUGNUM.renderFooter();
  STUGNUM.renderCookieBanner();
  STUGNUM.setLang(STUGNUM.getLang());
  initSiteUI();
});
