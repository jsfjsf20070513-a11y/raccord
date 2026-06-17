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
import { useAuth } from './context/useAuth'
import { useUserRole } from './hooks/useUserRole'
import Home from './pages/Home'
import './App.css'

const Gallery = lazy(() => import('./pages/Gallery'))
const AlbumDetail = lazy(() => import('./pages/AlbumDetail'))
const HackathonShowcase = lazy(() => import('./pages/HackathonShowcase'))
const Web3StudentProfile = lazy(() => import('./pages/Web3StudentProfile'))
const Resources = lazy(() => import('./pages/Resources'))
const ResourceDetail = lazy(() => import('./pages/ResourceDetail'))
const ResourceCurate = lazy(() => import('./pages/ResourceCurate'))
const ManageHub = lazy(() => import('./pages/ManageHub'))
const MaterialsDesk = lazy(() => import('./pages/MaterialsDesk'))
const ModerationCenter = lazy(() => import('./pages/ModerationCenter'))
const GalleryContribute = lazy(() => import('./pages/GalleryContribute'))
const Login = lazy(() => import('./pages/Login'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const NotFound = lazy(() => import('./pages/NotFound'))
const SolanaWitness = lazy(() => import('./pages/SolanaWitness'))
const Vocabulary = lazy(() => import('./pages/Vocabulary'))

const LOADING_FADE_DURATION = 180
const INITIAL_LOADING_DURATION = 760
const ROUTE_LOADING_DURATION = 180
const RESOURCE_LOADING_DURATION = 110
const RESOURCE_INTERNAL_LOADING_DURATION = 60
const MAX_LOADING_DURATION = 2200
const CARNET_VISITED_KEY = 'carnet_visited'
const RETURNING_LOADING_FACTOR = 0.27

const RouteLoadingContext = createContext({
  pathname: '/',
  markRouteReady: () => {},
})

function hasVisitedCarnet() {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    return window.localStorage.getItem(CARNET_VISITED_KEY) !== null
  } catch {
    return false
  }
}

function rememberCarnetVisited() {
  try {
    window.localStorage.setItem(CARNET_VISITED_KEY, '1')
  } catch {
    // Loading should never fail just because storage is unavailable.
  }
}

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

function AdminRoute({ children }) {
  const location = useLocation()
  const { user } = useAuth()
  const { isAdmin, loading: roleLoading } = useUserRole()

  if (roleLoading) {
    return (
      <ReadyPage>
        <PageLoading pathname={location.pathname} />
      </ReadyPage>
    )
  }

  if (!user) {
    return (
      <ReadyPage>
        <Navigate to="/login" replace />
      </ReadyPage>
    )
  }

  if (!isAdmin) {
    return (
      <ReadyPage>
        <Navigate to="/manage" replace />
      </ReadyPage>
    )
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ReadyPage><Home /></ReadyPage>} />
        <Route path="hackathon" element={<DeferredPage><HackathonShowcase /></DeferredPage>} />
        <Route path="web3-profile" element={<DeferredPage><Web3StudentProfile /></DeferredPage>} />
        <Route path="witness" element={<DeferredPage><SolanaWitness /></DeferredPage>} />
        {/* Backwards-compat: I previously shared /web3-student-profile in convo. Redirect so any saved link still works. */}
        <Route path="web3-student-profile" element={<Navigate to="/web3-profile" replace />} />
        <Route path="class-info" element={<Navigate to="/" replace />} />
        <Route path="gallery" element={<DeferredPage><Gallery /></DeferredPage>} />
        <Route path="gallery/contribute" element={<DeferredPage><GalleryContribute /></DeferredPage>} />
        <Route path="album/:id" element={<DeferredPage><AlbumDetail /></DeferredPage>} />
        <Route path="timeline/*" element={<Navigate to="/" replace />} />
        <Route path="announcements/*" element={<Navigate to="/" replace />} />
        <Route path="vocabulary" element={<DeferredPage><Vocabulary /></DeferredPage>} />
        <Route path="resources" element={<DeferredPage><Resources /></DeferredPage>} />
        <Route path="resources/curate" element={<DeferredPage><ResourceCurate /></DeferredPage>} />
        <Route path="resources/:id" element={<DeferredPage><ResourceDetail /></DeferredPage>} />
        <Route path="manage" element={<DeferredPage><ManageHub /></DeferredPage>} />
        <Route path="manage/materials" element={<DeferredPage><MaterialsDesk /></DeferredPage>} />
        <Route
          path="manage/review"
          element={(
            <AdminRoute>
              <DeferredPage><ModerationCenter /></DeferredPage>
            </AdminRoute>
          )}
        />
        <Route path="login" element={<DeferredPage><Login /></DeferredPage>} />
        <Route path="reset-password" element={<DeferredPage><ResetPassword /></DeferredPage>} />
        <Route path="404" element={<DeferredPage><NotFound /></DeferredPage>} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}

function RoutedExperience() {
  const location = useLocation()
  const [loadingPhase, setLoadingPhase] = useState('visible')
  const isFirstLoadRef = useRef(true)
  const previousPathnameRef = useRef(location.pathname)
  const activePathnameRef = useRef(location.pathname)
  const minVisibleUntilRef = useRef(Date.now())
  const timerRef = useRef({ leave: 0, hide: 0, safety: 0 })
  const isReturningVisitorRef = useRef(hasVisitedCarnet())
  const shouldRememberVisitRef = useRef(!isReturningVisitorRef.current)
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

        if (shouldRememberVisitRef.current) {
          rememberCarnetVisited()
          shouldRememberVisitRef.current = false
          isReturningVisitorRef.current = true
        }
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
        {loadingPhase !== 'hidden' ? (
          <PageLoading
            fullscreen
            isLeaving={loadingPhase === 'leaving'}
            pathname={location.pathname}
          />
        ) : null}
        <AppRoutes />
      </>
    </RouteLoadingContext.Provider>
  )
}

function App() {
  return (
    <>
      <BrowserRouter>
        <RoutedExperience />
      </BrowserRouter>
    </>
  )
}

export default App
