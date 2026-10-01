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

  const link = 'rounded-md px-3 py-2 font-medium text-navy hover:bg-mist'
  const active = { className: 'bg-navy text-white hover:bg-navy' }
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:bg-white focus:p-2">
        Skip to content
      </a>
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-4 px-4 py-3">
          <span className="font-display text-2xl font-bold text-navy">Focus Log</span>
          <nav aria-label="Main" className="flex gap-1">
            <Link to="/" className={link} activeProps={active} activeOptions={{ exact: true }}>Timer</Link>
            <Link to="/habits" className={link} activeProps={active}>Habits</Link>
            <Link to="/weekly" className={link} activeProps={active}>Week</Link>
          </nav>
          <button onClick={() => supabase.auth.signOut()} className="ml-auto rounded-md px-3 py-2 text-slate-700 underline">
            Sign out
          </button>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
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
