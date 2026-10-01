import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function google() {
    setMsg('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) setMsg(error.message)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    const { error } =
      mode === 'in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })
    if (error) setMsg(error.message)
    else if (mode === 'up') setMsg('Check your email to confirm your account, then sign in.')
    setBusy(false)
  }

   const input = 'mt-1 w-full rounded-full bg-white px-5 py-3 text-ink'
   return (
    <main className="mx-auto mt-16 max-w-sm px-4">
      <h1 className="font-display text-4xl font-extrabold text-white">Focus Log</h1>
      <p className="mt-2 text-cream">Time your focus. Keep your habits going.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block font-medium">
          Email
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        </label>
        <label className="block font-medium">
          Password
          <input type="password" required minLength={6} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        </label>
        {msg && <p role="alert" className="text-white font-semibold">{msg}</p>}
        <button disabled={busy} className="pill w-full disabled:opacity-60">
          {mode === 'in' ? 'Sign in' : 'Create account'}
        </button>
            </form>

      <p className="my-6 text-center text-slate-700">or</p>

      <button
        type="button"
        onClick={google}
        className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-4 py-3 font-semibold text-ink"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          {/* ...keep the four <path> elements as they are... */}
        </svg>
        Continue with Google
      </button>

      <button
        type="button"
        onClick={() => setMode(mode === 'in' ? 'up' : 'in')}
        className="mt-6 text-navy underline"
      >
        {mode === 'in' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
      </button>
    </main>
  )
}