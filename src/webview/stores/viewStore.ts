import { createStore } from 'solid-js/store';
import { ViewState, Tool, DEFAULT_PIXELS_PER_SECOND, DEFAULT_NOTE_HEIGHT } from '../utils/types';
import { clamp } from '../utils/transforms';

const [viewState, setViewState] = createStore<ViewState>({
  zoom: {
    horizontal: DEFAULT_PIXELS_PER_SECOND,
    vertical: DEFAULT_NOTE_HEIGHT
  },
  scroll: {
    x: 0,
    y: 0
  },
  snap: {
    enabled: true,
    division: 16 // 16th notes
  }
});

const [currentTool, setCurrentTool] = createStore<{ tool: Tool }>({
  tool: 'select'
});

const [selection, setSelection] = createStore<{
  noteIds: Set<string>;
  startNote: string | null;
}>({
  noteIds: new Set(),
  startNote: null
});

// Zoom functions
export function setHorizontalZoom(zoom: number) {
  const clamped = clamp(zoom, 10, 500); // 10-500 pixels per second
  setViewState('zoom', 'horizontal', clamped);
}

export function setVerticalZoom(zoom: number) {
  const clamped = clamp(zoom, 4, 40); // 4-40 pixels per note
  setViewState('zoom', 'vertical', clamped);
}

export function zoomIn(axis: 'horizontal' | 'vertical' | 'both' = 'both') {
  if (axis === 'horizontal' || axis === 'both') {
    setHorizontalZoom(viewState.zoom.horizontal * 1.2);
  }
  if (axis === 'vertical' || axis === 'both') {
    setVerticalZoom(viewState.zoom.vertical * 1.2);
  }
}

export function zoomOut(axis: 'horizontal' | 'vertical' | 'both' = 'both') {
  if (axis === 'horizontal' || axis === 'both') {
    setHorizontalZoom(viewState.zoom.horizontal / 1.2);
  }
  if (axis === 'vertical' || axis === 'both') {
    setVerticalZoom(viewState.zoom.vertical / 1.2);
  }
}

export function resetZoom() {
  setViewState('zoom', {
    horizontal: DEFAULT_PIXELS_PER_SECOND,
    vertical: DEFAULT_NOTE_HEIGHT
  });
}

// Scroll functions
export function setScroll(x: number, y: number) {
  setViewState('scroll', {
    x: Math.max(0, x),
    y: Math.max(0, y)
  });
}

export function scrollBy(dx: number, dy: number) {
  setViewState('scroll', {
    x: Math.max(0, viewState.scroll.x + dx),
    y: Math.max(0, viewState.scroll.y + dy)
  });
}

// Snap functions
export function toggleSnap() {
  setViewState('snap', 'enabled', !viewState.snap.enabled);
}

export function setSnapDivision(division: number) {
  if ([4, 8, 16, 32].includes(division)) {
    setViewState('snap', 'division', division);
  }
}

// Tool functions
export function setTool(tool: Tool) {
  setCurrentTool('tool', tool);
}

// Selection functions
export function selectNote(noteId: string, addToSelection = false) {
  if (addToSelection) {
    setSelection('noteIds', prev => new Set([...prev, noteId]));
  } else {
    setSelection({
      noteIds: new Set([noteId]),
      startNote: noteId
    });
  }
}

export function selectNotes(noteIds: string[], addToSelection = false) {
  if (addToSelection) {
    setSelection('noteIds', prev => new Set([...prev, ...noteIds]));
  } else {
    setSelection({
      noteIds: new Set(noteIds),
      startNote: noteIds[0] || null
    });
  }
}

export function deselectNote(noteId: string) {
  setSelection('noteIds', prev => {
    const newSet = new Set(prev);
    newSet.delete(noteId);
    return newSet;
  });
}

export function clearSelection() {
  setSelection({
    noteIds: new Set(),
    startNote: null
  });
}

export function isNoteSelected(noteId: string): boolean {
  return selection.noteIds.has(noteId);
}

export function getSelectedNoteIds(): string[] {
  return Array.from(selection.noteIds);
}

export { viewState, currentTool, selection };
