(function () {
  const list = document.getElementById('faqList');
  if (!list) return;
  list.addEventListener('click', (e) => {
    const item = e.target.closest('.faq-item');
    if (!item) return;
    const wasOpen = item.classList.contains('open');
    list.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
  // Открываем первый вопрос по умолчанию
  list.querySelector('.faq-item')?.classList.add('open');
})();
