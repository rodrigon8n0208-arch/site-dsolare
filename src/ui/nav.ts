export function initNav(): void {
  const header = document.getElementById('header');
  const solid = () => header?.classList.toggle('is-solid', scrollY > 24);
  addEventListener('scroll', solid, { passive: true });
  solid();

  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  const setOpen = (open: boolean) => {
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  btn.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      setOpen(false);
      btn.focus();
    }
  });
}
