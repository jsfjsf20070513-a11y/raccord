import { useLayoutEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import WorldProvider from '../shared/world/WorldProvider'
import { useWorld } from '../shared/world/useWorld'
import Entrance from '../entrance/Entrance'
import PoincareChapter from '../chapters/poincare/PoincareChapter'
import usePoincareSky from '../chapters/poincare/usePoincareSky'
import WorkLayout from './WorkLayout'
import NotFound from './NotFound'

function WorkRoutes() {
  const { pathname } = useLocation()
  useLayoutEffect(() => { window.scrollTo(0, 0) }, [pathname])
  const { hasEntered } = useWorld()
  // The artifact survives a visit to the entrance, even without localStorage.
  const poincare = usePoincareSky()
  return (
    <Routes>
      <Route path="/enter" element={<Entrance />} />
      <Route element={<WorkLayout />}>
        <Route path="/" element={hasEntered
          ? <PoincareChapter poincare={poincare} />
          : <Navigate to="/enter" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <WorldProvider><WorkRoutes /></WorldProvider>
    </BrowserRouter>
  )
}
