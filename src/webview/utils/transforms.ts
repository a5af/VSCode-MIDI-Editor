import { ViewState, DEFAULT_PIXELS_PER_SECOND, DEFAULT_NOTE_HEIGHT } from './types';

/**
 * Convert time (seconds) to X pixel coordinate
 */
export function timeToX(time: number, zoom: number): number {
  return time * zoom;
}

/**
 * Convert X pixel coordinate to time (seconds)
 */
export function xToTime(x: number, zoom: number): number {
  return x / zoom;
}

/**
 * Convert MIDI note number to Y pixel coordinate
 * Note: Higher MIDI numbers appear at top (lower Y)
 */
export function midiToY(midi: number, zoom: number, lowestNote: number = 21): number {
  return (127 - midi) * zoom;
}

/**
 * Convert Y pixel coordinate to MIDI note number
 */
export function yToMidi(y: number, zoom: number, lowestNote: number = 21): number {
  return 127 - Math.floor(y / zoom);
}

/**
 * Convert viewport coordinates to canvas coordinates
 */
export function viewportToCanvas(
  viewportX: number,
  viewportY: number,
  scrollX: number,
  scrollY: number
): { x: number; y: number } {
  return {
    x: viewportX + scrollX,
    y: viewportY + scrollY
  };
}

/**
 * Convert canvas coordinates to viewport coordinates
 */
export function canvasToViewport(
  canvasX: number,
  canvasY: number,
  scrollX: number,
  scrollY: number
): { x: number; y: number } {
  return {
    x: canvasX - scrollX,
    y: canvasY - scrollY
  };
}

/**
 * Check if a rectangle is visible in the viewport
 */
export function isRectVisible(
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number,
  viewportX: number,
  viewportY: number,
  viewportWidth: number,
  viewportHeight: number
): boolean {
  return !(
    rectX + rectWidth < viewportX ||
    rectX > viewportX + viewportWidth ||
    rectY + rectHeight < viewportY ||
    rectY > viewportY + viewportHeight
  );
}

/**
 * Calculate grid line positions for time axis
 */
export function calculateTimeGridLines(
  startTime: number,
  endTime: number,
  pixelsPerSecond: number,
  bpm: number = 120
): { time: number; type: 'beat' | 'bar' }[] {
  const lines: { time: number; type: 'beat' | 'bar' }[] = [];
  const secondsPerBeat = 60 / bpm;
  const secondsPerBar = secondsPerBeat * 4;

  // Snap to nearest beat
  const startBeat = Math.floor(startTime / secondsPerBeat);
  const endBeat = Math.ceil(endTime / secondsPerBeat);

  for (let beat = startBeat; beat <= endBeat; beat++) {
    const time = beat * secondsPerBeat;
    const type = beat % 4 === 0 ? 'bar' : 'beat';
    lines.push({ time, type });
  }

  return lines;
}

/**
 * Calculate grid line positions for pitch axis
 */
export function calculatePitchGridLines(
  lowestMidi: number,
  highestMidi: number
): { midi: number; type: 'white' | 'black' }[] {
  const lines: { midi: number; type: 'white' | 'black' }[] = [];

  for (let midi = lowestMidi; midi <= highestMidi; midi++) {
    const semitone = midi % 12;
    const isBlack = [1, 3, 6, 8, 10].includes(semitone);
    lines.push({ midi, type: isBlack ? 'black' : 'white' });
  }

  return lines;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Check if point is inside rectangle
 */
export function pointInRect(
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * Check if two rectangles intersect
 */
export function rectsIntersect(
  r1x: number,
  r1y: number,
  r1w: number,
  r1h: number,
  r2x: number,
  r2y: number,
  r2w: number,
  r2h: number
): boolean {
  return !(
    r1x + r1w < r2x ||
    r1x > r2x + r2w ||
    r1y + r1h < r2y ||
    r1y > r2y + r2h
  );
}
