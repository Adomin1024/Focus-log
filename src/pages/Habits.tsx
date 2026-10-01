import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { supabase, dayKey, daysAgo } from '../lib/supabase'

type Habit = { id: string; name: string }
type Check = { habit_id: string; day: string }

function streak(days: Set<string>) {
  let n = 0
  let i = days.has(dayKey()) ? 0 : 1 // an unchecked today doesn't break the streak yet
  while (days.has(dayKey(daysAgo(i)))) { n++; i++ }
  return n
}

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [checks, setChecks] = useState<Check[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const today = dayKey()

  const load = useCallback(async () => {
    const [h, c] = await Promise.all([
      supabase.from('habits').select('id,name').order('created_at'),
      supabase.from('habit_checks').select('habit_id,day').gte('day', dayKey(daysAgo(400))),
    ])
    const err = h.error ?? c.error
    if (err) setError(err.message)
    else { setHabits(h.data as Habit[]); setChecks(c.data as Check[]) }
  }, [])
  useEffect(() => { load() }, [load])

  async function add(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const { error } = await supabase.from('habits').insert({ name: name.trim() })
    if (error) setError(error.message)
    setName('')
    load()
  }

  async function toggle(h: Habit, done: boolean) {
    const { error } = done
      ? await supabase.from('habit_checks').delete().eq('habit_id', h.id).eq('day', today)
      : await supabase.from('habit_checks').insert({ habit_id: h.id, day: today })
    if (error) setError(error.message)
    load()
  }

  async function remove(h: Habit) {
    if (!confirm(`Delete "${h.name}" and its history?`)) return
    await supabase.from('habits').delete().eq('id', h.id)
    load()
  }

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold text-white">Today's habits</h1>
      {error && <p role="alert" className="mt-2 text-cream">{error}</p>}
      {habits.length === 0 && <p className="mt-4 text-cream">No habits yet. Add one below.</p>}
      <ul className="mt-4 space-y-2">
        {habits.map((h) => {
          const days = new Set(checks.filter((c) => c.habit_id === h.id).map((c) => c.day))
          const done = days.has(today)
          const s = streak(days)
          return (
            <li key={h.id} className="card !p-3 flex items-center gap-3">
              <label className="flex flex-1 items-center gap-3 text-lg">
                <input type="checkbox" checked={done} onChange={() => toggle(h, done)} className="size-7 accent-peach" />
                <span className={done ? 'text-cream line-through' : ''}>{h.name}</span>
              </label>
              <span className="font-semibold text-white" aria-label={`${s} day streak`}>🔥 {s}</span>
              <button onClick={() => remove(h)} className="rounded px-2 py-1 text-white font-semibold" aria-label={`Delete ${h.name}`}>Delete</button>
            </li>
          )
        })}
      </ul>
      <form onSubmit={add} className="mt-8 flex gap-2">
        <label className="flex-1">
          <span className="sr-only">New habit</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="New habit, e.g. Read 20 pages" className="w-full rounded-full bg-white px-5 py-3 text-ink placeholder:text-slate-600" />
        </label>
        <button className="pill !px-6 !py-3 !text-base">Add habit</button>
      </form>
    </>
  )
}
