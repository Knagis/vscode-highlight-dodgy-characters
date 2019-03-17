import * as vscode from 'vscode';
import { debounce } from 'lodash';

const configuration = vscode.workspace.getConfiguration('highlight-dodgy-characters');
const badCharDecorationType = vscode.window.createTextEditorDecorationType({
  cursor: 'crosshair',
  backgroundColor: 'rgba(255,0,0,0.3)',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(255,0,0,0.6)'
});

let whitelist = '\n\u0009'; // allow newline and tabulator
whitelist += configuration.whitelist;

// search for non-ascii characters that are not on the whitelist
const badCharMatcher = `[^\x00-\x7F${whitelist}]`;

export function activate(context: vscode.ExtensionContext) {
  // execute function on the leading edge of the debounce -> only defer subsequent calls
  const triggerUpdateDecorations = debounce(updateDecorations, 500, { leading: true });

  triggerUpdateDecorations();

  vscode.window.onDidChangeActiveTextEditor(
    editor => triggerUpdateDecorations(editor),
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    event => {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document === event.document) triggerUpdateDecorations(editor);
    },
    null,
    context.subscriptions
  );
}

function updateDecorations(editor: vscode.TextEditor | void) {
  if (!editor) editor = vscode.window.activeTextEditor;
  if (editor) {
    const decorations = createDecorations(editor);
    editor.setDecorations(badCharDecorationType, decorations);
  }
}

export function createDecorations(editor: vscode.TextEditor): vscode.DecorationOptions[] {
  const badCahrRegExp = new RegExp(badCharMatcher, 'gi');
  const text = editor.document.getText();
  const decorations = [];
  let match;
  while (match = badCahrRegExp.exec(text)) {
    const startPos = editor.document.positionAt(match.index);
    const endPos = editor.document.positionAt(match.index + match[0].length);
    const hexCharCode = match[0].charCodeAt(0).toString(16);
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: `Bad character: [${hexCharCode}](https://unicode.org/cldr/utility/character.jsp?a=${hexCharCode})`
    };
    decorations.push(decoration);
  }

  return decorations;
}