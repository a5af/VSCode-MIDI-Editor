import { createMemo, onMount, onCleanup, createSignal } from 'solid-js';
import { midiData, getAllNotes } from '../stores/midiStore';
import {
  viewState,
  selection,
  currentTool,
  zoomIn,
  zoomOut,
  scrollBy,
  setScroll,
  selectNote,
  selectNotes,
  clearSelection
} from '../stores/viewStore';
import { playbackState } from '../stores/playbackStore';
import {
  timeToX,
  xToTime,
  midiToY,
  yToMidi,
  calculateTimeGridLines,
  calculatePitchGridLines,
  pointInRect,
  rectsIntersect
} from '../utils/transforms';
import { MidiNote } from '../utils/types';

export default function PianoRoll() {
  let canvasRef: HTMLCanvasElement | undefined;
  let containerRef: HTMLDivElement | undefined;

  const [isDragging, setIsDragging] = createSignal(false);
  const [dragStart, setDragStart] = createSignal({ x: 0, y: 0 });
  const [selectionRect, setSelectionRect] = createSignal<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const bpm = createMemo(() => {
    const tempos = midiData?.tempos;
    return tempos && tempos.length > 0 ? tempos[0].bpm : 120;
  });

  const allNotes = createMemo(() => getAllNotes());

  // Drawing functions
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number) => {
    const zoom = viewState.zoom;
    const scroll = viewState.scroll;

    // Calculate visible range
    const startTime = scroll.x / zoom.horizontal;
    const endTime = (scroll.x + width / dpr) / zoom.horizontal;
    const lowestMidi = yToMidi(scroll.y + height / dpr, zoom.vertical);
    const highestMidi = yToMidi(scroll.y, zoom.vertical);

    // Draw pitch lines (horizontal)
    const pitchLines = calculatePitchGridLines(lowestMidi, highestMidi);
    pitchLines.forEach(({ midi, type }) => {
      const y = (midiToY(midi, zoom.vertical) - scroll.y) * dpr;

      ctx.strokeStyle = type === 'black'
        ? 'rgba(0, 0, 0, 0.1)'
        : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Fill black keys
      if (type === 'black') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, y, width, zoom.vertical * dpr);
      }
    });

    // Draw time lines (vertical)
    const timeLines = calculateTimeGridLines(startTime, endTime, zoom.horizontal, bpm());
    timeLines.forEach(({ time, type }) => {
      const x = (timeToX(time, zoom.horizontal) - scroll.x) * dpr;

      ctx.strokeStyle = type === 'bar'
        ? 'rgba(255, 255, 255, 0.2)'
        : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = type === 'bar' ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    });
  };

  const drawNotes = (ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number) => {
    const zoom = viewState.zoom;
    const scroll = viewState.scroll;

    allNotes().forEach(({ trackId, note }) => {
      const track = midiData?.tracks.find(t => t.id === trackId);
      if (!track) return;

      const x = (timeToX(note.time, zoom.horizontal) - scroll.x) * dpr;
      const y = (midiToY(note.midi, zoom.vertical) - scroll.y) * dpr;
      const w = note.duration * zoom.horizontal * dpr;
      const h = zoom.vertical * dpr;

      // Cull notes outside viewport
      if (x + w < 0 || x > width || y + h < 0 || y > height) return;

      const isSelected = selection.noteIds.has(note.id);

      // Draw note
      ctx.fillStyle = track.color;
      ctx.globalAlpha = isSelected ? 0.8 : 0.6;
      ctx.fillRect(x, y, w, h);

      // Draw border
      ctx.strokeStyle = isSelected
        ? 'var(--vscode-focusBorder)'
        : 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(x, y, w, h);

      // Draw velocity bar
      const velocityWidth = w * note.velocity;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(x, y + h - 3 * dpr, velocityWidth, 3 * dpr);

      ctx.globalAlpha = 1;
    });
  };

  const drawPlayhead = (ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number) => {
    if (!playbackState.isPlaying) return;

    const zoom = viewState.zoom.horizontal;
    const scroll = viewState.scroll.x;
    const x = (timeToX(playbackState.currentTime, zoom) - scroll) * dpr;

    ctx.strokeStyle = 'var(--vscode-textLink-foreground)';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const drawSelectionRect = (ctx: CanvasRenderingContext2D, dpr: number) => {
    const rect = selectionRect();
    if (!rect) return;

    ctx.strokeStyle = 'var(--vscode-focusBorder)';
    ctx.fillStyle = 'var(--vscode-list-activeSelectionBackground)';
    ctx.globalAlpha = 0.2;
    ctx.fillRect(rect.x * dpr, rect.y * dpr, rect.width * dpr, rect.height * dpr);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(rect.x * dpr, rect.y * dpr, rect.width * dpr, rect.height * dpr);
    ctx.setLineDash([]);
  };

  const draw = () => {
    if (!canvasRef) return;

    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    const width = canvasRef.width;
    const height = canvasRef.height;
    const dpr = window.devicePixelRatio || 1;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = 'var(--vscode-editor-background)';
    ctx.fillRect(0, 0, width, height);

    // Draw layers
    drawGrid(ctx, width, height, dpr);
    drawNotes(ctx, width, height, dpr);
    drawPlayhead(ctx, width, height, dpr);
    drawSelectionRect(ctx, dpr);
  };

  // Mouse event handlers
  const handleMouseDown = (e: MouseEvent) => {
    if (!canvasRef) return;

    const rect = canvasRef.getBoundingClientRect();
    const x = e.clientX - rect.left + viewState.scroll.x;
    const y = e.clientY - rect.top + viewState.scroll.y;

    setDragStart({ x: e.clientX, y: e.clientY });

    if (currentTool.tool === 'select') {
      // Check if clicking on a note
      const clickedNote = allNotes().find(({ note }) => {
        const noteX = timeToX(note.time, viewState.zoom.horizontal);
        const noteY = midiToY(note.midi, viewState.zoom.vertical);
        const noteW = note.duration * viewState.zoom.horizontal;
        const noteH = viewState.zoom.vertical;

        return pointInRect(x, y, noteX, noteY, noteW, noteH);
      });

      if (clickedNote) {
        if (!e.shiftKey && !selection.noteIds.has(clickedNote.note.id)) {
          selectNote(clickedNote.note.id);
        } else if (e.shiftKey) {
          selectNote(clickedNote.note.id, true);
        }
      } else {
        if (!e.shiftKey) {
          clearSelection();
        }
        setIsDragging(true);
        setSelectionRect({ x, y, width: 0, height: 0 });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRef || !isDragging()) return;

    const rect = canvasRef.getBoundingClientRect();
    const x = e.clientX - rect.left + viewState.scroll.x;
    const y = e.clientY - rect.top + viewState.scroll.y;
    const start = dragStart();

    if (currentTool.tool === 'select' && selectionRect()) {
      const startX = Math.min(start.x - rect.left + viewState.scroll.x, x);
      const startY = Math.min(start.y - rect.top + viewState.scroll.y, y);
      const width = Math.abs(x - (start.x - rect.left + viewState.scroll.x));
      const height = Math.abs(y - (start.y - rect.top + viewState.scroll.y));

      setSelectionRect({ x: startX, y: startY, width, height });
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (selectionRect()) {
      // Select notes within selection rectangle
      const rect = selectionRect()!;
      const selectedNoteIds: string[] = [];

      allNotes().forEach(({ note }) => {
        const noteX = timeToX(note.time, viewState.zoom.horizontal);
        const noteY = midiToY(note.midi, viewState.zoom.vertical);
        const noteW = note.duration * viewState.zoom.horizontal;
        const noteH = viewState.zoom.vertical;

        if (rectsIntersect(rect.x, rect.y, rect.width, rect.height, noteX, noteY, noteW, noteH)) {
          selectedNoteIds.push(note.id);
        }
      });

      if (selectedNoteIds.length > 0) {
        selectNotes(selectedNoteIds, e.shiftKey);
      }

      setSelectionRect(null);
    }

    setIsDragging(false);
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    if (e.ctrlKey) {
      // Zoom
      const delta = -e.deltaY;
      if (e.shiftKey) {
        // Vertical zoom
        delta > 0 ? zoomIn('vertical') : zoomOut('vertical');
      } else {
        // Horizontal zoom
        delta > 0 ? zoomIn('horizontal') : zoomOut('horizontal');
      }
    } else {
      // Scroll
      scrollBy(e.deltaX, e.deltaY);
    }
  };

  onMount(() => {
    if (!canvasRef) return;

    const resizeObserver = new ResizeObserver(() => {
      if (!canvasRef) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvasRef.getBoundingClientRect();
      canvasRef.width = rect.width * dpr;
      canvasRef.height = rect.height * dpr;
      draw();
    });

    resizeObserver.observe(canvasRef);

    // Animation loop
    const interval = setInterval(draw, 16); // ~60fps

    // Event listeners
    canvasRef.addEventListener('mousedown', handleMouseDown);
    canvasRef.addEventListener('mousemove', handleMouseMove);
    canvasRef.addEventListener('mouseup', handleMouseUp);
    canvasRef.addEventListener('wheel', handleWheel, { passive: false });

    onCleanup(() => {
      resizeObserver.disconnect();
      clearInterval(interval);
      canvasRef?.removeEventListener('mousedown', handleMouseDown);
      canvasRef?.removeEventListener('mousemove', handleMouseMove);
      canvasRef?.removeEventListener('mouseup', handleMouseUp);
      canvasRef?.removeEventListener('wheel', handleWheel);
    });
  });

  return (
    <div class="piano-roll" ref={containerRef} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: currentTool.tool === 'select' ? 'default' : 'crosshair'
        }}
      />
    </div>
  );
}
