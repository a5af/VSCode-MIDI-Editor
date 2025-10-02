import { createSignal, onMount, Show } from 'solid-js';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
import PianoRoll from './components/PianoRoll';
import PianoKeys from './components/PianoKeys';
import Timeline from './components/Timeline';
import { midiData, loadMidiData, clearMidiData } from './stores/midiStore';
import { play, pause, stop, playbackState, setCurrentTime } from './stores/playbackStore';
import { viewState, zoomIn, zoomOut, resetZoom, toggleSnap, setSnapDivision } from './stores/viewStore';
import { parseMidiData } from './utils/midiUtils';

// Type for VSCode API in webview
declare const acquireVsCodeApi: () => {
  postMessage: (message: any) => void;
  setState: (state: any) => void;
  getState: () => any;
};

const vscode = acquireVsCodeApi();

function App() {
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [rawMidi, setRawMidi] = createSignal<Midi | null>(null);

  let animationFrame: number;
  let synths: Tone.PolySynth[] = [];

  // Request MIDI data from extension
  onMount(() => {
    // Listen for messages from extension
    window.addEventListener('message', async (event) => {
      const message = event.data;

      switch (message.type) {
        case 'midiData':
          try {
            // Convert array back to Uint8Array and parse
            const uint8Array = new Uint8Array(message.data);
            const midi = new Midi(uint8Array);
            setRawMidi(midi);

            // Parse into our internal format
            const parsed = parseMidiData(midi);
            loadMidiData(parsed);

            setIsLoading(false);

            vscode.postMessage({
              type: 'log',
              message: `Loaded MIDI file: ${midi.tracks.length} tracks, ${midi.duration.toFixed(2)}s duration`
            });
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to parse MIDI file';
            setError(errorMsg);
            setIsLoading(false);
            vscode.postMessage({ type: 'error', message: errorMsg });
          }
          break;
      }
    });

    // Notify extension that webview is ready
    vscode.postMessage({ type: 'webviewReady' });

    // Request MIDI data
    vscode.postMessage({ type: 'requestMidiData' });

    // Cleanup
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      synths.forEach(s => s.dispose());
    };
  });

  const handlePlay = async () => {
    const midi = rawMidi();
    if (!midi || playbackState.isPlaying) return;

    try {
      // Start audio context
      await Tone.start();

      play();

      // Schedule all notes from all tracks
      const now = Tone.now();

      // Create a synth for each track
      synths = midi.tracks.map(() =>
        new Tone.PolySynth(Tone.Synth).toDestination()
      );

      midi.tracks.forEach((track, trackIndex) => {
        const synth = synths[trackIndex];
        track.notes.forEach((note) => {
          synth.triggerAttackRelease(
            note.name,
            note.duration,
            now + note.time,
            note.velocity
          );
        });
      });

      // Update playhead
      const startTime = Date.now();
      const updatePlayhead = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        setCurrentTime(elapsed);

        if (elapsed < midi.duration) {
          animationFrame = requestAnimationFrame(updatePlayhead);
        } else {
          stop();
          synths.forEach(synth => synth.dispose());
          synths = [];
        }
      };
      updatePlayhead();

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to play MIDI';
      setError(errorMsg);
      stop();
    }
  };

  const handleStop = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    stop();
    if (animationFrame) cancelAnimationFrame(animationFrame);
    synths.forEach(synth => synth.dispose());
    synths = [];
  };

  const handleZoomIn = () => zoomIn('both');
  const handleZoomOut = () => zoomOut('both');
  const handleResetZoom = () => resetZoom();

  return (
    <div class="app">
      <div class="toolbar">
        <div class="toolbar-section">
          <h2>MIDI Editor</h2>
        </div>

        <Show when={!isLoading() && midiData}>
          <div class="toolbar-section">
            <div class="controls">
              <button
                onClick={handlePlay}
                disabled={playbackState.isPlaying}
                class="btn-icon"
                title="Play"
              >
                ▶
              </button>
              <button
                onClick={handleStop}
                disabled={!playbackState.isPlaying}
                class="btn-icon"
                title="Stop"
              >
                ■
              </button>
            </div>
          </div>

          <div class="toolbar-section">
            <div class="controls">
              <button onClick={handleZoomIn} class="btn-icon" title="Zoom In">
                +
              </button>
              <button onClick={handleZoomOut} class="btn-icon" title="Zoom Out">
                -
              </button>
              <button onClick={handleResetZoom} class="btn-icon" title="Reset Zoom">
                ↺
              </button>
            </div>
          </div>

          <div class="toolbar-section">
            <label class="snap-control">
              <input
                type="checkbox"
                checked={viewState.snap.enabled}
                onChange={() => toggleSnap()}
              />
              Snap
            </label>
            <select
              value={viewState.snap.division}
              onChange={(e) => setSnapDivision(Number(e.target.value))}
              disabled={!viewState.snap.enabled}
            >
              <option value={4}>1/4</option>
              <option value={8}>1/8</option>
              <option value={16}>1/16</option>
              <option value={32}>1/32</option>
            </select>
          </div>

          <div class="toolbar-section" style={{ "margin-left": "auto" }}>
            <span class="info-text">
              Zoom: {viewState.zoom.horizontal.toFixed(0)}px/s | {midiData?.tracks.length} tracks
            </span>
          </div>
        </Show>
      </div>

      <Show when={isLoading()}>
        <div class="loading-container">
          <div class="loading">Loading MIDI file...</div>
        </div>
      </Show>

      <Show when={error()}>
        <div class="error-container">
          <div class="error">Error: {error()}</div>
        </div>
      </Show>

      <Show when={!isLoading() && !error() && midiData}>
        <div class="editor-container">
          <div class="editor-top">
            <div class="corner-space" style={{ width: '80px', height: '40px' }} />
            <Timeline height={40} />
          </div>
          <div class="editor-main">
            <PianoKeys width={80} />
            <PianoRoll />
          </div>
        </div>
      </Show>
    </div>
  );
}

export default App;
