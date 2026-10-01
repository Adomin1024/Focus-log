import { useCallback, useEffect, useRef, useState } from 'react'
import Alpaca from '../components/Alpaca'
import { supabase } from '../lib/supabase'

type Mode = 'focus' | 'break'
type Row = { id: string; kind: Mode; duration_sec: number; created_at: string }

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

function Chips({ label, value, set, options }: { label: string; value: number; set: (n: number) => void; options: number[] }) {
  return (
    <div className="mt-4">
      <p className="font-bold">{label}</p>
      <div role="radiogroup" aria-label={`${label} length in minutes`} className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {options.map((o) => (
          <button key={o} role="radio" aria-checked={o === value} onClick={() => set(o)}
            className={`chip ${o === value ? 'bg-white text-ink' : 'text-white'}`}>{o}</button>
        ))}
      </div>
    </div>
  )
}

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
  document.body.dataset.mode = mode
  return () => { delete document.body.dataset.mode }
}, [mode])

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
    <Alpaca mood={mode} />
    <h1 className="sr-only">{mode === 'focus' ? 'Focus' : 'Break'} timer</h1>
    <p className="mt-2 text-center text-7xl font-extrabold tabular-nums" role="timer" aria-label={`${mmss(left)} remaining`}>
      {mmss(left)}
    </p>
    <div className="mx-auto mt-4 h-2 max-w-sm overflow-hidden rounded-full bg-white/20" aria-hidden="true">
      <div className="h-full rounded-full bg-peach" style={{ width: `${(1 - left / total) * 100}%` }} />
    </div>

    <div className="mt-6 flex flex-col items-center gap-2">
      <button onClick={toggle} className="pill w-full max-w-sm">
        {running ? 'Pause' : `${mode === 'focus' ? 'Focus' : 'Break'} ${mode === 'focus' ? work : rest} min`}
      </button>
      <button onClick={() => { setRunning(false); setLeft(total) }} className="pill-ghost">Reset</button>
    </div>

    <fieldset className="card mt-8" disabled={running}>
      <legend className="sr-only">Lengths</legend>
      <Chips label="Focus" value={work} set={setWork} options={[15, 20, 25, 30, 45, 50, 60]} />
      <Chips label="Break" value={rest} set={setRest} options={[3, 5, 10, 15]} />
    </fieldset>

    <h2 className="mt-10 text-xl font-extrabold">Today: {focusMin} min focused</h2>
    {error && <p role="alert" className="mt-2 font-semibold">Error: {error}</p>}
    {rows.length === 0 ? (
      <p className="mt-2 text-cream">No sessions yet. Start the timer to log your first one.</p>
    ) : (
      <ul className="card mt-3 divide-y divide-white/20 !py-2">
        {rows.map((r) => (
          <li key={r.id} className="flex justify-between py-2">
            <span className="capitalize">{r.kind}, {Math.round(r.duration_sec / 60)} min</span>
            <time dateTime={r.created_at}>
              {new Date(r.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </time>
          </li>
        ))}
      </ul>
    )}
  </>
)
}
