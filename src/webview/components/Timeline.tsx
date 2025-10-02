import { createMemo, onMount, onCleanup } from 'solid-js';
import { viewState } from '../stores/viewStore';
import { playbackState } from '../stores/playbackStore';
import { timeToX, calculateTimeGridLines } from '../utils/transforms';
import { midiData } from '../stores/midiStore';

interface TimelineProps {
  height?: number;
  bpm?: number;
}

export default function Timeline(props: TimelineProps) {
  const height = props.height || 40;
  let canvasRef: HTMLCanvasElement | undefined;

  const bpm = createMemo(() => {
    const tempos = midiData?.tempos;
    if (tempos && tempos.length > 0) {
      return tempos[0].bpm;
    }
    return props.bpm || 120;
  });

  const draw = () => {
    if (!canvasRef) return;

    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    const width = canvasRef.width;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, width, height * dpr);
    ctx.save();

    const zoom = viewState.zoom.horizontal;
    const scrollX = viewState.scroll.x;

    // Calculate visible time range
    const startTime = scrollX / zoom;
    const endTime = (scrollX + width / dpr) / zoom;

    // Draw background
    ctx.fillStyle = 'var(--vscode-editorGroupHeader-tabsBackground)';
    ctx.fillRect(0, 0, width, height * dpr);

    // Draw grid lines
    const gridLines = calculateTimeGridLines(startTime, endTime, zoom, bpm());

    gridLines.forEach(({ time, type }) => {
      const x = (timeToX(time, zoom) - scrollX) * dpr;

      // Draw tick
      const tickHeight = type === 'bar' ? height * 0.6 : height * 0.3;
      ctx.strokeStyle = type === 'bar'
        ? 'var(--vscode-foreground)'
        : 'var(--vscode-descriptionForeground)';
      ctx.globalAlpha = type === 'bar' ? 0.5 : 0.3;
      ctx.lineWidth = type === 'bar' ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x, (height - tickHeight) * dpr);
      ctx.lineTo(x, height * dpr);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Draw time labels for bars
      if (type === 'bar') {
        const bar = Math.floor(time / (60 / bpm() * 4)) + 1;
        ctx.fillStyle = 'var(--vscode-foreground)';
        ctx.font = `${11 * dpr}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`${bar}`, x + 3 * dpr, 4 * dpr);
      }
    });

    // Draw playhead
    if (playbackState.isPlaying) {
      const playheadX = (timeToX(playbackState.currentTime, zoom) - scrollX) * dpr;
      ctx.strokeStyle = 'var(--vscode-textLink-foreground)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height * dpr);
      ctx.stroke();
    }

    // Draw border
    ctx.strokeStyle = 'var(--vscode-editorGroup-border)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height * dpr);

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

    // Redraw continuously for playhead
    const interval = setInterval(draw, 16); // ~60fps

    onCleanup(() => {
      resizeObserver.disconnect();
      clearInterval(interval);
    });
  });

  return (
    <div class="timeline" style={{ height: `${height}px` }}>
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
