const root = document.documentElement;
const toggle = document.querySelector('[data-theme-toggle]');
function applyTheme(theme) {
  root.dataset.theme = theme;
  toggle.textContent = theme === 'dark' ? toggle.dataset.light : toggle.dataset.dark;
  toggle.setAttribute('aria-pressed', String(theme === 'light'));
}
try { applyTheme(localStorage.getItem('arc-theme') === 'light' ? 'light' : 'dark'); }
catch { applyTheme('dark'); }
toggle.hidden = false;
toggle.addEventListener('click', () => {
  const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  try { localStorage.setItem('arc-theme', theme); } catch { /* Still works for this page. */ }
});
// Preserve the current section when changing languages; both pages also work without JS.
const language = document.querySelector('[data-language]');
language.addEventListener('click', () => {
  language.hash = location.hash;
});

// The public site keeps the seal interaction completely silent.
const seal=document.querySelector('[data-seal]');
const drawing=seal.querySelector('svg');
const sealHint=document.querySelector('[data-seal-hint]');
seal.disabled=false;
sealHint.textContent=sealHint.dataset.ready;
seal.addEventListener('click',()=>{
  drawing.classList.remove('seal-drawing');
  void drawing.getBoundingClientRect();
  drawing.classList.add('seal-drawing');
});
