import { useEffect, useMemo, useState } from 'react'
import { useWorld } from '../context/useWorld'
import { dailyTheoremNotes } from '../data/dailyTheoremNotes.generated'
import CarnetArchivesDesktop from '../experiences/desktop/carnet/CarnetArchivesDesktop'
import CarnetArchivesMobile from '../experiences/mobile/carnet/CarnetArchivesMobile'
import useExperienceMode from '../experiences/shared/useExperienceMode'

const DAY_IN_MS = 24 * 60 * 60 * 1000
const ROTATION_START_DAY = Math.floor(Date.UTC(2025, 8, 1) / DAY_IN_MS)

const VOLUMES = [
  {
    roman: 'I',
    title: 'Analyse',
    subtitle: '分析 · 极限、连续与积分',
    indices: [0, 1, 2, 7, 8, 9, 20, 21, 22, 23],
  },
  {
    roman: 'II',
    title: 'Algèbre linéaire',
    subtitle: '线性代数 · 空间、矩阵与分解',
    indices: [3, 4, 10, 11, 12, 13, 14],
  },
  {
    roman: 'III',
    title: 'Probabilités',
    subtitle: '概率 · 期望、不等式与极限定律',
    indices: [5, 6, 15, 16, 17, 18, 19],
  },
]

function getTodayIndex() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(new Date())
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)]),
  )
  const serial = Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / DAY_IN_MS)
  const offset = serial - ROTATION_START_DAY
  return ((offset % dailyTheoremNotes.length) + dailyTheoremNotes.length) % dailyTheoremNotes.length
}

export default function Recueil() {
  const { setWorld } = useWorld()
  const mode = useExperienceMode()
  const todayIndex = useMemo(getTodayIndex, [])
  const [selectedIndex, setSelectedIndex] = useState(todayIndex)

  useEffect(() => {
    setWorld('carnet')
  }, [setWorld])

  const Archives = mode === 'mobile' ? CarnetArchivesMobile : CarnetArchivesDesktop
  return (
    <Archives
      volumes={VOLUMES}
      selectedIndex={selectedIndex}
      onSelect={setSelectedIndex}
      todayIndex={todayIndex}
      theorem={(index) => dailyTheoremNotes[index]}
    />
  )
}
