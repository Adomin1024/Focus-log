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

  const input = 'mt-1 w-full rounded-md border border-slate-500 px-3 py-2'
   return (
    <main className="mx-auto mt-16 max-w-sm px-4">
      <h1 className="font-display text-4xl font-bold text-navy">Focus Log</h1>
      <p className="mt-2 text-slate-700">Time your focus. Keep your habits going.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block font-medium">
          Email
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        </label>
        <label className="block font-medium">
          Password
          <input type="password" required minLength={6} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        </label>
        {msg && <p role="alert" className="text-red-700">{msg}</p>}
        <button disabled={busy} className="w-full rounded-md bg-navy px-4 py-2 font-semibold text-white disabled:opacity-60">
          {mode === 'in' ? 'Sign in' : 'Create account'}
        </button>
      </form>
      <button onClick={() => setMode(mode === 'in' ? 'up' : 'in')} className="mt-4 text-navy underline">
        {mode === 'in' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
      </button>

      <p className="my-6 text-center text-slate-700">or</p>

      <button
        type="button"
        onClick={google}
        className="flex w-full items-center justify-center gap-3 rounded-md border border-slate-500 px-4 py-2 font-semibold text-slate-800 hover:bg-mist"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.1 5.5c4.2-3.8 6.7-9.5 6.7-16.9z" />
          <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.5 2.1-8.8 2.1-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
        </svg>
        Continue with Google
      </button>
    </main>
  )
}