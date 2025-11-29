// script.js — Nej_Studio (оновлено)
// Очікує music.mp3 поруч

const overlay = document.getElementById('entryOverlay');
const goBtn = document.getElementById('goBtn');
const main = document.getElementById('mainContent');
const musicControlWrap = document.getElementById('musicControlWrap');
const musicControl = document.getElementById('musicControl');
const toast = document.getElementById('toast');
const emailLink = document.getElementById('emailLink');

// Підготовка аудіо
const audio = new Audio('music.mp3');
audio.loop = true;
audio.volume = 0.35;
audio.preload = 'auto';

// Відкриття сайту — натискання go
async function enterSite() {
  try {
    await audio.play(); // може бути заблоковано — ловимо помилку нижче
    musicControlWrap.setAttribute('aria-hidden', 'false');
    musicControl.setAttribute('aria-pressed', 'true');
    musicControl.textContent = '❚❚'; // pause symbol
  } catch (err) {
    // Автоплей могли заблокувати — показати повідомлення і все одно відкрити
    showToast('Автовідтворення заблоковане. Натисніть ▶ у правому верхньому куті, щоб увімкнути музику.');
    musicControlWrap.setAttribute('aria-hidden', 'false');
    musicControl.setAttribute('aria-pressed', 'false');
    musicControl.textContent = '▶';
  }

  overlay.classList.add('hidden');
  main.classList.add('revealed');
  // дозволяємо користувачу фокусуватись у контенті
  main.focus();
  // додати пульс до gmail-кнопки
  const gmailBtn = document.querySelector('.contact a');
  if (gmailBtn) gmailBtn.classList.add('pulse');
}

// Клік та клавіатура для goBtn
goBtn.addEventListener('click', enterSite);
goBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    enterSite();
  }
});

// Кнопка керування музикою (глобально)
musicControl.addEventListener('click', async () => {
  if (audio.paused) {
    try {
      await audio.play();
      musicControl.setAttribute('aria-pressed', 'true');
      musicControl.textContent = '❚❚';
      showToast('Музика увімкнена');
    } catch (err) {
      showToast('Натисніть ще раз, щоб дозволити відтворення.');
    }
  } else {
    audio.pause();
    musicControl.setAttribute('aria-pressed', 'false');
    musicControl.textContent = '▶';
    showToast('Музика вимкнена');
  }
});

// Клавіші для play/pause (коли кнопка в фокусі)
musicControl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    musicControl.click();
  }
});

// Показ toast-повідомлення
let toastTimer = null;
function showToast(msg, ms = 3500) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), ms);
}

// зупинка музики якщо сторінка закривається
window.addEventListener('pagehide', () => { try { audio.pause(); } catch(e) {} });

// Якщо користувач клікнув на email-link у мобільному — можна додати короткий feedback
emailLink.addEventListener('click', () => {
  showToast('Відкривається пошта...');
});
