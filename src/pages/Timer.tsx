import TimerPanel from '../components/TimerPanel'
import LogPanel from '../components/LogPanel'

export default function Timer() {
  return (
    <>
      <h1 className="mb-4 text-3xl">Timer</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="panel"><TimerPanel /></section>
        <section className="panel"><LogPanel /></section>
      </div>
    </>
  )
}
