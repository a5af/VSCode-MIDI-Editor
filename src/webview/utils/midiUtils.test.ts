import { describe, it, expect } from 'vitest';
import {
  midiToNoteName,
  noteNameToMidi,
  isBlackKey,
  quantizeTime,
  snapToSemitone
} from './midiUtils';

describe('midiUtils', () => {
  describe('midiToNoteName', () => {
    it('should convert MIDI number to note name', () => {
      expect(midiToNoteName(60)).toBe('C4');
      expect(midiToNoteName(69)).toBe('A4');
      expect(midiToNoteName(21)).toBe('A0');
      expect(midiToNoteName(108)).toBe('C8');
    });

    it('should handle sharps correctly', () => {
      expect(midiToNoteName(61)).toBe('C#4');
      expect(midiToNoteName(70)).toBe('A#4');
    });
  });

  describe('noteNameToMidi', () => {
    it('should convert note name to MIDI number', () => {
      expect(noteNameToMidi('C4')).toBe(60);
      expect(noteNameToMidi('A4')).toBe(69);
      expect(noteNameToMidi('A0')).toBe(21);
    });

    it('should handle sharps correctly', () => {
      expect(noteNameToMidi('C#4')).toBe(61);
      expect(noteNameToMidi('A#4')).toBe(70);
    });

    it('should return default for invalid input', () => {
      expect(noteNameToMidi('Invalid')).toBe(60);
    });
  });

  describe('isBlackKey', () => {
    it('should identify black keys', () => {
      expect(isBlackKey(61)).toBe(true); // C#
      expect(isBlackKey(63)).toBe(true); // D#
      expect(isBlackKey(66)).toBe(true); // F#
      expect(isBlackKey(68)).toBe(true); // G#
      expect(isBlackKey(70)).toBe(true); // A#
    });

    it('should identify white keys', () => {
      expect(isBlackKey(60)).toBe(false); // C
      expect(isBlackKey(62)).toBe(false); // D
      expect(isBlackKey(64)).toBe(false); // E
      expect(isBlackKey(65)).toBe(false); // F
      expect(isBlackKey(67)).toBe(false); // G
      expect(isBlackKey(69)).toBe(false); // A
      expect(isBlackKey(71)).toBe(false); // B
    });
  });

  describe('quantizeTime', () => {
    it('should quantize to quarter notes', () => {
      const result = quantizeTime(0.6, 4, 120);
      expect(result).toBeCloseTo(0.5, 1);
    });

    it('should quantize to sixteenth notes', () => {
      const result = quantizeTime(0.3, 16, 120);
      expect(result).toBeCloseTo(0.25, 1);
    });

    it('should snap to nearest grid', () => {
      const result = quantizeTime(0.13, 16, 120);
      expect(result).toBeCloseTo(0.125, 2);
    });
  });

  describe('snapToSemitone', () => {
    it('should snap to nearest integer', () => {
      expect(snapToSemitone(60.4)).toBe(60);
      expect(snapToSemitone(60.6)).toBe(61);
      expect(snapToSemitone(60.5)).toBe(61);
    });

    it('should handle integer input', () => {
      expect(snapToSemitone(60)).toBe(60);
    });
  });
});
