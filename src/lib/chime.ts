/** Three-note chime played when a session ends. Silently does nothing if audio is blocked. */
export function chime() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const a = new AC()
    const t = a.currentTime
    ;[660, 880, 1320].forEach((f, i) => {
      const o = a.createOscillator()
      const g = a.createGain()
      o.type = 'square'
      o.frequency.value = f
      o.connect(g)
      g.connect(a.destination)
      g.gain.setValueAtTime(0.06, t + i * 0.12)
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.11)
      o.start(t + i * 0.12)
      o.stop(t + i * 0.12 + 0.12)
    })
  } catch {
    /* audio unavailable */
  }
}
