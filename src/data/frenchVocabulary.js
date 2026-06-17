// Seed deck for the bilingual French vocabulary trainer.
//
// Skewed toward the mathematics French a RUC · Suzhou maths student actually
// needs (the class's distinguishing angle), plus enough everyday words to keep
// sessions varied. Every entry is shaped for srsScheduler.cleanFrenchWord:
//   - noun  → requires `gender` ∈ {'m','f'}
//   - verb  → requires `conjugation` (string or object)
//   - id is stable: it is the `word_id` persisted in review_states.

export const frenchVocabulary = [
  // ---- mathematics ----
  { id: 'fr-nombre', french: 'nombre', chinese: '数', pos: 'noun', gender: 'm', tag: 'math', example: 'un nombre premier' },
  { id: 'fr-fonction', french: 'fonction', chinese: '函数', pos: 'noun', gender: 'f', tag: 'math', example: 'une fonction continue' },
  { id: 'fr-derivee', french: 'dérivée', chinese: '导数', pos: 'noun', gender: 'f', tag: 'math', example: 'la dérivée seconde' },
  { id: 'fr-integrale', french: 'intégrale', chinese: '积分', pos: 'noun', gender: 'f', tag: 'math', example: 'une intégrale définie' },
  { id: 'fr-ensemble', french: 'ensemble', chinese: '集合', pos: 'noun', gender: 'm', tag: 'math', example: 'un ensemble vide' },
  { id: 'fr-demonstration', french: 'démonstration', chinese: '证明', pos: 'noun', gender: 'f', tag: 'math', example: 'une démonstration par récurrence' },
  { id: 'fr-theoreme', french: 'théorème', chinese: '定理', pos: 'noun', gender: 'm', tag: 'math', example: 'le théorème des valeurs intermédiaires' },
  { id: 'fr-limite', french: 'limite', chinese: '极限', pos: 'noun', gender: 'f', tag: 'math', example: 'la limite d’une suite' },
  { id: 'fr-matrice', french: 'matrice', chinese: '矩阵', pos: 'noun', gender: 'f', tag: 'math', example: 'une matrice inversible' },
  { id: 'fr-equation', french: 'équation', chinese: '方程', pos: 'noun', gender: 'f', tag: 'math', example: 'résoudre une équation' },
  { id: 'fr-demontrer', french: 'démontrer', chinese: '证明（动词）', pos: 'verb', tag: 'math', conjugation: 'je démontre · il démontre · nous démontrons', example: 'démontrer une inégalité' },
  { id: 'fr-resoudre', french: 'résoudre', chinese: '求解', pos: 'verb', tag: 'math', conjugation: 'je résous · il résout · nous résolvons', example: 'résoudre le système' },
  { id: 'fr-converger', french: 'converger', chinese: '收敛', pos: 'verb', tag: 'math', conjugation: 'la suite converge · elles convergent', example: 'la série converge' },

  // ---- everyday ----
  { id: 'fr-livre', french: 'livre', chinese: '书', pos: 'noun', gender: 'm', tag: 'général', example: 'un livre de maths' },
  { id: 'fr-ecole', french: 'école', chinese: '学校', pos: 'noun', gender: 'f', tag: 'général', example: 'aller à l’école' },
  { id: 'fr-question', french: 'question', chinese: '问题', pos: 'noun', gender: 'f', tag: 'général', example: 'poser une question' },
  { id: 'fr-comprendre', french: 'comprendre', chinese: '理解', pos: 'verb', tag: 'général', conjugation: 'je comprends · il comprend · nous comprenons', example: 'je comprends la preuve' },
  { id: 'fr-apprendre', french: 'apprendre', chinese: '学习', pos: 'verb', tag: 'général', conjugation: 'j’apprends · il apprend · nous apprenons', example: 'apprendre le français' },
  { id: 'fr-ecrire', french: 'écrire', chinese: '写', pos: 'verb', tag: 'général', conjugation: 'j’écris · il écrit · nous écrivons', example: 'écrire une rédaction' },
  { id: 'fr-difficile', french: 'difficile', chinese: '困难的', pos: 'adjective', tag: 'général', example: 'un exercice difficile' },
  { id: 'fr-clair', french: 'clair', chinese: '清晰的', pos: 'adjective', tag: 'général', example: 'une explication claire' },
]

export default frenchVocabulary
