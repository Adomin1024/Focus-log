import { useEffect, useState, type ComponentType } from 'react'
import { useAuth } from '../lib/auth'
import TimerPanel from '../components/TimerPanel'
import HabitsPanel from '../components/HabitsPanel'
import WeeklyPanel from '../components/WeeklyPanel'
import LogPanel from '../components/LogPanel'

type Id = 'timer' | 'habits' | 'weekly' | 'log'
type Item = { id: Id; full: boolean; hide: boolean }
type Action = 'up' | 'down' | 'size' | 'hide'

const DEFAULT: Item[] = [
  { id: 'timer', full: false, hide: false },
  { id: 'habits', full: false, hide: false },
  { id: 'weekly', full: true, hide: false },
  { id: 'log', full: false, hide: false },
]
const TITLE: Record<Id, string> = { timer: 'Timer', habits: 'Habits', weekly: 'Last 7 days', log: 'Today’s sessions' }
const BODY: Record<Id, ComponentType> = { timer: TimerPanel, habits: HabitsPanel, weekly: WeeklyPanel, log: LogPanel }

function read(key: string): Item[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (Array.isArray(v) && v.length === DEFAULT.length && DEFAULT.every((d) => v.some((p: Item) => p.id === d.id))) return v
  } catch { /* fall through */ }
  return DEFAULT
}

export default function Dashboard() {
  const { session } = useAuth()
  const key = `focuslog.layout.${session?.user.id}`
  const [layout, setLayout] = useState<Item[]>(() => read(key))
  const [editing, setEditing] = useState(false)
  const [dragId, setDragId] = useState<Id | null>(null)
  const [over, setOver] = useState<Id | null>(null)

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(layout)) } catch { /* storage unavailable */ }
  }, [key, layout])

  function act(id: Id, a: Action) {
    setLayout((l) => {
      const n = l.map((p) => ({ ...p }))
      const i = n.findIndex((p) => p.id === id)
      if (a === 'size') n[i].full = !n[i].full
      if (a === 'hide') n[i].hide = true
      if (a === 'up' || a === 'down') {
        const vis = n.map((_, k) => k).filter((k) => !n[k].hide)
        const j = vis[vis.indexOf(i) + (a === 'up' ? -1 : 1)]
        if (j !== undefined) [n[i], n[j]] = [n[j], n[i]]
      }
      return n
    })
  }
  function drop(target: Id) {
    if (dragId && dragId !== target) {
      setLayout((l) => {
        const n = [...l]
        const [m] = n.splice(n.findIndex((p) => p.id === dragId), 1)
        n.splice(n.findIndex((p) => p.id === target), 0, m)
        return n
      })
    }
    setDragId(null)
    setOver(null)
  }
  const show = (id: Id) => setLayout((l) => l.map((p) => (p.id === id ? { ...p, hide: false } : p)))

  const hidden = layout.filter((p) => p.hide)
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-3xl">Dashboard</h1>
        <button className={`btn ${editing ? 'btn-yel' : ''}`} aria-pressed={editing} onClick={() => setEditing(!editing)}>
          {editing ? 'Done arranging' : 'Arrange panels'}
        </button>
        <button className="btn btn-sm" onClick={() => setLayout(DEFAULT)}>Reset layout</button>
      </div>
      {editing && hidden.length > 0 && (
        <p className="mb-3">{hidden.map((p) => <button key={p.id} className="btn btn-sm" onClick={() => show(p.id)}>Show {TITLE[p.id]}</button>)}</p>
      )}
      <div className={`grid gap-4 md:grid-cols-2 ${editing ? 'edit' : ''}`}>
        {layout.filter((p) => !p.hide).map((p) => {
          const Body = BODY[p.id]
          return (
            <section
              key={p.id}
              aria-label={TITLE[p.id]}
              className={`panel ${p.full ? 'md:col-span-2' : ''} ${over === p.id ? 'over' : ''}`}
              draggable={editing}
              onDragStart={(e) => { setDragId(p.id); e.dataTransfer.setData('text/plain', p.id) }}
              onDragOver={(e) => { if (editing) { e.preventDefault(); setOver(p.id) } }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => { e.preventDefault(); drop(p.id) }}
            >
              {editing && (
                <div className="mb-3 flex flex-wrap gap-1">
                  <button className="btn btn-sm" onClick={() => act(p.id, 'up')} aria-label={`Move ${TITLE[p.id]} earlier`}>Move earlier</button>
                  <button className="btn btn-sm" onClick={() => act(p.id, 'down')} aria-label={`Move ${TITLE[p.id]} later`}>Move later</button>
                  <button className="btn btn-sm" onClick={() => act(p.id, 'size')} aria-label={`${p.full ? 'Half' : 'Full'} width for ${TITLE[p.id]}`}>{p.full ? 'Half width' : 'Full width'}</button>
                  <button className="btn btn-sm" onClick={() => act(p.id, 'hide')} aria-label={`Hide ${TITLE[p.id]}`}>Hide</button>
                </div>
              )}
              <Body />
            </section>
          )
        })}
      </div>
    </>
  )
}
