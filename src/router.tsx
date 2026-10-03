import { createRootRoute, createRoute, createRouter, Link, Navigate, Outlet, useNavigate } from '@tanstack/react-router'
import { useAuth } from './lib/auth'
import { supabase, configured } from './lib/supabase'
import { TimerProvider } from './lib/timer'
import { Sprite, TOMATO } from './lib/pixel'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Timer from './pages/Timer'
import Habits from './pages/Habits'
import Weekly from './pages/Weekly'

function Root() {
  const { loading } = useAuth()
  if (!configured) return <p className="p-8" role="alert">Missing Supabase settings. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file, then restart npm run dev.</p>
  if (loading) return <p className="p-8" role="status">Loading…</p>
  return <Outlet />
}

/** Everything behind sign-in. TimerProvider sits here so the timer survives page changes. */
function AppLayout() {
  const { session } = useAuth()
  const navigate = useNavigate()
  if (!session) return <Navigate to="/" />

  const nav = 'btn'
  const active = { className: 'btn btn-yel' }
  return (
    <TimerProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:bg-white focus:p-2 focus:text-black">Skip to content</a>
      <header className="top">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold text-white no-underline"><Sprite rows={TOMATO} scale={3} />Focus Log</Link>
          <nav aria-label="Main" className="flex flex-wrap gap-1">
            <Link to="/dashboard" className={nav} activeProps={active}>Dashboard</Link>
            <Link to="/timer" className={nav} activeProps={active}>Timer</Link>
            <Link to="/habits" className={nav} activeProps={active}>Habits</Link>
            <Link to="/weekly" className={nav} activeProps={active}>Week</Link>
          </nav>
          <span className="ml-auto text-sm text-muted">{session.user.email}</span>
          <button className="btn btn-sm" onClick={async () => { await supabase.auth.signOut(); navigate({ to: '/' }) }}>Sign out</button>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-4 py-8"><Outlet /></main>
    </TimerProvider>
  )
}

function NotFound() {
  return (
    <main className="mx-auto my-24 max-w-md px-4 text-center">
      <h1 className="text-4xl">Page not found</h1>
      <p className="my-4 text-muted">That page doesn’t exist or has moved.</p>
      <Link to="/" className="btn btn-yel">Back to home</Link>
    </main>
  )
}

const root = createRootRoute({ component: Root, notFoundComponent: NotFound })
const app = createRoute({ getParentRoute: () => root, id: 'app', component: AppLayout })
const routeTree = root.addChildren([
  createRoute({ getParentRoute: () => root, path: '/', component: Landing }),
  createRoute({ getParentRoute: () => root, path: '/signin', component: () => <Login key="in" mode="in" /> }),
  createRoute({ getParentRoute: () => root, path: '/signup', component: () => <Login key="up" mode="up" /> }),
  app.addChildren([
    createRoute({ getParentRoute: () => app, path: '/dashboard', component: Dashboard }),
    createRoute({ getParentRoute: () => app, path: '/timer', component: Timer }),
    createRoute({ getParentRoute: () => app, path: '/habits', component: Habits }),
    createRoute({ getParentRoute: () => app, path: '/weekly', component: Weekly }),
  ]),
])

export const router = createRouter({ routeTree })
declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
