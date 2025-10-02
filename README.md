# VSCode MIDI Editor

A lightweight VSCode extension that provides a full-featured MIDI editor with piano roll interface, similar to DAW functionality.

## Features

- 🎹 **Piano roll editor** - Canvas-based piano roll with grid visualization
- 🎼 **Piano keyboard sidebar** - Visual representation of notes
- ⏱️ **Timeline ruler** - Bar/beat markers with time display
- ▶️ **Built-in MIDI playback** - Real-time synthesis with Tone.js
- 🔍 **Zoom controls** - Horizontal/vertical zoom (Ctrl+Scroll)
- 🖱️ **Pan/scroll** - Mouse wheel and drag navigation
- ✅ **Note selection** - Click to select, drag to multi-select
- 📐 **Grid snapping** - Configurable snap (1/4, 1/8, 1/16, 1/32)
- 🎵 **Multi-track support** - Color-coded tracks
- 🎨 **VSCode theme integration** - Respects your editor theme
- ⚡ **Fast and lightweight** - SolidJS (~7KB) + Vite
- ✅ **Automated tests** - Unit tests for utilities and transforms

## Getting Started

### Installation from source

1. Clone this repository
2. Run `npm install`
3. Run `npm run build`
4. Press F5 in VSCode to launch the extension in debug mode

### Development

```bash
# Install dependencies
npm install

# Build extension and webview
npm run build

# Watch mode (development)
npm run dev
```

### Usage

1. Open any `.mid` or `.midi` file in VSCode
2. The MIDI Editor will open automatically
3. Use the toolbar controls:
   - **▶ Play** - Play MIDI with synthesizer
   - **■ Stop** - Stop playback
   - **+ / -** - Zoom in/out
   - **↺** - Reset zoom
   - **Snap** - Toggle grid snapping

#### Keyboard Shortcuts

- **Ctrl + Scroll** - Zoom horizontal
- **Shift + Ctrl + Scroll** - Zoom vertical
- **Mouse Wheel** - Pan/scroll
- **Click + Drag** - Multi-select notes (selection rectangle)
- **Shift + Click** - Add to selection

## Technology Stack

- **Extension Host**: TypeScript, VSCode Extension API
- **Webview UI**: SolidJS, Vite
- **MIDI**: @tonejs/midi, Tone.js
- **Build**: esbuild, Vite

## Current Status (v0.1.0)

### ✅ Completed
- [x] Basic MIDI file loading and parsing
- [x] MIDI playback with real-time synthesis
- [x] Piano roll visualization with grid
- [x] Piano keyboard sidebar
- [x] Timeline with bar/beat markers
- [x] Note rendering with velocity visualization
- [x] Multi-select with selection rectangle
- [x] Zoom controls (horizontal/vertical)
- [x] Pan/scroll controls
- [x] Grid snapping (configurable divisions)
- [x] VSCode theme integration
- [x] Automated unit tests

### 🚧 In Progress / Planned
- [ ] Note editing (add, delete, move, resize notes)
- [ ] Copy/paste notes
- [ ] Undo/redo system
- [ ] Velocity editing (drag to adjust)
- [ ] Save functionality (write MIDI files back)
- [ ] Keyboard shortcuts panel
- [ ] Multi-track solo/mute controls
- [ ] Tempo and time signature editing
- [ ] MIDI CC/automation lanes
- [ ] Audio export (render to WAV)

## License

MIT
# VSCode-MIDI-Editor
