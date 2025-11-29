// script.js — Nej_Studio (панелі, overlay, музика, Soon modal, toast, history)

/* helpers */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

function showToast(text, ms = 3000){
  const t = $('#toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(()=> t.classList.remove('show'), ms);
}

/* ENTRY OVERLAY (go web) */
const entryOverlay = $('#entryOverlay');
const goBtn = $('#goBtn');
const mainContent = $('#mainContent');
if(goBtn){
  goBtn.addEventListener('click', async () => {
    entryOverlay.classList.add('hidden');
    setTimeout(()=> entryOverlay.style.display='none', 420);
    mainContent.setAttribute('aria-hidden','false');
    mainContent.classList.remove('blurred');

    // try autoplay music
    if(window.__NejMusic) {
      try { await window.__NejMusic.play(); showToast('Музика увімкнена'); }
      catch(e){ showToast('Автовідтворення може бути заблоковане'); }
    }
  });
}

/* BACKGROUND MUSIC */
(function initMusic(){
  const audio = new Audio('music.mp3');
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.34;
  window.__NejMusic = audio;

  const musicBtn = $('#musicControl');
  if(musicBtn){
    const setIcon = (isPlaying) => musicBtn.textContent = isPlaying ? '⏸' : '▶';
    musicBtn.addEventListener('click', async () => {
      if(audio.paused){
        try { await audio.play(); setIcon(true); showToast('Музика увімкнена'); }
        catch(e){ showToast('Натисніть ще раз, щоб дозволити відтворення'); }
      } else {
        audio.pause(); setIcon(false); showToast('Музика вимкнена');
      }
    });
  }
})();

/* PANEL SYSTEM (header nav => full-screen panel switching)
   - uses panelContainer and panels with data-panel attributes
   - supports browser history (pushState) so user can press Back
*/
const panelContainer = document.getElementById('panelContainer');
const panels = $$('.panel');
const navButtons = $$('.nav-btn');
const panelCloseButtons = $$('.panel-close');

function openPanel(name, push = true){
  const panel = panels.find(p => p.dataset.panel === name);
  if(!panel || !panelContainer) return;
  // show container
  panelContainer.setAttribute('aria-hidden','false');
  // hide other panels
  panels.forEach(p => p.style.display = (p === panel ? 'block' : 'none'));
  // accessibility
  panelContainer._previouslyFocused = document.activeElement;
  panel.setAttribute('tabindex','-1');
  panel.focus();
  // hide main content visually but keep background
  mainContent.setAttribute('aria-hidden','true');
  // push history
  if(push) history.pushState({panel:name}, '', `#${name}`);
}

function closePanels(push = true){
  if(!panelContainer) return;
  panelContainer.setAttribute('aria-hidden','true');
  // restore main content
  mainContent.setAttribute('aria-hidden','false');
  if(panelContainer._previouslyFocused) panelContainer._previouslyFocused.focus();
  if(push) history.pushState({}, '', window.location.pathname);
}

/* wire nav buttons */
navButtons.forEach(b=>{
  b.addEventListener('click', (e)=>{
    const name = b.dataset.panel;
    openPanel(name, true);
  });
});

/* panel close */
panelCloseButtons.forEach(btn=>{
  btn.addEventListener('click', ()=> closePanels(true));
});

/* close by clicking outside panel */
if(panelContainer){
  panelContainer.addEventListener('click', (e)=>{
    if(e.target === panelContainer) closePanels(true);
  });
}

/* handle back/forward */
window.addEventListener('popstate', (e)=>{
  if(e.state && e.state.panel){
    // open panel from state
    openPanel(e.state.panel, false);
  } else {
    // no panel in state -> close
    closePanels(false);
  }
});

/* on load: if URL has hash open panel */
document.addEventListener('DOMContentLoaded', ()=>{
  const hash = location.hash.replace('#','');
  if(hash){
    // small timeout to allow layout
    setTimeout(()=> openPanel(hash, false), 120);
  }
});

/* SOON modal (focus trap, ESC, backdrop) */
const soonBtn = $('#soonBtn');
const soonModal = $('#soonModal');
const closeSoon = $('#closeSoon');

function openModal(modal){
  if(!modal) return;
  modal.setAttribute('aria-hidden','false');
  modal.style.display = 'flex';
  modal._previouslyFocused = document.activeElement;
  const focusable = modal.querySelectorAll('a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])');
  modal._focusable = Array.from(focusable);
  if(modal._focusable.length) modal._focusable[0].focus();
  modal._handleKey = (e)=>{
    if(e.key !== 'Tab') return;
    const f = modal._focusable; const idx = f.indexOf(document.activeElement);
    if(e.shiftKey){
      if(idx === 0){ e.preventDefault(); f[f.length-1].focus(); }
    } else {
      if(idx === f.length-1){ e.preventDefault(); f[0].focus(); }
    }
  };
  document.addEventListener('keydown', modal._handleKey);
  showToast('Відкрито');
}

function closeModal(modal){
  if(!modal) return;
  modal.setAttribute('aria-hidden','true');
  modal.style.display = 'none';
  try{ if(modal._previouslyFocused) modal._previouslyFocused.focus(); }catch(e){}
  if(modal._handleKey) { document.removeEventListener('keydown', modal._handleKey); modal._handleKey = null; }
  showToast('Закрито');
}

if(soonBtn && soonModal){
  soonBtn.addEventListener('click', ()=> openModal(soonModal));
  if(closeSoon) closeSoon.addEventListener('click', ()=> closeModal(soonModal));
  soonModal.addEventListener('click', (e)=> { if(e.target === soonModal) closeModal(soonModal); });
  document.addEventListener('keydown', (e)=> { if(e.key === 'Escape' && soonModal.getAttribute('aria-hidden') === 'false') closeModal(soonModal); });
}

/* smooth anchor behaviour for internal links in main content */
$$('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const href = a.getAttribute('href');
    if(href.length > 1){
      e.preventDefault();
      const target = document.querySelector(href);
      if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });
});

/* ensure a #toast exists */
if(!$('#toast')) {
  const t = document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t);
}
