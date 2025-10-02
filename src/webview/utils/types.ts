import { Midi, Track as ToneTrack } from '@tonejs/midi';

export interface MidiNote {
  id: string;
  midi: number; // MIDI note number (0-127)
  time: number; // Start time in seconds
  duration: number; // Duration in seconds
  velocity: number; // Velocity (0-1)
  name: string; // Note name (e.g., "C4")
}

export interface MidiTrack {
  id: string;
  name: string;
  notes: MidiNote[];
  instrument: string;
  color: string;
  solo: boolean;
  mute: boolean;
}

export interface TimeSignature {
  measures: number;
  numerator: number;
  denominator: number;
  ticks: number;
}

export interface Tempo {
  bpm: number;
  ticks: number;
}

export interface MidiData {
  name: string;
  duration: number;
  ppq: number; // Pulses per quarter note
  tracks: MidiTrack[];
  tempos: Tempo[];
  timeSignatures: TimeSignature[];
}

export interface ViewState {
  zoom: {
    horizontal: number; // pixels per second
    vertical: number; // pixels per semitone
  };
  scroll: {
    x: number; // horizontal scroll in pixels
    y: number; // vertical scroll in pixels (pitch)
  };
  snap: {
    enabled: boolean;
    division: number; // 4=quarter, 8=eighth, 16=sixteenth
  };
}

export interface Selection {
  noteIds: Set<string>;
  startNote: string | null;
}

export type Tool = 'select' | 'pencil' | 'eraser' | 'cut';

export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number; // in seconds
  loop: {
    enabled: boolean;
    start: number;
    end: number;
  };
}

// Constants
export const PIANO_KEYS = 88; // Standard piano (A0 to C8)
export const LOWEST_MIDI_NOTE = 21; // A0
export const HIGHEST_MIDI_NOTE = 108; // C8
export const DEFAULT_NOTE_HEIGHT = 12; // pixels
export const DEFAULT_PIXELS_PER_SECOND = 100;
export const GRID_COLORS = {
  beat: 'rgba(255, 255, 255, 0.1)',
  bar: 'rgba(255, 255, 255, 0.2)',
  background: 'rgba(0, 0, 0, 0.05)'
};

export const TRACK_COLORS = [
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12',
  '#9B59B6', '#1ABC9C', '#E67E22', '#34495E'
];
