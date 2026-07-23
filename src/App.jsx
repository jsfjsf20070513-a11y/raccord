import {
  Suspense,
  createContext,
  lazy,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import PageLoading from './components/PageLoading'
import WorldProvider from './context/WorldProvider'
import { hasEnteredCarnet } from './context/world-context'
import Enter from './pages/Enter'
import Home from './pages/Home'
import './App.css'

const Resources = lazy(() => import('./pages/Resources'))
const ResourceCurate = lazy(() => import('./pages/ResourceCurate'))
const ManageHub = lazy(() => import('./pages/ManageHub'))
const Login = lazy(() => import('./pages/Login'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Testimonials = lazy(() => import('./pages/Testimonials'))
const Recueil = lazy(() => import('./pages/Recueil'))
const Vocabulary = lazy(() => import('./pages/Vocabulary'))
const Assistant = lazy(() => import('./pages/Assistant'))

const LOADING_FADE_DURATION = 180
const INITIAL_LOADING_DURATION = 760
const ROUTE_LOADING_DURATION = 180
const RESOURCE_LOADING_DURATION = 110
const RESOURCE_INTERNAL_LOADING_DURATION = 60
const MAX_LOADING_DURATION = 2200
const RETURNING_LOADING_FACTOR = 0.27

const RouteLoadingContext = createContext({
  pathname: '/',
  markRouteReady: () => {},
})

function scaleLoadingDuration(duration, factor) {
  return Math.max(0, Math.round(duration * factor))
}

function isResourcePath(pathname = '') {
  return pathname.startsWith('/resources')
}

function resolveRouteLoadingDuration(pathname, previousPathname, isInitialLoad, factor = 1.0) {
  if (isInitialLoad) {
    const elapsedSinceBoot = Date.now() - (window.__MATH_CLASS_BOOT_STARTED_AT__ || Date.now())
    const remainingInitialDuration = Math.max(
      0,
      INITIAL_LOADING_DURATION - elapsedSinceBoot,
    )

    return scaleLoadingDuration(remainingInitialDuration, factor)
  }

  if (isResourcePath(pathname) && isResourcePath(previousPathname)) {
    return scaleLoadingDuration(RESOURCE_INTERNAL_LOADING_DURATION, factor)
  }

  if (isResourcePath(pathname)) {
    return scaleLoadingDuration(RESOURCE_LOADING_DURATION, factor)
  }

  return scaleLoadingDuration(ROUTE_LOADING_DURATION, factor)
}

function RouteReadySignal() {
  const { pathname, markRouteReady } = useContext(RouteLoadingContext)

  useEffect(() => {
    markRouteReady(pathname)
  }, [markRouteReady, pathname])

  return null
}

function ReadyPage({ children }) {
  return (
    <>
      <RouteReadySignal />
      {children}
    </>
  )
}

function DeferredPage({ children }) {
  const location = useLocation()

  return (
    <Suspense fallback={<PageLoading pathname={location.pathname} />}>
      <ReadyPage>{children}</ReadyPage>
    </Suspense>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/enter" element={<ReadyPage><Enter /></ReadyPage>} />
      <Route path="/" element={<Layout />}>
        <Route index element={<ReadyPage><Home /></ReadyPage>} />
        <Route path="recueil" element={<DeferredPage><Recueil /></DeferredPage>} />
        <Route path="testimonials" element={<DeferredPage><Testimonials /></DeferredPage>} />
        {/* Web3 已退役；旧书签进入只读的来源附录。 */}
        <Route path="witness" element={<Navigate to="/testimonials" replace />} />
        <Route path="hackathon" element={<Navigate to="/testimonials" replace />} />
        <Route path="web3-profile" element={<Navigate to="/testimonials" replace />} />
        <Route path="web3-student-profile" element={<Navigate to="/testimonials" replace />} />
        <Route path="gallery" element={<Navigate to="/" replace />} />
        <Route path="gallery/contribute" element={<Navigate to="/" replace />} />
        <Route path="album/*" element={<Navigate to="/" replace />} />
        <Route path="class-info" element={<Navigate to="/" replace />} />
        <Route path="timeline/*" element={<Navigate to="/" replace />} />
        <Route path="announcements/*" element={<Navigate to="/" replace />} />
        <Route path="vocabulary" element={<DeferredPage><Vocabulary /></DeferredPage>} />
        <Route path="assistant" element={<DeferredPage><Assistant /></DeferredPage>} />
        <Route path="resources" element={<DeferredPage><Resources /></DeferredPage>} />
        <Route path="resources/curate" element={<DeferredPage><ResourceCurate /></DeferredPage>} />
        {/* 资源详情页已下线(资源直接外链);旧 /resources/:id 链接回资源目录。 */}
        <Route path="resources/:id" element={<Navigate to="/resources" replace />} />
        {/* 协作收敛为「寄语墙 + 资源增补」;材料桌 / 审核中心已下线,旧 /atelier/* 与 /manage/* 链接回协作页。 */}
        <Route path="atelier" element={<DeferredPage><ManageHub /></DeferredPage>} />
        <Route path="atelier/materials" element={<Navigate to="/atelier" replace />} />
        <Route path="atelier/review" element={<Navigate to="/atelier" replace />} />
        <Route path="manage" element={<Navigate to="/atelier" replace />} />
        <Route path="manage/materials" element={<Navigate to="/atelier" replace />} />
        <Route path="manage/review" element={<Navigate to="/atelier" replace />} />
        <Route path="login" element={<DeferredPage><Login /></DeferredPage>} />
        <Route path="reset-password" element={<DeferredPage><ResetPassword /></DeferredPage>} />
        <Route path="404" element={<DeferredPage><NotFound /></DeferredPage>} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}

function EntryGate() {
  const location = useLocation()
  const bypassEntrance = location.pathname === '/enter'
    || location.pathname === '/login'
    || location.pathname === '/reset-password'

  if (!bypassEntrance && !hasEnteredCarnet()) {
    return <Navigate to="/enter" state={{ from: `${location.pathname}${location.search}` }} replace />
  }

  return <AppRoutes />
}

function RoutedExperience() {
  const location = useLocation()
  const [loadingPhase, setLoadingPhase] = useState('visible')
  const isFirstLoadRef = useRef(true)
  const previousPathnameRef = useRef(location.pathname)
  const activePathnameRef = useRef(location.pathname)
  const minVisibleUntilRef = useRef(Date.now())
  const timerRef = useRef({ leave: 0, hide: 0, safety: 0 })
  const isReturningVisitorRef = useRef(hasEnteredCarnet())
  const loadingTimingRef = useRef({
    fadeDuration: LOADING_FADE_DURATION,
    maxDuration: MAX_LOADING_DURATION,
  })

  const clearLoadingTimers = useCallback(() => {
    window.clearTimeout(timerRef.current.leave)
    window.clearTimeout(timerRef.current.hide)
    window.clearTimeout(timerRef.current.safety)
  }, [])

  const scheduleLoadingExit = useCallback((pathname) => {
    if (pathname !== activePathnameRef.current) {
      return
    }

    const remaining = Math.max(0, minVisibleUntilRef.current - Date.now())

    window.clearTimeout(timerRef.current.leave)
    window.clearTimeout(timerRef.current.hide)
    window.clearTimeout(timerRef.current.safety)

    timerRef.current.leave = window.setTimeout(() => {
      if (pathname === activePathnameRef.current) {
        setLoadingPhase('leaving')
      }
    }, remaining)

    const { fadeDuration } = loadingTimingRef.current

    timerRef.current.hide = window.setTimeout(() => {
      if (pathname === activePathnameRef.current) {
        setLoadingPhase('hidden')
      }
    }, remaining + fadeDuration)
  }, [])

  const markRouteReady = useCallback((pathname) => {
    if (pathname !== activePathnameRef.current) {
      return
    }

    scheduleLoadingExit(pathname)
  }, [scheduleLoadingExit])

  useLayoutEffect(() => {
    clearLoadingTimers()

    const isInitialLoad = isFirstLoadRef.current
    isFirstLoadRef.current = false
    const previousPathname = previousPathnameRef.current
    const isReturning = isInitialLoad && isReturningVisitorRef.current
    const factor = isReturning ? RETURNING_LOADING_FACTOR : 1.0
    const visibleDuration = resolveRouteLoadingDuration(location.pathname, previousPathname, isInitialLoad, factor)
    previousPathnameRef.current = location.pathname
    activePathnameRef.current = location.pathname
    minVisibleUntilRef.current = Date.now() + visibleDuration
    loadingTimingRef.current = {
      fadeDuration: scaleLoadingDuration(LOADING_FADE_DURATION, factor),
      maxDuration: scaleLoadingDuration(MAX_LOADING_DURATION, factor),
    }

    setLoadingPhase('visible')
    timerRef.current.safety = window.setTimeout(() => {
      if (location.pathname !== activePathnameRef.current) {
        return
      }

      scheduleLoadingExit(location.pathname)
    }, Math.max(visibleDuration, loadingTimingRef.current.maxDuration))

    return () => {
      clearLoadingTimers()
    }
  }, [clearLoadingTimers, location.pathname, scheduleLoadingExit])

  const routeLoadingValue = useMemo(
    () => ({
      pathname: location.pathname,
      markRouteReady,
    }),
    [location.pathname, markRouteReady],
  )

  return (
    <RouteLoadingContext.Provider value={routeLoadingValue}>
      <>
        <ScrollToTop />
        {loadingPhase !== 'hidden' && !['/', '/enter'].includes(location.pathname) ? (
          <PageLoading
            fullscreen
            isLeaving={loadingPhase === 'leaving'}
            pathname={location.pathname}
          />
        ) : null}
        <EntryGate />
      </>
    </RouteLoadingContext.Provider>
  )
}

function App() {
  return (
    <WorldProvider>
      <BrowserRouter>
        <RoutedExperience />
      </BrowserRouter>
    </WorldProvider>
  )
}

export default App
