import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

type Mode = 'focus' | 'break'
type Row = { id: string; kind: Mode; duration_sec: number; created_at: string }

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export default function Timer() {
  const [work, setWork] = useState(25)
  const [rest, setRest] = useState(5)
  const [mode, setMode] = useState<Mode>('focus')
  const total = (mode === 'focus' ? work : rest) * 60
  const [left, setLeft] = useState(total)
  const [running, setRunning] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState('')
  const endRef = useRef(0)

  const load = useCallback(async () => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const { data, error } = await supabase
      .from('sessions').select('id,kind,duration_sec,created_at')
      .gte('created_at', start.toISOString()).order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setRows(data as Row[])
  }, [])
  useEffect(() => { load() }, [load])

  useEffect(() => { if (!running) setLeft(total) }, [total, running])

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
      setMode(mode === 'focus' ? 'break' : 'focus')
      load()
    }, 250)
    return () => clearInterval(id)
  }, [running, mode, total, load])

  function toggle() {
    if (!running) endRef.current = Date.now() + left * 1000
    setRunning(!running)
  }

  const focusMin = Math.round(rows.filter((r) => r.kind === 'focus').reduce((a, r) => a + r.duration_sec, 0) / 60)
  const num = 'mt-1 w-24 rounded-md border border-slate-500 px-2 py-1'

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-navy">{mode === 'focus' ? 'Focus' : 'Break'}</h1>
      <p className="mt-6 text-center font-display text-8xl font-bold tabular-nums text-navy" role="timer" aria-label={`${mmss(left)} remaining`}>
        {mmss(left)}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={toggle} className="rounded-md bg-teal px-6 py-2 text-lg font-semibold text-white">
          {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={() => { setRunning(false); setLeft(total) }} className="rounded-md border border-navy px-6 py-2 text-lg font-semibold text-navy">
          Reset
        </button>
      </div>

      <fieldset className="mt-10 flex gap-6 rounded-lg bg-mist p-4" disabled={running}>
        <legend className="px-1 font-semibold text-navy">Lengths (minutes)</legend>
        <label>Focus
          <input type="number" min={1} max={120} value={work} onChange={(e) => setWork(Math.max(1, +e.target.value || 1))} className={`block ${num}`} />
        </label>
        <label>Break
          <input type="number" min={1} max={60} value={rest} onChange={(e) => setRest(Math.max(1, +e.target.value || 1))} className={`block ${num}`} />
        </label>
      </fieldset>

      <h2 className="mt-10 text-xl font-semibold text-navy">Today: {focusMin} min focused</h2>
      {error && <p role="alert" className="mt-2 text-red-700">{error}</p>}
      {rows.length === 0 ? (
        <p className="mt-2 text-slate-700">No sessions yet. Start the timer to log your first one.</p>
      ) : (
        <ul className="mt-2 divide-y divide-slate-200">
          {rows.map((r) => (
            <li key={r.id} className="flex justify-between py-2">
              <span className="capitalize">{r.kind}, {Math.round(r.duration_sec / 60)} min</span>
              <time dateTime={r.created_at} className="text-slate-700">
                {new Date(r.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
