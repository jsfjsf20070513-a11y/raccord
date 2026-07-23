// Editorial fixtures are retained for design/testing only. They are not
// evidence of class history and must never be merged into the public ledger.
export const editorialTestimonialFixtures = [
  {
    id: 'editorial-01',
    content: '愿我们在巴黎重逢时,还记得在苏州一起证出第一个 Bolzano 的下午。',
    signature: '№ 07',
    date: '12.05.2026',
    source: 'editorial',
  },
  {
    id: 'editorial-02',
    content: 'Trente termes d’une même suite — et j’espère que nous convergeons.',
    signature: 'Léo',
    date: '02.06.2026',
    source: 'editorial',
  },
  {
    id: 'editorial-03',
    content: '谢谢这个班让「有界」和「收敛」变成了我们之间的暗号。',
    signature: '№ 19',
    date: '14.06.2026',
    source: 'editorial',
  },
  {
    id: 'editorial-04',
    content: 'Que l’on nomme avec justesse, que l’on pense avec courage.',
    signature: 'la déléguée',
    date: '21.06.2026',
    source: 'editorial',
  },
  {
    id: 'editorial-05',
    content: '给未来翻到这一页的人:我们真的很认真地在学。',
    signature: '№ 03',
    date: '30.06.2026',
    source: 'editorial',
  },
]

// The only recovered statement with verifiable external provenance. It is a
// technical trace, not a class testimonial.
export const verifiedTechnicalTraces = [
  {
    id: 'solana-anchor-65RxSkm4',
    content: '2026 春季黑客松 — 第一笔从 production 站点写的 anchor',
    signature: 'class_anchor',
    date: '09.05.2026',
    source: 'solana',
    provenance: {
      program: 'Cmv8pnxAaCfo8PtMZowcKTRv85Y5BvT7U2zYfspBC4fu',
      account: '65RxSkm4UtE8tbAknGxRe9LCfDssJtGaAvZAmXDaC2G8',
      author: 'Fo7H3z7r47RSJs7jLLQGdgcShUrdC9o3yWx1fmrigHJQ',
      identityMemoCount: 11,
      accountUrl: 'https://solscan.io/account/65RxSkm4UtE8tbAknGxRe9LCfDssJtGaAvZAmXDaC2G8?cluster=devnet',
      transactionUrl: 'https://solscan.io/tx/TLYjToQBbvDioD8NqByiBxhH6UqSgftss29NJ6LAxSZKTENLYdHFtfYrq27pEXRHZnJUY7H6y7PMjub2Qtmm9vX?cluster=devnet',
    },
  },
]
