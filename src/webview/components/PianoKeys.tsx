import { For, createMemo, onMount, onCleanup } from 'solid-js';
import { viewState } from '../stores/viewStore';
import { midiToY } from '../utils/transforms';
import { isBlackKey, midiToNoteName } from '../utils/midiUtils';

interface PianoKeysProps {
  width?: number;
  lowestNote?: number;
  highestNote?: number;
}

export default function PianoKeys(props: PianoKeysProps) {
  const width = props.width || 80;
  const lowestNote = props.lowestNote || 21; // A0
  const highestNote = props.highestNote || 108; // C8

  let canvasRef: HTMLCanvasElement | undefined;

  const notes = createMemo(() => {
    const result: { midi: number; isBlack: boolean }[] = [];
    for (let midi = lowestNote; midi <= highestNote; midi++) {
      result.push({ midi, isBlack: isBlackKey(midi) });
    }
    return result;
  });

  const draw = () => {
    if (!canvasRef) return;

    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    const height = canvasRef.height;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, width * dpr, height);
    ctx.save();

    const noteHeight = viewState.zoom.vertical;
    const totalNotes = highestNote - lowestNote + 1;

    notes().forEach(({ midi, isBlack }) => {
      const y = midiToY(midi, noteHeight, lowestNote) - viewState.scroll.y;
      const h = noteHeight;

      // Skip if out of viewport
      if (y + h < 0 || y > height) return;

      // Draw key background
      ctx.fillStyle = isBlack
        ? 'var(--vscode-editor-background)'
        : 'var(--vscode-editor-foreground)';
      ctx.globalAlpha = isBlack ? 0.2 : 0.05;
      ctx.fillRect(0, y * dpr, width * dpr, h * dpr);
      ctx.globalAlpha = 1;

      // Draw key border
      ctx.strokeStyle = 'var(--vscode-editorGroup-border)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, y * dpr, width * dpr, h * dpr);

      // Draw note name for white keys (C notes only)
      if (!isBlack && midi % 12 === 0 && noteHeight > 8) {
        const noteName = midiToNoteName(midi);
        ctx.fillStyle = 'var(--vscode-foreground)';
        ctx.globalAlpha = 0.6;
        ctx.font = `${10 * dpr}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(noteName, 4 * dpr, (y + h / 2) * dpr);
        ctx.globalAlpha = 1;
      }
    });

    ctx.restore();
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

    // Redraw when view state changes
    const interval = setInterval(draw, 16); // ~60fps

    onCleanup(() => {
      resizeObserver.disconnect();
      clearInterval(interval);
    });
  });

  return (
    <div class="piano-keys" style={{ width: `${width}px` }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
}
