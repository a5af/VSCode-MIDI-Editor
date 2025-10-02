import { Midi } from '@tonejs/midi';
import { MidiData, MidiTrack, MidiNote, TRACK_COLORS } from './types';
import { nanoid } from 'nanoid';

/**
 * Convert @tonejs/midi format to our internal format
 */
export function parseMidiData(midi: Midi): MidiData {
  const tracks: MidiTrack[] = midi.tracks.map((track, index) => ({
    id: nanoid(),
    name: track.name || `Track ${index + 1}`,
    instrument: track.instrument?.name || 'Piano',
    color: TRACK_COLORS[index % TRACK_COLORS.length],
    solo: false,
    mute: false,
    notes: track.notes.map(note => ({
      id: nanoid(),
      midi: note.midi,
      time: note.time,
      duration: note.duration,
      velocity: note.velocity,
      name: note.name
    }))
  }));

  return {
    name: midi.name || 'Untitled',
    duration: midi.duration,
    ppq: midi.header.ppq,
    tracks,
    tempos: midi.header.tempos.map(t => ({
      bpm: t.bpm,
      ticks: t.ticks
    })),
    timeSignatures: midi.header.timeSignatures.map(ts => ({
      measures: ts.measures,
      numerator: ts.timeSignature[0],
      denominator: ts.timeSignature[1],
      ticks: ts.ticks
    }))
  };
}

/**
 * Convert our internal format back to @tonejs/midi format
 */
export function serializeMidiData(data: MidiData): Midi {
  const midi = new Midi();

  data.tracks.forEach(track => {
    const midiTrack = midi.addTrack();
    midiTrack.name = track.name;

    track.notes.forEach(note => {
      midiTrack.addNote({
        midi: note.midi,
        time: note.time,
        duration: note.duration,
        velocity: note.velocity
      });
    });
  });

  return midi;
}

/**
 * Convert MIDI note number to note name
 */
export function midiToNoteName(midi: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const note = notes[midi % 12];
  return `${note}${octave}`;
}

/**
 * Convert note name to MIDI number
 */
export function noteNameToMidi(name: string): number {
  const notes: { [key: string]: number } = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };

  const match = name.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 60; // Default to C4

  const [, note, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  return (octave + 1) * 12 + notes[note];
}

/**
 * Check if a MIDI note is a black key
 */
export function isBlackKey(midi: number): boolean {
  const semitone = midi % 12;
  return [1, 3, 6, 8, 10].includes(semitone);
}

/**
 * Quantize time to nearest grid division
 */
export function quantizeTime(time: number, division: number, bpm: number): number {
  const beatsPerBar = 4;
  const secondsPerBeat = 60 / bpm;
  const secondsPerDivision = (secondsPerBeat * beatsPerBar) / division;

  return Math.round(time / secondsPerDivision) * secondsPerDivision;
}

/**
 * Snap MIDI note to nearest semitone
 */
export function snapToSemitone(midi: number): number {
  return Math.round(midi);
}

/**
 * Get all notes within a time range
 */
export function getNotesInRange(
  notes: MidiNote[],
  startTime: number,
  endTime: number
): MidiNote[] {
  return notes.filter(note => {
    const noteEnd = note.time + note.duration;
    return note.time < endTime && noteEnd > startTime;
  });
}

/**
 * Get all notes within a pitch range
 */
export function getNotesInPitchRange(
  notes: MidiNote[],
  lowMidi: number,
  highMidi: number
): MidiNote[] {
  return notes.filter(note => note.midi >= lowMidi && note.midi <= highMidi);
}

/**
 * Calculate the bounding box of a set of notes
 */
export function getNotesBounds(notes: MidiNote[]): {
  startTime: number;
  endTime: number;
  lowMidi: number;
  highMidi: number;
} | null {
  if (notes.length === 0) return null;

  let startTime = Infinity;
  let endTime = -Infinity;
  let lowMidi = Infinity;
  let highMidi = -Infinity;

  for (const note of notes) {
    startTime = Math.min(startTime, note.time);
    endTime = Math.max(endTime, note.time + note.duration);
    lowMidi = Math.min(lowMidi, note.midi);
    highMidi = Math.max(highMidi, note.midi);
  }

  return { startTime, endTime, lowMidi, highMidi };
}
