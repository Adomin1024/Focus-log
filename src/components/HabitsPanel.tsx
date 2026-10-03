import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { supabase, dayKey, daysAgo } from '../lib/supabase'
import { useTimer } from '../lib/timer'

type Habit = { id: string; name: string }
type Check = { habit_id: string; day: string }

function streak(days: Set<string>) {
  let n = 0
  let i = days.has(dayKey()) ? 0 : 1 // an unchecked today doesn't break the streak yet
  while (days.has(dayKey(daysAgo(i)))) { n++; i++ }
  return n
}

export default function HabitsPanel() {
  const { bump } = useTimer()
  const [habits, setHabits] = useState<Habit[]>([])
  const [checks, setChecks] = useState<Check[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const today = dayKey()

  const load = useCallback(async () => {
    const [h, c] = await Promise.all([
      supabase.from('habits').select('id,name').order('created_at'),
      supabase.from('habit_checks').select('habit_id,day').gte('day', dayKey(daysAgo(400))),
    ])
    const err = h.error ?? c.error
    if (err) setError(err.message)
    else { setHabits(h.data as Habit[]); setChecks(c.data as Check[]) }
    bump()
  }, [bump])
  useEffect(() => { load() }, [load])

  async function add(e: FormEvent) {
    e.preventDefault()
    const v = name.trim()
    if (!v) return setError('Type a habit name first.')
    if (habits.some((h) => h.name.toLowerCase() === v.toLowerCase())) return setError('You already track that habit.')
    setError('')
    const { error } = await supabase.from('habits').insert({ name: v })
    if (error) return setError(error.message)
    setName('')
    load()
  }

  async function toggle(h: Habit, done: boolean) {
    const { error } = done
      ? await supabase.from('habit_checks').delete().eq('habit_id', h.id).eq('day', today)
      : await supabase.from('habit_checks').insert({ habit_id: h.id, day: today })
    setError(error ? error.message : '')
    load()
  }

  async function remove(h: Habit) {
    const { error } = await supabase.from('habits').delete().eq('id', h.id)
    setError(error ? error.message : '')
    setConfirmId(null)
    load()
  }

  return (
    <>
      <h2 className="text-2xl">Today’s habits</h2>
      {habits.length === 0 && <p className="mt-2 text-muted">No habits yet. Add one below.</p>}
      <ul>
        {habits.map((h) => {
          const days = new Set(checks.filter((c) => c.habit_id === h.id).map((c) => c.day))
          const done = days.has(today)
          const s = streak(days)
          return (
            <li key={h.id} className="habit">
              <label className="flex flex-1 items-center gap-3">
                <input type="checkbox" checked={done} onChange={() => toggle(h, done)} />
                <span className={done ? 'text-muted line-through' : ''}>{h.name}</span>
              </label>
              <span className={`font-bold ${s >= 7 ? 'text-orange-400' : s >= 3 ? 'text-gold' : ''}`}>{s} day{s === 1 ? '' : 's'}</span>
              {confirmId === h.id ? (
                <>
                  <button onClick={() => remove(h)} className="btn btn-sm btn-danger">Yes, delete</button>
                  <button onClick={() => setConfirmId(null)} className="btn btn-sm">Keep</button>
                </>
              ) : (
                <button onClick={() => setConfirmId(h.id)} className="btn btn-sm btn-danger" aria-label={`Delete ${h.name}`}>Delete</button>
              )}
            </li>
          )
        })}
      </ul>
      <form onSubmit={add} className="mt-4 flex items-center gap-2">
        <label className="flex-1">
          <span className="sr-only">New habit</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="New habit, e.g. Drink water" className="input" />
        </label>
        <button className="btn btn-yel">Add</button>
      </form>
      <p role="alert" className="mt-2 min-h-6 text-bad">{error}</p>
    </>
  )
}
