export const PAL: Record<string, string> = {
  c: 'currentColor', r: '#e5483b', R: '#ff8a7a', g: '#3fae4a', G: '#1f7a2e',
  w: '#f2f4ff', b: '#1e90ff', y: '#ffc933',
}
// Greyed-out colours used for the "unripe" part of the timer tomato
const GREY: Record<string, string> = { r: '#4a4f78', R: '#5b6190', g: '#3d5a4a', G: '#2f4a3b' }

export const TOMATO = ['....gg....', '..gggGg...', '.rrrgGrrr.', 'rrRrrrrrrr', 'rRrrrrrrrr', 'rrrrrrrrrr', '.rrrrrrrr.', '..rrrrrr..']
export const LOGI = ['wwwwwwww', 'wbbbbwww', 'wwwwwwww', 'wbbbbbbw', 'wwwwwwww', 'wbbbwwww', 'wwwwwwww']
export const CHECK = ['......gg', 'g....gg.', 'gg..gg..', '.gggg...', '..gg....']
export const BARS = ['......yy', '....yyyy', '....yyyy', '..yyyyyy', '..yyyyyy', 'yyyyyyyy', 'yyyyyyyy']
export const CHEV = ['cc...', '.cc..', '..cc.', '...cc', '..cc.', '.cc..', 'cc...']
export const mirror = (rows: string[]) => rows.map((r) => [...r].reverse().join(''))

/** Pixel sprite. `fill` (0..1) colours the sprite from the bottom up; the rest is greyed. */
export function Sprite({ rows, scale = 6, fill }: { rows: string[]; scale?: number; fill?: number }) {
  const cut = fill === undefined ? 0 : Math.round(rows.length * (1 - fill))
  return (
    <svg width={rows[0].length * scale} height={rows.length * scale} viewBox={`0 0 ${rows[0].length} ${rows.length}`} shapeRendering="crispEdges" aria-hidden="true">
      {rows.flatMap((r, y) =>
        [...r].map((c, x) => {
          const f = y >= cut ? PAL[c] : GREY[c]
          return f ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={f} /> : null
        }),
      )}
    </svg>
  )
}
