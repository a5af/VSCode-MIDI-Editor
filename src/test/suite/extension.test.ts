import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('vscode-midi-editor.vscode-midi-editor'));
  });

  test('Should activate extension', async () => {
    const ext = vscode.extensions.getExtension('vscode-midi-editor.vscode-midi-editor');
    await ext?.activate();
    assert.ok(ext?.isActive);
  });
});
