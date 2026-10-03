import { useTimer } from '../lib/timer'

export default function LogPanel() {
  const { rows, error } = useTimer()
  const focusMin = Math.round(rows.filter((r) => r.kind === 'focus').reduce((a, r) => a + r.duration_sec, 0) / 60)
  return (
    <>
      <h2 className="text-2xl">Today: {focusMin} min focused</h2>
      {error && <p role="alert" className="mt-2 text-bad">{error}</p>}
      {rows.length === 0 ? (
        <p className="mt-2 text-muted">No sessions yet. Start the timer to log your first one.</p>
      ) : (
        <ul className="mt-2">
          {rows.map((r) => (
            <li key={r.id} className="logrow">
              <span className="capitalize">{r.kind}, {Math.round(r.duration_sec / 60)} min</span>
              <time dateTime={r.created_at} className="text-muted">
                {new Date(r.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
