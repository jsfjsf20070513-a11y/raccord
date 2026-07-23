export const WORLD_NAV = {
  carnet: [],
  plan: [],
  limite: [],
}

export const WORLD_LABELS = {
  carnet: 'N°02 · Le Carnet',
  plan: 'N°01 · PLAN ℝ',
  limite: 'N°03 · Limite',
}

export const WORLD_FOOTERS = {
  carnet: { label: 'Matière secondaire', to: '/', link: 'Retour au Carnet' },
  plan: { label: 'Outil public', to: '/', link: 'Retour au PLAN' },
  limite: { label: 'Outil séparé', to: '/', link: 'Retour à l’instrument' },
}

export function isNavActive(item, pathname) {
  return item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
}
