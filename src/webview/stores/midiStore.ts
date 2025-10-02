import { createSignal, createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';
import { MidiData, MidiTrack, MidiNote } from '../utils/types';
import { nanoid } from 'nanoid';

// MIDI data store
const [midiData, setMidiData] = createStore<MidiData | null>(null);

// Helper functions
export function loadMidiData(data: MidiData) {
  setMidiData(data);
}

export function clearMidiData() {
  setMidiData(null);
}

export function updateTrack(trackId: string, updates: Partial<MidiTrack>) {
  if (!midiData) return;

  const trackIndex = midiData.tracks.findIndex(t => t.id === trackId);
  if (trackIndex === -1) return;

  setMidiData('tracks', trackIndex, updates);
}

export function toggleTrackSolo(trackId: string) {
  if (!midiData) return;

  const trackIndex = midiData.tracks.findIndex(t => t.id === trackId);
  if (trackIndex === -1) return;

  const currentSolo = midiData.tracks[trackIndex].solo;

  // If enabling solo, disable all other solos
  if (!currentSolo) {
    midiData.tracks.forEach((_, idx) => {
      setMidiData('tracks', idx, 'solo', idx === trackIndex);
    });
  } else {
    setMidiData('tracks', trackIndex, 'solo', false);
  }
}

export function toggleTrackMute(trackId: string) {
  if (!midiData) return;

  const trackIndex = midiData.tracks.findIndex(t => t.id === trackId);
  if (trackIndex === -1) return;

  setMidiData('tracks', trackIndex, 'mute', !midiData.tracks[trackIndex].mute);
}

export function addNote(trackId: string, note: Omit<MidiNote, 'id'>) {
  if (!midiData) return;

  const trackIndex = midiData.tracks.findIndex(t => t.id === trackId);
  if (trackIndex === -1) return;

  const newNote: MidiNote = {
    ...note,
    id: nanoid()
  };

  setMidiData('tracks', trackIndex, 'notes', prev => [...prev, newNote]);
  return newNote.id;
}

export function updateNote(trackId: string, noteId: string, updates: Partial<MidiNote>) {
  if (!midiData) return;

  const trackIndex = midiData.tracks.findIndex(t => t.id === trackId);
  if (trackIndex === -1) return;

  const noteIndex = midiData.tracks[trackIndex].notes.findIndex(n => n.id === noteId);
  if (noteIndex === -1) return;

  setMidiData('tracks', trackIndex, 'notes', noteIndex, updates);
}

export function deleteNote(trackId: string, noteId: string) {
  if (!midiData) return;

  const trackIndex = midiData.tracks.findIndex(t => t.id === trackId);
  if (trackIndex === -1) return;

  setMidiData('tracks', trackIndex, 'notes', prev =>
    prev.filter(n => n.id !== noteId)
  );
}

export function deleteNotes(trackId: string, noteIds: string[]) {
  if (!midiData) return;

  const trackIndex = midiData.tracks.findIndex(t => t.id === trackId);
  if (trackIndex === -1) return;

  const noteIdSet = new Set(noteIds);
  setMidiData('tracks', trackIndex, 'notes', prev =>
    prev.filter(n => !noteIdSet.has(n.id))
  );
}

export function moveNotes(
  trackId: string,
  noteIds: string[],
  deltaTime: number,
  deltaMidi: number
) {
  if (!midiData) return;

  const trackIndex = midiData.tracks.findIndex(t => t.id === trackId);
  if (trackIndex === -1) return;

  const noteIdSet = new Set(noteIds);

  midiData.tracks[trackIndex].notes.forEach((note, noteIndex) => {
    if (noteIdSet.has(note.id)) {
      const newTime = Math.max(0, note.time + deltaTime);
      const newMidi = Math.max(0, Math.min(127, note.midi + deltaMidi));

      setMidiData('tracks', trackIndex, 'notes', noteIndex, {
        time: newTime,
        midi: newMidi
      });
    }
  });
}

export function getAllNotes(): { trackId: string; note: MidiNote }[] {
  if (!midiData) return [];

  const allNotes: { trackId: string; note: MidiNote }[] = [];

  midiData.tracks.forEach(track => {
    track.notes.forEach(note => {
      allNotes.push({ trackId: track.id, note });
    });
  });

  return allNotes;
}

export function getNotesForTrack(trackId: string): MidiNote[] {
  if (!midiData) return [];

  const track = midiData.tracks.find(t => t.id === trackId);
  return track?.notes || [];
}

export { midiData };
