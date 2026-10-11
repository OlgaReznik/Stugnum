// Hero-carousel: автоматическое + ручное переключение
document.addEventListener('DOMContentLoaded', function () {
  const carousel = document.getElementById('heroCarousel');
  if (!carousel) return;
  const slides = carousel.querySelectorAll('.hero-slide');
  const dots = carousel.querySelectorAll('.hero-dot');

  if (slides.length === 0 || dots.length === 0) return;

  let current = 0;
  let timer = null;
  const INTERVAL = 5000;

  // первый слайд активный, остальные скрыты
  slides.forEach((s, i) => s.classList.toggle('active', i === 0));

  function goTo(idx) {
    const next = ((idx % slides.length) + slides.length) % slides.length;
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = next;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }
  function startTimer() {
    if (timer) return;
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  }
  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  // Ручное переключение по клику на dot
  dots.forEach((d, i) => {
    d.addEventListener('click', function (e) {
      e.preventDefault();
      stopTimer();
      goTo(i);
      startTimer();
    });
  });

  // Пауза при наведении мыши
  carousel.addEventListener('mouseenter', stopTimer);
  carousel.addEventListener('mouseleave', startTimer);

  // Касание на мобильных
  let touchStartX = 0;
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    stopTimer();
  }, { passive: true });
  carousel.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) goTo(current + 1);
      else goTo(current - 1);
    }
    startTimer();
  }, { passive: true });

  // Стартуем автопереключение
  startTimer();
});

// Карусель под счётчиками — IntersectionObserver для паузы вне видимости
(function () {
  const section = document.querySelector('.carousel-section');
  if (!section) return;
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        section.classList.add('in-view');
      } else {
        section.classList.remove('in-view');
      }
    });
  }, { threshold: 0.1 });
  observer.observe(section);
})();
