import { createRootRoute, createRoute, createRouter, Link, Outlet } from '@tanstack/react-router'
import { useAuth } from './lib/auth'
import { supabase, configured } from './lib/supabase'
import Login from './pages/Login'
import Timer from './pages/Timer'
import Habits from './pages/Habits'
import Weekly from './pages/Weekly'

function Layout() {
  if (!configured) return <p className="p-8" role="alert">Missing Supabase settings. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file, then restart npm run dev.</p>
  const { session, loading } = useAuth()
  if (loading) return <p className="p-8" role="status">Loading…</p>
  if (!session) return <Login />

  const tab = 'flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-sm font-bold text-white'
const active = { className: 'bg-white text-ink' }
return (
  <>
    <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:rounded focus:bg-white focus:p-2 focus:text-ink">Skip to content</a>
    <header className="mx-auto flex max-w-md justify-end px-5 pt-4">
      <button onClick={() => supabase.auth.signOut()} className="pill-ghost !py-1 text-sm">Sign out</button>
    </header>
    <main id="main" className="mx-auto max-w-md px-5 pb-28 pt-4">
      <Outlet />
    </main>
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 bg-black/30 backdrop-blur">
      <div className="mx-auto flex max-w-md gap-2 px-4 py-2">
        <Link to="/" className={tab} activeProps={active} activeOptions={{ exact: true }}><span aria-hidden="true">⏱️</span>Timer</Link>
        <Link to="/habits" className={tab} activeProps={active}><span aria-hidden="true">✅</span>Habits</Link>
        <Link to="/weekly" className={tab} activeProps={active}><span aria-hidden="true">📊</span>Week</Link>
      </div>
    </nav>
  </>
)
}

const root = createRootRoute({ component: Layout })
const routeTree = root.addChildren([
  createRoute({ getParentRoute: () => root, path: '/', component: Timer }),
  createRoute({ getParentRoute: () => root, path: '/habits', component: Habits }),
  createRoute({ getParentRoute: () => root, path: '/weekly', component: Weekly }),
])

export const router = createRouter({ routeTree })
declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
