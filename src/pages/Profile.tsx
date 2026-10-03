import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Sprite, TOMATO } from '../lib/pixel'

export default function Profile() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const email = session?.user.email ?? ''
  const [stats, setStats] = useState({ sessions: 0, minutes: 0, habits: 0 })
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState({ text: '', ok: false })

  useEffect(() => {
    ;(async () => {
      const [s, h] = await Promise.all([
        supabase.from('sessions').select('duration_sec').eq('kind', 'focus'),
        supabase.from('habits').select('id', { count: 'exact', head: true }),
      ])
      const rows = s.data ?? []
      setStats({ sessions: rows.length, minutes: Math.round(rows.reduce((a, r) => a + r.duration_sec, 0) / 60), habits: h.count ?? 0 })
    })()
  }, [])

  async function changePw(e: FormEvent) {
    e.preventDefault()
    if (pw.length < 8) return setMsg({ text: 'Use at least 8 characters.', ok: false })
    const { error } = await supabase.auth.updateUser({ password: pw })
    setMsg(error ? { text: error.message, ok: false } : { text: 'Password updated.', ok: true })
    if (!error) setPw('')
  }

  const joined = session?.user.created_at ? new Date(session.user.created_at).toLocaleDateString([], { dateStyle: 'long' }) : ''
  return (
    <>
      <h1 className="mb-6 text-3xl">Profile</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="panel flex flex-col items-center text-center" style={{ animationDelay: '.05s' }}>
          <div className="avatar xl">{email.charAt(0).toUpperCase()}</div>
          <h2 className="mt-5 break-all text-lg">{email}</h2>
          {joined && <p className="text-muted">Member since {joined}</p>}
          <button className="btn btn-danger mt-5" onClick={async () => { await supabase.auth.signOut(); navigate({ to: '/' }) }}>Sign out</button>
        </section>
        <section className="panel lg:col-span-2" style={{ animationDelay: '.15s' }}>
          <h2 className="text-2xl">Your totals</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="stat"><b>{stats.sessions}</b>focus sessions</div>
            <div className="stat"><b>{stats.minutes}</b>minutes focused</div>
            <div className="stat"><b>{stats.habits}</b>habits tracked</div>
          </div>
          <div className="mt-4 flex justify-center"><Sprite rows={TOMATO} scale={7} /></div>
        </section>
        <section className="panel lg:col-span-3" style={{ animationDelay: '.25s' }}>
          <h2 className="text-2xl">Change password</h2>
          <form onSubmit={changePw} className="mt-3 flex flex-wrap items-center gap-2">
            <label className="min-w-64 flex-1"><span className="sr-only">New password</span>
              <input type="password" autoComplete="new-password" placeholder="New password (8+ characters)" value={pw} onChange={(e) => setPw(e.target.value)} className="input" />
            </label>
            <button className="btn btn-yel">Update password</button>
          </form>
          <p role="alert" className={`mt-2 min-h-6 ${msg.ok ? 'text-good' : 'text-bad'}`}>{msg.text}</p>
        </section>
      </div>
    </>
  )
}
