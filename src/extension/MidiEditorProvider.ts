import * as vscode from 'vscode';
import * as path from 'path';

interface MidiDocumentDelegate {
  getFileData(): Promise<Uint8Array>;
}

class MidiDocument implements vscode.CustomDocument {
  constructor(
    public readonly uri: vscode.Uri,
    private readonly delegate: MidiDocumentDelegate
  ) {}

  dispose(): void {
    // Clean up document resources
  }
}

export class MidiEditorProvider implements vscode.CustomReadonlyEditorProvider<MidiDocument> {
  private static readonly viewType = 'midiEditor.editor';

  constructor(private readonly context: vscode.ExtensionContext) {}

  async openCustomDocument(
    uri: vscode.Uri,
    openContext: vscode.CustomDocumentOpenContext,
    token: vscode.CancellationToken
  ): Promise<MidiDocument> {
    const delegate: MidiDocumentDelegate = {
      getFileData: async () => {
        const data = await vscode.workspace.fs.readFile(uri);
        return data;
      },
    };

    return new MidiDocument(uri, delegate);
  }

  async resolveCustomEditor(
    document: MidiDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): Promise<void> {
    // Configure webview
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview'),
      ],
    };

    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    // Handle messages from webview
    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'requestMidiData':
          try {
            const fileData = await vscode.workspace.fs.readFile(document.uri);
            webviewPanel.webview.postMessage({
              type: 'midiData',
              data: Array.from(fileData), // Convert Uint8Array to regular array for JSON serialization
            });
          } catch (error) {
            vscode.window.showErrorMessage(
              `Failed to load MIDI file: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
          break;

        case 'log':
          console.log('Webview:', message.message);
          break;

        case 'error':
          vscode.window.showErrorMessage(message.message);
          break;
      }
    });

    // Send initial message when webview is ready
    const disposable = webviewPanel.webview.onDidReceiveMessage((message) => {
      if (message.type === 'webviewReady') {
        disposable.dispose();
      }
    });
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'index.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'index.css')
    );

    // Use a nonce for content security policy
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; connect-src ${webview.cspSource};">
  <link href="${styleUri}" rel="stylesheet">
  <title>MIDI Editor</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
