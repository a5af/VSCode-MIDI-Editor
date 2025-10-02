import { describe, it, expect } from 'vitest';
import {
  timeToX,
  xToTime,
  midiToY,
  yToMidi,
  clamp,
  lerp,
  pointInRect,
  rectsIntersect
} from './transforms';

describe('transforms', () => {
  describe('timeToX', () => {
    it('should convert time to x coordinate', () => {
      expect(timeToX(1, 100)).toBe(100);
      expect(timeToX(2.5, 100)).toBe(250);
      expect(timeToX(0, 100)).toBe(0);
    });
  });

  describe('xToTime', () => {
    it('should convert x coordinate to time', () => {
      expect(xToTime(100, 100)).toBe(1);
      expect(xToTime(250, 100)).toBe(2.5);
      expect(xToTime(0, 100)).toBe(0);
    });
  });

  describe('midiToY', () => {
    it('should convert MIDI note to y coordinate', () => {
      const zoom = 12;
      expect(midiToY(60, zoom)).toBe((127 - 60) * zoom);
      expect(midiToY(127, zoom)).toBe(0);
      expect(midiToY(0, zoom)).toBe(127 * zoom);
    });
  });

  describe('yToMidi', () => {
    it('should convert y coordinate to MIDI note', () => {
      const zoom = 12;
      expect(yToMidi(0, zoom)).toBe(127);
      expect(yToMidi(127 * zoom, zoom)).toBe(0);
    });
  });

  describe('clamp', () => {
    it('should clamp value between min and max', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    it('should interpolate between two values', () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
      expect(lerp(0, 10, 0.5)).toBe(5);
    });
  });

  describe('pointInRect', () => {
    it('should detect point inside rectangle', () => {
      expect(pointInRect(5, 5, 0, 0, 10, 10)).toBe(true);
      expect(pointInRect(0, 0, 0, 0, 10, 10)).toBe(true);
      expect(pointInRect(10, 10, 0, 0, 10, 10)).toBe(true);
    });

    it('should detect point outside rectangle', () => {
      expect(pointInRect(-1, 5, 0, 0, 10, 10)).toBe(false);
      expect(pointInRect(11, 5, 0, 0, 10, 10)).toBe(false);
      expect(pointInRect(5, -1, 0, 0, 10, 10)).toBe(false);
      expect(pointInRect(5, 11, 0, 0, 10, 10)).toBe(false);
    });
  });

  describe('rectsIntersect', () => {
    it('should detect intersecting rectangles', () => {
      expect(rectsIntersect(0, 0, 10, 10, 5, 5, 10, 10)).toBe(true);
      expect(rectsIntersect(0, 0, 10, 10, 0, 0, 10, 10)).toBe(true);
    });

    it('should detect non-intersecting rectangles', () => {
      expect(rectsIntersect(0, 0, 10, 10, 20, 20, 10, 10)).toBe(false);
      expect(rectsIntersect(0, 0, 10, 10, 11, 0, 10, 10)).toBe(false);
    });
  });
});
