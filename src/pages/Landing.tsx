import { Link } from '@tanstack/react-router'
import { useAuth } from '../lib/auth'
import { Sprite, TOMATO, LOGI, CHECK, BARS, CHEV } from '../lib/pixel'

const TREES: [number, number][] = [[18, 52], [34, 58], [130, 50], [146, 56]]

function Scene() {
  return (
    <svg className="px-scene" viewBox="0 0 160 90" preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" aria-hidden="true">
      <rect width="160" height="90" fill="#27b0e6" />
      <rect y="18" width="160" height="14" fill="#52cbf3" />
      <rect y="32" width="160" height="14" fill="#86e0f8" />
      <polygon points="0,56 14,40 24,46 40,26 56,44 66,36 84,52 100,32 112,42 128,28 144,44 160,38 160,90 0,90" fill="#1d5d78" />
      <polygon points="0,66 20,56 44,64 70,54 100,64 130,54 160,62 160,90 0,90" fill="#4d9a5b" />
      <rect y="72" width="160" height="18" fill="#3b8650" />
      {TREES.map(([x, y]) => (
        <g key={x}>
          <polygon points={`${x},${y} ${x + 5},${y + 11} ${x - 5},${y + 11}`} fill="#1f5a3a" />
          <polygon points={`${x},${y + 4} ${x + 6},${y + 15} ${x - 6},${y + 15}`} fill="#2a7348" />
          <rect x={x - 1} y={y + 15} width="2" height="3" fill="#5b3a1e" />
        </g>
      ))}
      <rect x="22" y="16" width="14" height="3" fill="#fff" /><rect x="26" y="13" width="8" height="3" fill="#fff" />
      <rect x="104" y="10" width="16" height="3" fill="#fff" /><rect x="108" y="7" width="8" height="3" fill="#fff" />
    </svg>
  )
}

const FEATURES = [
  { tag: 'TIMER', title: 'Pomodoro timer', text: 'Set your own focus and break lengths, then start the clock.', art: TOMATO, bg: '#2d5fb8' },
  { tag: 'LOGGING', title: 'Session logging', text: 'Every finished session is saved to your account.', art: LOGI, bg: '#5b3fa0' },
  { tag: 'HABITS', title: 'Daily habit checklist', text: 'Tick habits off each day and build streaks.', art: CHECK, bg: '#2b7a4f' },
  { tag: 'WEEKLY', title: 'Weekly summary', text: 'Focus minutes and habits for each of the last 7 days.', art: BARS, bg: '#a9502a' },
]
const STATS = [
  { big: '1–120', text: 'minutes of focus you can set', color: '#ffc933' },
  { big: '1–60', text: 'minutes of break you can set', color: '#7bd34a' },
  { big: '7', text: 'days in your weekly summary', color: '#a78bfa' },
  { big: 'Private', text: 'each account sees only its own data', color: '#ff5fa2' },
]

export default function Landing() {
  const { session } = useAuth()
  return (
    <div className="px">
      <header className="px-nav">
        <span className="px-logo"><Sprite rows={TOMATO} scale={3} />Focus Log</span>
        <span className="flex-1" />
        {session ? (
          <Link to="/dashboard" className="btn btn-yel">Open dashboard</Link>
        ) : (
          <>
            <Link to="/signin" className="btn btn-ghost">Sign in</Link>
            <Link to="/signup" className="btn btn-yel">Sign up</Link>
          </>
        )}
      </header>

      <main>
        <section className="px-hero">
          <Scene />
          <div className="px-hc">
            <p className="px-kick">START YOUR</p>
            <h1 className="px-h1">Focus Streak</h1>
            <p className="px-sub">A Pomodoro timer and daily habit tracker in one place.</p>
            <Link to={session ? '/dashboard' : '/signup'} className="btn btn-yel btn-lg">{session ? 'Open dashboard' : 'Get started'}</Link>
          </div>
          <div className="px-mascot"><Sprite rows={TOMATO} scale={9} /></div>
        </section>

        <section className="px-sec" id="features">
          <h2 className="px-h2">Everything in Focus Log</h2>
          <div className="px-cards">
            {FEATURES.map((f) => (
              <div className="px-card" key={f.tag}>
                <div className="px-ban" style={{ background: f.bg }}><Sprite rows={f.art} scale={8} /></div>
                <div className="p-4">
                  <span className="px-lab">FEATURE</span>
                  <h3 className="my-1 text-xl">{f.title}</h3>
                  <p className="mb-3 text-[#c3c8e8]">{f.text}</p>
                  <span className="px-pill">{f.tag}</span>
                </div>
              </div>
            ))}
          </div>
          {!session && (
            <p className="mt-9 text-center">
              <Link to="/signup" className="btn btn-blue">Create your account <Sprite rows={CHEV} scale={4} /></Link>
            </p>
          )}
        </section>

        <section className="px-sec !pt-0">
          <div className="px-row">
            <div>
              <h2 className="px-h2 !text-left">Time your focus</h2>
              <p className="px-p">Choose how long you focus and how long you rest. When a session finishes it is logged for you, and the timer moves on to your break.</p>
            </div>
            <div className="px-gold"><div className="px-gi">
              <b>Timer</b> <span className="px-pill gold">Configurable</span>
              <div className="px-term">25:00</div>
              <p className="px-cap">Default lengths: 25 min focus, 5 min break</p>
            </div></div>
          </div>
          <div className="px-row rev">
            <div>
              <h2 className="px-h2 !text-left">Keep your habits going</h2>
              <p className="px-p">Add the habits you care about and tick them off each day. An unchecked today will not break your streak until tomorrow.</p>
            </div>
            <div className="px-gold"><div className="px-gi">
              <b>Habits</b> <span className="px-pill gold">Example</span>
              <p className="mt-3"><i className="pcb on" />Read 20 pages <span className="float-right font-bold">3 days</span></p>
              <p className="mt-1.5"><i className="pcb" />Stretch <span className="float-right font-bold">0 days</span></p>
            </div></div>
          </div>
          <div className="px-row">
            <div>
              <h2 className="px-h2 !text-left">See your week at a glance</h2>
              <p className="px-p">A 7-day summary of focus minutes and habits completed, one row per day.</p>
            </div>
            <div className="px-gold"><div className="px-gi text-center">
              <b>Last 7 days</b>
              <div className="my-3 flex justify-center"><Sprite rows={BARS} scale={10} /></div>
              <p className="px-cap">Focus minutes and habits, day by day</p>
            </div></div>
          </div>
        </section>

        <section className="px-sec !pt-0">
          <div className="px-stats">
            {STATS.map((s) => <div key={s.big}><b style={{ color: s.color }}>{s.big}</b>{s.text}</div>)}
          </div>
        </section>

        <section className="px-sec !pt-0 text-center">
          <h2 className="px-h2 !mb-5">Ready to start your streak?</h2>
          <Link to={session ? '/dashboard' : '/signup'} className="btn btn-yel btn-lg">{session ? 'Open dashboard' : 'Get started'}</Link>
        </section>
      </main>

      <footer className="px-foot">© {new Date().getFullYear()} Focus Log</footer>
    </div>
  )
}
