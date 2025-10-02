import * as vscode from 'vscode';
import { MidiEditorProvider } from './MidiEditorProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('MIDI Editor extension activated');

  // Register custom editor provider
  const provider = new MidiEditorProvider(context);
  const registration = vscode.window.registerCustomEditorProvider(
    'midiEditor.editor',
    provider,
    {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
      supportsMultipleEditorsPerDocument: false,
    }
  );

  context.subscriptions.push(registration);
}

export function deactivate() {
  console.log('MIDI Editor extension deactivated');
}
