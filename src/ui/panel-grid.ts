const CELLS = 96;

/** Gera as células do painel de #energia. Começam acesas: o movimento apaga e reacende. */
export function buildPanelGrid(root: ParentNode = document): HTMLElement[] {
  const grid = root.querySelector<HTMLElement>('.panel-grid');
  if (!grid) return [];
  const frag = document.createDocumentFragment();
  for (let i = 0; i < CELLS; i++) {
    const cell = document.createElement('span');
    cell.className = 'cell';
    cell.dataset.lit = 'true';
    frag.append(cell);
  }
  grid.replaceChildren(frag);
  return Array.from(grid.children) as HTMLElement[];
}
