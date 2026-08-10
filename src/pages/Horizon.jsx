import { useEffect } from 'react'
import useHorizonChapter from '../components/material/useHorizonChapter'
import HorizonCandidateDesktop from '../experiences/desktop/HorizonCandidateDesktop'
import HorizonCandidateMobile from '../experiences/mobile/HorizonCandidateMobile'
import useExperienceMode from '../experiences/shared/useExperienceMode'
import './Horizon.css'

export default function Horizon() {
  const mode = useExperienceMode()
  const chapter = useHorizonChapter()

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'L’horizon immobile'
    document.documentElement.dataset.chapter = 'horizon'

    return () => {
      document.title = previousTitle
      delete document.documentElement.dataset.chapter
    }
  }, [])

  return mode === 'mobile'
    ? <HorizonCandidateMobile chapter={chapter} />
    : <HorizonCandidateDesktop chapter={chapter} />
}
