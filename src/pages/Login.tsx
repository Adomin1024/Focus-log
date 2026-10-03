import { useState, type FormEvent } from 'react'
import { Link, Navigate } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { EMAIL, RULES, STRENGTH, level } from '../lib/password'
import { Sprite, TOMATO, CHEV, mirror } from '../lib/pixel'

export default function Login({ mode }: { mode: 'in' | 'up' }) {
  const { session } = useAuth()
  const up = mode === 'up'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean }>({ text: '', ok: false })
  const [busy, setBusy] = useState(false)

  const mail = email.trim().toLowerCase()
  const met = RULES.map((r) => r.test(password, mail))
  const lv = level(met.filter(Boolean).length)
  const same = !!password && password === confirm
  const canSubmit = !busy && (!up || (met.every(Boolean) && same && EMAIL.test(mail)))

  if (session) return <Navigate to="/dashboard" />

  const fail = (text: string) => setMsg({ text, ok: false })

  async function submit(e: FormEvent) {
    e.preventDefault()
    setMsg({ text: '', ok: false })
    if (!EMAIL.test(mail)) return fail('Enter a valid email address, like name@example.com.')
    if (up) {
      const bad = RULES.find((r) => !r.test(password, mail))
      if (bad) return fail(`Password needs: ${bad.label.toLowerCase()}.`)
      if (password !== confirm) return fail('Passwords do not match.')
    }
    setBusy(true)
    const { error } = up
      ? await supabase.auth.signUp({ email: mail, password })
      : await supabase.auth.signInWithPassword({ email: mail, password })
    setBusy(false)
    if (error) fail(error.message)
    else if (up) setMsg({ text: 'Check your email to confirm your account, then sign in.', ok: true })
  }

  async function google() {
    setMsg({ text: '', ok: false })
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/dashboard` } })
    if (error) fail(error.message)
  }

  const pwType = show ? 'text' : 'password'
  return (
    <main className="mx-auto my-12 max-w-sm px-4">
      <div className="panel p-6">
        <Sprite rows={TOMATO} scale={5} />
        <h1 className="mt-2 text-3xl">{up ? 'Create your account' : 'Sign in'}</h1>
        <p className="text-muted">{up ? 'Pick a strong password to protect your streaks.' : 'Welcome back. Pick up where you left off.'}</p>

        <form onSubmit={submit} noValidate className="mt-4">
          <label className="mt-3 block font-semibold">Email
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input mt-1" />
          </label>
          <label className="mt-3 block font-semibold" htmlFor="pw">Password</label>
          <div className="flex items-center gap-1">
            <input id="pw" type={pwType} autoComplete={up ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input min-w-0 flex-1" />
            <button type="button" className="btn btn-sm" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
          </div>

          {up && (
            <>
              <div className="meter" data-l={lv} aria-hidden="true"><i /><i /><i /><i /></div>
              <p className="my-1 text-muted">Strength: {STRENGTH[lv]}</p>
              <ul className="rules">
                {RULES.map((r, i) => (
                  <li key={r.label} className={met[i] ? 'ok' : ''}>{r.label}<span className="sr-only">{met[i] ? ' (met)' : ' (not met)'}</span></li>
                ))}
              </ul>
              <label className="mt-3 block font-semibold">Confirm password
                <input type={pwType} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input mt-1" />
              </label>
              <p className="my-1 min-h-6 text-muted">{confirm ? (same ? 'Passwords match.' : 'Passwords do not match yet.') : ''}</p>
            </>
          )}

          <p role="alert" className={`my-2 min-h-6 ${msg.ok ? 'text-good' : 'text-bad'}`}>{msg.text}</p>
          <button disabled={!canSubmit} className="btn btn-yel w-[calc(100%-8px)]">{up ? 'Create account' : 'Sign in'}</button>
        </form>

        <div className="mt-4 grid gap-1">
          <Link to={up ? '/signin' : '/signup'} className="btn w-[calc(100%-8px)]">
            {up ? 'Have an account? Sign in' : 'Need an account? Sign up'} <Sprite rows={CHEV} scale={3} />
          </Link>
          <Link to="/" className="btn btn-ghost w-[calc(100%-8px)]"><Sprite rows={mirror(CHEV)} scale={3} /> Back to home</Link>
        </div>

        <p className="my-4 text-center text-muted">or</p>
        <button type="button" onClick={google} className="btn w-[calc(100%-8px)]">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.1 5.5c4.2-3.8 6.7-9.5 6.7-16.9z" />
            <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.5 2.1-8.8 2.1-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
          </svg>
          Continue with Google
        </button>
      </div>
    </main>
  )
}
