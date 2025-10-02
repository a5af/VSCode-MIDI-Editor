# Changelog

All notable changes to the "MIDI Editor" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-10-02

### Added
- Piano roll editor with canvas-based rendering
- Piano keyboard sidebar with visual note representation
- Timeline ruler with bar/beat markers
- Built-in MIDI playback using Tone.js synthesis
- Zoom controls (horizontal/vertical) via Ctrl+Scroll
- Pan/scroll with mouse wheel and drag
- Note selection (click to select, drag for multi-select)
- Grid snapping with configurable divisions (1/4, 1/8, 1/16, 1/32)
- Multi-track support with color-coded tracks
- VSCode theme integration
- Automated unit tests for utilities and transforms

### Technical
- SolidJS (~7KB) for reactive UI
- Vite for fast development and builds
- @tonejs/midi for MIDI parsing
- Tone.js for audio synthesis
- esbuild for extension bundling

[Unreleased]: https://github.com/a5af/VSCode-MIDI-Editor/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/a5af/VSCode-MIDI-Editor/releases/tag/v0.1.0
