// Обработка формы: для демо показываем успех, но код подготовлен для отправки на сервис
(function () {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form) return;

  // Кастомный статус загрузки файлов
  const filesInput = document.getElementById('filesInput');
  const filesStatus = document.getElementById('filesStatus');
  if (filesInput && filesStatus) {
    const defaultText = {
      ru: 'Файл не выбран',
      et: 'Faili ei ole valitud'
    };
    const selectedText = {
      ru: (n) => n === 1 ? 'Выбран 1 файл' : (n < 5 ? `Выбрано ${n} файла` : `Выбрано ${n} файлов`),
      et: (n) => n === 1 ? 'Valitud 1 fail' : `Valitud ${n} faili`
    };
    filesInput.addEventListener('change', () => {
      const n = filesInput.files.length;
      const lang = STUGNUM.getLang();
      filesStatus.textContent = n > 0 ? selectedText[lang](n) : defaultText[lang];
      filesStatus.style.color = n > 0 ? 'var(--color-accent)' : '';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    // Имитация отправки. В проде заменить на fetch к Formspree / Web3Forms / свой бэкенд
    // Пример для Formspree: await fetch('https://formspree.io/f/YOUR_ID', { method:'POST', body: new FormData(form) });
    await new Promise(r => setTimeout(r, 800));

    status.className = 'form-status success';
    status.textContent = STUGNUM.getLang() === 'et'
      ? 'Täname pöördumise eest! Võtame teiega ühendust esimesel võimalusel.'
      : 'Благодарим за обращение. Свяжемся с Вами при первой возможности!';
    form.reset();
    // Сброс статуса загрузки
    if (filesStatus) {
      filesStatus.textContent = STUGNUM.getLang() === 'et' ? 'Faili ei ole valitud' : 'Файл не выбран';
      filesStatus.style.color = '';
    }
    btn.disabled = false;
    btn.innerHTML = originalText;

    // Прокрутить к сообщению
    status.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
