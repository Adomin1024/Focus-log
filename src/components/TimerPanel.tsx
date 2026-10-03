import { useTimer, mmss } from '../lib/timer'
import { Sprite, TOMATO } from '../lib/pixel'

export default function TimerPanel() {
  const t = useTimer()
  return (
    <>
      <h2 className="text-2xl">{t.mode === 'focus' ? 'Focus' : 'Break'}</h2>
      <div className="flex justify-center"><Sprite rows={TOMATO} scale={10} fill={1 - t.left / t.total} /></div>
      <p className="time" role="timer" aria-label={`${mmss(t.left)} remaining`}>{mmss(t.left)}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button onClick={t.toggle} className="btn btn-yel">{t.running ? 'Pause' : 'Start'}</button>
        <button onClick={t.reset} className="btn">Reset</button>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-6">
        <label className="block">Focus min
          <input type="number" min={1} max={120} value={t.work} disabled={t.running} onChange={(e) => t.setWork(+e.target.value)} className="input !w-24" />
        </label>
        <label className="block">Break min
          <input type="number" min={1} max={60} value={t.rest} disabled={t.running} onChange={(e) => t.setRest(+e.target.value)} className="input !w-24" />
        </label>
      </div>
    </>
  )
}
