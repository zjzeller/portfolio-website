// Shared chart colors. Recharts draws SVG and needs literal color values
// (CSS variables are not reliable inside SVG attributes), so these mirror
// the tokens in globals.css. Change the palette here and every chart follows.
export const CHART = {
  accent: '#8fb3e0', // primary series (steel blue); also Jaylen Brown
  second: '#4fbf7f', // comparison series (lighter Celtics green); Jayson Tatum
  grid: '#222b36', // gridlines
  axis: '#2e3947', // tooltip borders
  muted: '#7f8a99', // tick labels
  text: '#e6e9ee', // tooltip text
  surface: '#161c24', // tooltip background and dot outlines
  cursorFill: 'rgba(143, 179, 224, 0.08)', // hover band behind bars
}

// Sequential ramp for heatmaps: one hue (steel blue), dark to light.
// On a dark background, "more" = lighter. Values above `max` share the top color
// so one extreme cohort doesn't wash out every other row.
const HEAT_STOPS: [number, [number, number, number]][] = [
  [0, [30, 39, 52]], // near the background
  [0.35, [60, 92, 135]],
  [0.7, [143, 179, 224]], // site accent
  [1, [236, 242, 250]], // near white
]

export function heatColor(value: number, max: number): string {
  const x = Math.min(Math.max(value / max, 0), 1)
  for (let i = 1; i < HEAT_STOPS.length; i++) {
    const [b, cb] = HEAT_STOPS[i]
    const [a, ca] = HEAT_STOPS[i - 1]
    if (x <= b) {
      const k = (x - a) / (b - a)
      const c = ca.map((v, j) => Math.round(v + (cb[j] - v) * k))
      return `rgb(${c.join(',')})`
    }
  }
  return 'rgb(236,242,250)'
}

// CSS gradient for the heatmap legend, built from the same stops
export const HEAT_GRADIENT = `linear-gradient(90deg, ${HEAT_STOPS.map(
  ([p, c]) => `rgb(${c.join(',')}) ${p * 100}%`
).join(', ')})`
