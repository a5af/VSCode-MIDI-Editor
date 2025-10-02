# VSCode MIDI Editor - Design Document

## Overview
A lightweight VSCode extension that provides a full-featured MIDI editor with piano roll interface, similar to DAW functionality, for .mid/.midi files.

## Architecture

### Technology Stack

#### Extension Host (Node.js)
- **TypeScript** - Type-safe extension development
- **VSCode Extension API** - Custom Editor Provider API
- **esbuild** - Fast bundling for extension code

#### Webview UI (Browser Context)
- **SolidJS** - Lightweight reactive framework (~7KB gzipped)
- **Vite** - Fast dev server with HMR
- **vite-plugin-solid** - SolidJS integration
- **@tonejs/midi** - MIDI file parsing/serialization
- **Tone.js** - Audio synthesis and playback
- **Canvas API** - High-performance piano roll rendering

### Project Structure

```
VSCode-MIDI-Editor/
├── src/
│   ├── extension/              # Extension host code (Node.js)
│   │   ├── extension.ts       # Entry point, activation
│   │   ├── MidiEditorProvider.ts  # CustomEditorProvider implementation
│   │   └── types.ts           # Shared TypeScript types
│   │
│   └── webview/               # Webview UI code (Browser)
│       ├── index.tsx          # SolidJS entry point
│       ├── App.tsx            # Main app component
│       ├── components/
│       │   ├── PianoRoll.tsx      # Canvas-based piano roll
│       │   ├── Timeline.tsx       # Time ruler and markers
│       │   ├── PianoKeys.tsx      # Piano keyboard sidebar
│       │   ├── Toolbar.tsx        # Top toolbar (play, stop, tempo)
│       │   ├── Grid.tsx           # Note grid rendering
│       │   └── NoteEditor.tsx     # Note selection/editing
│       ├── stores/
│       │   ├── midiStore.ts       # MIDI data state management
│       │   ├── viewStore.ts       # Zoom, scroll, selection state
│       │   └── playbackStore.ts   # Playback state
│       ├── utils/
│       │   ├── midiUtils.ts       # MIDI parsing helpers
│       │   ├── audioEngine.ts     # Tone.js wrapper
│       │   ├── canvas.ts          # Canvas rendering utilities
│       │   └── transforms.ts      # Time/pitch conversions
│       └── styles/
│           └── main.css           # Global styles
│
├── media/                      # Static assets
├── dist/                       # Build output
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .vscodeignore
```

## Core Features

### 1. Piano Roll Editor
- **Canvas-based rendering** for 60fps performance with thousands of notes
- **Grid system** with configurable snap (1/4, 1/8, 1/16, 1/32 notes)
- **Note operations**:
  - Click to add notes
  - Drag to create/resize notes
  - Multi-select (click + drag, Ctrl+click)
  - Copy/paste/delete (Ctrl+C/V/Delete)
  - Transpose (drag selection up/down)
  - Quantize to grid
  - Velocity editing (visual bars on notes)

### 2. Zoom & Navigation
- **Horizontal zoom**: Time axis (Ctrl+Scroll or pinch)
- **Vertical zoom**: Pitch axis (Shift+Scroll)
- **Pan**: Click and drag background, or scrollbars
- **Zoom to fit**: Auto-zoom to show all notes
- **Mini-map**: Overview of entire MIDI file

### 3. Playback
- **Transport controls**: Play, Pause, Stop, Loop region
- **Tempo control**: BPM adjustment (respects MIDI tempo events)
- **Playhead**: Visual cursor showing current position
- **Metronome**: Optional click track
- **MIDI output**: Real-time synthesis via Tone.js

### 4. Editing Tools
- **Pencil tool**: Add notes
- **Selection tool**: Select/move/resize
- **Eraser tool**: Delete notes
- **Cut tool**: Split notes
- **Velocity tool**: Adjust note velocities

### 5. Track Management
- **Multi-track support**: Show/hide tracks
- **Track colors**: Visual distinction
- **Solo/mute**: Per-track playback control
- **Instrument selection**: Change Tone.js synthesizer per track

## Technical Implementation

### Custom Editor Provider

```typescript
// MidiEditorProvider.ts
export class MidiEditorProvider implements vscode.CustomEditorProvider {

  // Load MIDI file from disk
  async openCustomDocument(uri: Uri): Promise<MidiDocument> {
    const data = await vscode.workspace.fs.readFile(uri);
    return new MidiDocument(uri, data);
  }

  // Resolve webview for editing
  async resolveCustomEditor(
    document: MidiDocument,
    webviewPanel: WebviewPanel
  ): Promise<void> {
    // Set up webview HTML with Vite build output
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    // Message passing: Extension <-> Webview
    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'save':
          await this.saveMidiFile(document, message.data);
          break;
        case 'requestMidiData':
          webviewPanel.webview.postMessage({
            type: 'midiData',
            data: document.midiData
          });
          break;
      }
    });
  }
}
```

### MIDI Data Flow

1. **Load**: Extension reads .mid file → Parses with @tonejs/midi → Sends JSON to webview
2. **Edit**: Webview updates SolidJS store → Rerenders canvas → Marks dirty state
3. **Save**: Webview serializes JSON with @tonejs/midi → Sends binary to extension → Writes to disk
4. **Play**: Webview schedules notes with Tone.Transport → Web Audio API synthesis

### State Management (SolidJS Stores)

```typescript
// midiStore.ts
export const [midiData, setMidiData] = createStore<MidiData>({
  header: { ppq: 480, tempos: [], timeSignatures: [] },
  tracks: []
});

// viewStore.ts
export const [viewState, setViewState] = createStore({
  zoom: { horizontal: 1, vertical: 1 },
  scroll: { x: 0, y: 0 },
  selection: [],
  tool: 'select' as Tool
});

// playbackStore.ts
export const [playback, setPlayback] = createStore({
  isPlaying: false,
  currentTime: 0,
  bpm: 120,
  loop: { start: 0, end: null }
});
```

### Canvas Rendering Strategy

- **Layered rendering**:
  - Background layer (grid, piano keys) - static, redraw on zoom
  - Notes layer - redraw on edit/scroll
  - Overlay layer (selection box, playhead) - redraw on animation frame
- **Viewport culling**: Only render notes in visible area
- **Request animation frame**: Smooth 60fps playhead movement
- **Web Workers**: Offload heavy MIDI parsing to background thread

### Performance Optimizations

1. **Virtual scrolling**: Only render visible portion of timeline
2. **Memoization**: Cache computed values (note positions, grid lines)
3. **Debouncing**: Throttle save operations during rapid edits
4. **IndexedDB**: Cache parsed MIDI for instant reopening
5. **Web Workers**: Parse large MIDI files off main thread

## Development Workflow

### Setup
```bash
npm install
npm run dev  # Vite dev server for webview HMR
```

### Build
```bash
npm run build          # Production build
npm run package        # Create .vsix extension package
```

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    outDir: 'dist/webview',
    rollupOptions: {
      input: 'src/webview/index.html',
      output: {
        entryFileNames: 'index.js',
        assetFileNames: 'index.css'
      }
    }
  }
});
```

### VSCode Configuration
```json
{
  "contributes": {
    "customEditors": [{
      "viewType": "midiEditor.editor",
      "displayName": "MIDI Editor",
      "selector": [
        { "filenamePattern": "*.mid" },
        { "filenamePattern": "*.midi" }
      ],
      "priority": "default"
    }]
  }
}
```

## Phase 1: MVP (Weeks 1-2)
- [ ] Extension scaffolding + CustomEditorProvider
- [ ] Basic webview with SolidJS + Vite
- [ ] Load/parse MIDI with @tonejs/midi
- [ ] Simple piano roll canvas (read-only)
- [ ] Basic playback with Tone.js

## Phase 2: Core Editing (Weeks 3-4)
- [ ] Add/delete/move notes
- [ ] Multi-select and copy/paste
- [ ] Grid snapping
- [ ] Undo/redo system
- [ ] Save functionality

## Phase 3: Advanced Features (Weeks 5-6)
- [ ] Velocity editing
- [ ] Multi-track support
- [ ] Zoom and pan controls
- [ ] Transport controls (play/pause/stop/loop)
- [ ] Tempo and time signature editing

## Phase 4: Polish (Week 7)
- [ ] Keyboard shortcuts
- [ ] Context menus
- [ ] VSCode theme integration
- [ ] Performance optimization
- [ ] Error handling and validation

## Dependencies

### Extension
```json
{
  "@types/vscode": "^1.85.0",
  "esbuild": "^0.19.0",
  "typescript": "^5.3.0"
}
```

### Webview
```json
{
  "solid-js": "^1.8.0",
  "vite": "^5.0.0",
  "vite-plugin-solid": "^2.10.0",
  "@tonejs/midi": "^2.0.28",
  "tone": "^15.0.0"
}
```

## Security Considerations

- **Content Security Policy**: Restrict scripts to bundled code only
- **Local resource roots**: Limit webview file access to extension directory
- **Message validation**: Sanitize all extension <-> webview messages
- **File size limits**: Warn on MIDI files >10MB

## Accessibility

- **Keyboard navigation**: All tools accessible via shortcuts
- **Screen reader**: ARIA labels for controls
- **High contrast**: Respect VSCode theme
- **Zoom**: Support for vision accessibility

## Testing Strategy

- **Unit tests**: MIDI parsing, time conversions, note operations
- **Integration tests**: Extension activation, file open/save
- **E2E tests**: Webview interaction simulation
- **Manual tests**: Test with diverse MIDI files from different DAWs

## Future Enhancements

- [ ] MIDI recording from hardware controllers
- [ ] Audio track integration (import .wav/.mp3)
- [ ] VST plugin support
- [ ] Automation lanes (CC, pitch bend)
- [ ] Score/sheet music view
- [ ] Collaborative editing
- [ ] Cloud sync
