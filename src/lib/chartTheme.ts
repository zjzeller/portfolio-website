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
