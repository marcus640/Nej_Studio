/* script.js — Nej_Studio
   - controls: entry overlay (go web)
   - background music (play/pause) — optional if music.mp3 exists
   - soon modal (open/close + accessibility: focus trap, ESC)
   - toast feedback
*/

/* ---------- Helpers ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function showToast(text, ms = 3000) {
  let toast = $('#toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), ms);
}

/* ---------- Entry overlay (GO WEB) ---------- */
const entryOverlay = $('#entryOverlay');
const goBtn = $('#goBtn');
const mainContent = $('#mainContent');

if (goBtn && entryOverlay && mainContent) {
  goBtn.addEventListener('click', async () => {
    // fade out
    entryOverlay.classList.add('hidden');
    setTimeout(() => {
      if (entryOverlay.parentNode) entryOverlay.style.display = 'none';
    }, 420);

    // reveal main content
    mainContent.classList.remove('blurred');

    // try play background music if exists (graceful)
    if (window.__NejMusic) {
      try { await window.__NejMusic.play(); showToast('Музика увімкнена'); }
      catch (e) { showToast('Автовідтворення заблоковано — натисніть ▶ у шапці'); }
    }
  });
}

/* ---------- Background music (optional) ---------- */
// We'll attach audio to window.__NejMusic so it's accessible in console if needed
(function initMusic(){
  const audio = new Audio('music.mp3');
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.34;
  window.__NejMusic = audio;

  // If page has a music control button (optional), wire it
  const musicBtn = $('.music-btn');
  if (musicBtn) {
    musicBtn.style.display = 'inline-flex';
    const setIcon = (isPlaying) => musicBtn.textContent = isPlaying ? '⏸' : '▶';
    musicBtn.addEventListener('click', async () => {
      if (audio.paused) {
        try { await audio.play(); setIcon(true); showToast('Музика увімкнена'); }
        catch (e) { showToast('Натисніть ще раз, щоб дозволити відтворення'); }
      } else {
        audio.pause(); setIcon(false); showToast('Музика вимкнена');
      }
    });
  }
})();

/* ---------- Soon Modal (open / close / accessibility) ---------- */
const soonBtn = $('#soonBtn');
const soonModal = $('#soonModal');
const closeSoon = $('#closeSoon');

if (soonBtn && soonModal) {
  // open modal
  soonBtn.addEventListener('click', () => openModal(soonModal, soonBtn) );

  // close buttons
  if (closeSoon) closeSoon.addEventListener('click', () => closeModal(soonModal) );

  // backdrop click closes
  soonModal.addEventListener('click', (e) => {
    if (e.target === soonModal) closeModal(soonModal);
  });

  // ESC key closes and traps focus
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && soonModal.getAttribute('aria-hidden') === 'false') {
      closeModal(soonModal);
    }
  });
}

/* Focus trap implementation */
function openModal(modal, opener) {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'false');
  modal.style.display = 'flex';

  // Save previously focused element to restore later
  modal._previouslyFocused = document.activeElement;

  // Collect focusable elements
  const focusable = modal.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
  modal._focusable = Array.from(focusable);
  if (modal._focusable.length) modal._focusable[0].focus();

  // Trap tab
  modal._handleKey = (e) => {
    if (e.key !== 'Tab') return;
    const f = modal._focusable;
    if (f.length === 0) { e.preventDefault(); return; }
    const idx = f.indexOf(document.activeElement);
    if (e.shiftKey) {
      if (idx === 0) { e.preventDefault(); f[f.length - 1].focus(); }
    } else {
      if (idx === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  };
  document.addEventListener('keydown', modal._handleKey);
  // Announce
  showToast('Відкрито вікно');
}

function closeModal(modal) {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  modal.style.display = 'none';
  // restore focus
  try { if (modal._previouslyFocused) modal._previouslyFocused.focus(); } catch(e){}
  // remove handler
  if (modal._handleKey) { document.removeEventListener('keydown', modal._handleKey); modal._handleKey = null; }
  showToast('Закрито');
}

/* ---------- Smooth anchor scroll for header links ---------- */
$$('header nav a').forEach(a => {
  const href = a.getAttribute('href');
  if (href && href.startsWith('#')) {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({behavior: 'smooth', block:'start'});
    });
  }
});

/* ---------- Defensive: ensure #toast exists in DOM ---------- */
if (!$('#toast')) {
  const t = document.createElement('div');
  t.id = 'toast';
  t.className = 'toast';
  document.body.appendChild(t);
}
