// script.js — оновлений: smooth anchors, overlay, music, pricing panel, soon modal, toast

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* Toast helper */
function showToast(text, ms = 3000){
  let toast = $('#toast');
  if(!toast){
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> toast.classList.remove('show'), ms);
}

/* ENTRY OVERLAY */
const entryOverlay = $('#entryOverlay');
const goBtn = $('#goBtn');
const mainContent = $('#mainContent');

if(goBtn && entryOverlay && mainContent){
  goBtn.addEventListener('click', async () => {
    entryOverlay.classList.add('hidden');
    setTimeout(()=> entryOverlay.style.display='none', 420);
    mainContent.setAttribute('aria-hidden','false');
    mainContent.classList.remove('blurred');

    if(window.__NejMusic){
      try { await window.__NejMusic.play(); showToast('Музика увімкнена'); }
      catch(e){ showToast('Автовідтворення може бути заблоковане'); }
    }
  });
}

/* MUSIC */
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

/* SMOOTH ANCHOR SCROLL (для nav links та будь-яких #) */
$$('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const href = a.getAttribute('href');
    if(!href || href.length <= 1) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if(target){
      // close panels if open
      const panelContainer = $('#panelContainer');
      if(panelContainer && panelContainer.getAttribute('aria-hidden') === 'false'){
        panelContainer.setAttribute('aria-hidden','true');
        $$('.panel').forEach(p=> p.style.display='none');
        mainContent.setAttribute('aria-hidden','false');
      }
      target.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });
});

/* PRICING PANEL (openMore function) */
const panelContainer = $('#panelContainer');
const panels = $$('.panel');
const panelCloseButtons = $$('.panel-close');

function openPanel(name, push = true){
  if(!panelContainer) return;
  const panel = panels.find(p => p.dataset.panel === name);
  if(!panel) return;
  panelContainer.setAttribute('aria-hidden','false');
  panels.forEach(p => p.style.display = (p === panel ? 'block' : 'none'));
  mainContent.setAttribute('aria-hidden','true');
  if(push) history.pushState({panel:name}, '', `#${name}`);
}

function closePanels(push = true){
  if(!panelContainer) return;
  panelContainer.setAttribute('aria-hidden','true');
  panels.forEach(p => p.style.display='none');
  mainContent.setAttribute('aria-hidden','false');
  if(push) history.pushState({}, '', window.location.pathname);
}

function openMore(panelName='pricing'){
  openPanel(panelName, true);
}

panelCloseButtons.forEach(btn => btn.addEventListener('click', ()=> closePanels(true)));
if(panelContainer){
  panelContainer.addEventListener('click', (e)=> { if(e.target === panelContainer) closePanels(true); });
}

/* history handling for panel */
window.addEventListener('popstate', (e)=>{
  if(e.state && e.state.panel){
    openPanel(e.state.panel, false);
  } else {
    closePanels(false);
  }
});

/* On load: if hash equals panel name, open it; otherwise scroll to section if hash */
document.addEventListener('DOMContentLoaded', ()=>{
  const hash = location.hash.replace('#','');
  if(hash){
    const panelExists = panels.find(p => p.dataset.panel === hash);
    if(panelExists) setTimeout(()=> openPanel(hash,false), 120);
    else {
      const target = document.getElementById(hash);
      if(target) setTimeout(()=> target.scrollIntoView({behavior:'smooth', block:'start'}), 120);
    }
  }
});

/* SOON modal (focus-trap, ESC) */
const soonBtn = $('#soonBtn');
const soonModal = $('#soonModal');
const closeSoon = $('#closeSoon');

function openModal(modal){
  if(!modal) return;
  modal.setAttribute('aria-hidden','false');
  modal.style.display='flex';
  modal._previouslyFocused = document.activeElement;
  const focusable = modal.querySelectorAll('a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])');
  modal._focusable = Array.from(focusable);
  if(modal._focusable.length) modal._focusable[0].focus();
  modal._handleKey = (e)=>{ if(e.key !== 'Tab') return; const f = modal._focusable; const idx = f.indexOf(document.activeElement);
    if(e.shiftKey){ if(idx === 0){ e.preventDefault(); f[f.length - 1].focus(); } }
    else { if(idx === f.length - 1){ e.preventDefault(); f[0].focus(); } } };
  document.addEventListener('keydown', modal._handleKey);
  showToast('Відкрито');
}

function closeModal(modal){
  if(!modal) return;
  modal.setAttribute('aria-hidden','true');
  modal.style.display='none';
  try{ if(modal._previouslyFocused) modal._previouslyFocused.focus(); }catch(e){}
  if(modal._handleKey){ document.removeEventListener('keydown', modal._handleKey); modal._handleKey = null; }
  showToast('Закрито');
}

if(soonBtn && soonModal){
  soonBtn.addEventListener('click', ()=> openModal(soonModal));
  if(closeSoon) closeSoon.addEventListener('click', ()=> closeModal(soonModal));
  soonModal.addEventListener('click', (e)=> { if(e.target === soonModal) closeModal(soonModal); });
  document.addEventListener('keydown', (e)=> { if(e.key === 'Escape' && soonModal.getAttribute('aria-hidden')==='false') closeModal(soonModal); });
}

/* ensure toast exists */
if(!$('#toast')){
  const t = document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t);
}
