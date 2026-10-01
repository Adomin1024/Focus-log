import { useEffect, useState } from 'react'
import { supabase, dayKey, daysAgo } from '../lib/supabase'

type Day = { key: string; label: string; focusMin: number; done: number }

export default function Weekly() {
  const [days, setDays] = useState<Day[]>([])
  const [habitCount, setHabitCount] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      const from = daysAgo(6)
      from.setHours(0, 0, 0, 0)
      const [s, c, h] = await Promise.all([
        supabase.from('sessions').select('duration_sec,created_at').eq('kind', 'focus').gte('created_at', from.toISOString()),
        supabase.from('habit_checks').select('day').gte('day', dayKey(from)),
        supabase.from('habits').select('id', { count: 'exact', head: true }),
      ])
      const err = s.error ?? c.error ?? h.error
      if (err) return setError(err.message)
      setHabitCount(h.count ?? 0)
      setDays(
        Array.from({ length: 7 }, (_, i) => {
          const d = daysAgo(6 - i)
          const key = dayKey(d)
          return {
            key,
            label: d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
            focusMin: Math.round((s.data ?? []).filter((r) => dayKey(new Date(r.created_at)) === key).reduce((a, r) => a + r.duration_sec, 0) / 60),
            done: (c.data ?? []).filter((r) => r.day === key).length,
          }
        }),
      )
    })()
  }, [])

  const maxMin = Math.max(30, ...days.map((d) => d.focusMin))
  const totalMin = days.reduce((a, d) => a + d.focusMin, 0)

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-navy">Last 7 days</h1>
      {error && <p role="alert" className="mt-2 text-red-700">{error}</p>}
      <p className="mt-2 text-slate-700">{totalMin} minutes focused this week.</p>
      <table className="mt-6 w-full text-left">
        <caption className="sr-only">Focus minutes and habits completed per day</caption>
        <thead>
          <tr className="border-b border-slate-300 text-navy">
            <th scope="col" className="py-2">Day</th>
            <th scope="col">Focus</th>
            <th scope="col" className="text-right">Habits</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.key} className="border-b border-slate-200">
              <th scope="row" className="py-3 pr-3 font-medium">{d.label}</th>
              <td className="w-1/2">
                <div className="flex items-center gap-2">
                  <div className="h-3 rounded bg-teal" style={{ width: `${(d.focusMin / maxMin) * 100}%`, minWidth: d.focusMin ? 4 : 0 }} aria-hidden="true" />
                  <span>{d.focusMin} min</span>
                </div>
              </td>
              <td className="text-right">{d.done}/{habitCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
