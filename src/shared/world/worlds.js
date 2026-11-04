export const WORLDS = [
  { id: 'plan', number: 'N°01', name: 'PLAN ℝ', hero: 'PLAN ℝ' },
  { id: 'carnet', number: 'N°02', name: 'LE CARNET', hero: 'CARNET' },
  { id: 'limite', number: 'N°03', name: 'LIMITE', hero: 'LIMITE' },
]

export const WORLD_IDS = WORLDS.map(({ id }) => id)
export const WORLD_LABELS = Object.fromEntries(WORLDS.map(({ id, number, name }) => [id, `${number} · ${name}`]))
