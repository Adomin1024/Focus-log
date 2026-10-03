import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import { chime } from './chime'

export type Mode = 'focus' | 'break'
export type Row = { id: string; kind: Mode; duration_sec: number; created_at: string }

export const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n) || lo))

type Ctx = {
  work: number; rest: number; mode: Mode; left: number; total: number; running: boolean
  rows: Row[]; error: string
  /** bumps whenever sessions or habits change, so summary panels can refetch */
  version: number; bump: () => void
  setWork: (n: number) => void; setRest: (n: number) => void
  toggle: () => void; reset: () => void
}
const TimerCtx = createContext<Ctx | null>(null)
export function useTimer() {
  const c = useContext(TimerCtx)
  if (!c) throw new Error('useTimer must be used inside TimerProvider')
  return c
}

/** Lives above the routes so the countdown keeps running while you switch pages. */
export function TimerProvider({ children }: { children: ReactNode }) {
  const [work, setWorkState] = useState(25)
  const [rest, setRestState] = useState(5)
  const [mode, setMode] = useState<Mode>('focus')
  const total = (mode === 'focus' ? work : rest) * 60
  const [left, setLeft] = useState(total)
  const [running, setRunning] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [version, setVersion] = useState(0)
  const endRef = useRef(0)
  const bump = useCallback(() => setVersion((v) => v + 1), [])

  const load = useCallback(async () => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const { data, error } = await supabase
      .from('sessions').select('id,kind,duration_sec,created_at')
      .gte('created_at', start.toISOString()).order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setRows(data as Row[])
    bump()
  }, [bump])
  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!running) return
    const id = setInterval(async () => {
      const l = Math.max(0, Math.round((endRef.current - Date.now()) / 1000))
      setLeft(l)
      if (l > 0) return
      clearInterval(id)
      setRunning(false)
      const { error } = await supabase.from('sessions').insert({ kind: mode, duration_sec: total })
      if (error) setError(error.message)
      chime()
      setToast(mode === 'focus' ? 'Focus session logged. Time for a break!' : 'Break logged. Ready to focus?')
      const next: Mode = mode === 'focus' ? 'break' : 'focus'
      setMode(next)
      setLeft((next === 'focus' ? work : rest) * 60)
      load()
    }, 250)
    return () => clearInterval(id)
  }, [running, mode, total, work, rest, load])

  useEffect(() => {
    document.title = running ? `${mmss(left)} · Focus Log` : 'Focus Log'
  }, [running, left])
  useEffect(() => () => { document.title = 'Focus Log' }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(t)
  }, [toast])

  const value: Ctx = {
    work, rest, mode, left, total, running, rows, error, version, bump,
    setWork: (n) => { const v = clamp(n, 1, 120); setWorkState(v); if (mode === 'focus' && !running) setLeft(v * 60) },
    setRest: (n) => { const v = clamp(n, 1, 60); setRestState(v); if (mode === 'break' && !running) setLeft(v * 60) },
    toggle: () => {
      if (!running) endRef.current = Date.now() + left * 1000
      setRunning(!running)
    },
    reset: () => { setRunning(false); setLeft(total) },
  }

  return (
    <TimerCtx.Provider value={value}>
      {children}
      <div role="status" className={toast ? 'toast' : 'sr-only'}>{toast}</div>
    </TimerCtx.Provider>
  )
}
