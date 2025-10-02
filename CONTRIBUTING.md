# Contributing to VSCode MIDI Editor

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites
- Node.js 18.x or 20.x
- npm 8.x or higher
- Visual Studio Code 1.85.0 or higher

### Getting Started

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/VSCode-MIDI-Editor.git
   cd VSCode-MIDI-Editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Run in development mode**
   ```bash
   npm run dev
   ```

5. **Launch extension development host**
   - Press `F5` in VSCode
   - This opens a new VSCode window with the extension loaded
   - Open a `.mid` or `.midi` file to test

### Project Structure

```
src/
├── extension/       # Extension host (Node.js)
│   ├── extension.ts
│   └── MidiEditorProvider.ts
└── webview/        # Webview UI (Browser)
    ├── index.tsx
    ├── App.tsx
    ├── components/
    ├── stores/
    └── utils/
```

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run webview tests in watch mode
npm run test:webview:watch

# Run extension tests
npm run test:extension
```

### Code Style

- We use ESLint for linting
- TypeScript strict mode is enabled
- Follow existing code patterns

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write tests for new functionality
   - Update documentation as needed
   - Follow existing code style

3. **Test your changes**
   ```bash
   npm test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `test:` - Test changes
   - `refactor:` - Code refactoring
   - `perf:` - Performance improvements
   - `chore:` - Build/tooling changes

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Guidelines

- **Title**: Use conventional commit format
- **Description**: Clearly describe what changes you made and why
- **Tests**: Include tests for new features/fixes
- **Documentation**: Update README.md if adding user-facing features
- **Screenshots**: Include for UI changes

## Areas for Contribution

### High Priority
- Note editing (add, delete, move, resize)
- Undo/redo system
- Save functionality
- Velocity editing

### Medium Priority
- Copy/paste notes
- Keyboard shortcuts panel
- Multi-track solo/mute controls
- Tempo and time signature editing

### Nice to Have
- MIDI CC/automation lanes
- Audio export (WAV)
- MIDI recording from hardware
- Performance optimizations

## Bug Reports

When filing a bug report, please include:

1. **VSCode version**: Help → About
2. **Extension version**: Extensions → MIDI Editor
3. **Operating system**: Windows/Mac/Linux
4. **Steps to reproduce**
5. **Expected vs actual behavior**
6. **MIDI file** (if specific to a file)
7. **Console errors**: Help → Toggle Developer Tools → Console

## Feature Requests

We welcome feature requests! Please:

1. Check existing issues first
2. Describe the use case
3. Explain how it benefits users
4. Consider implementation complexity

## Code Review Process

1. Maintainers will review PRs within 1 week
2. Address feedback and update PR
3. Once approved, maintainers will merge

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Open an issue with the "question" label or reach out to maintainers.

---

Thank you for contributing! 🎹🎵
