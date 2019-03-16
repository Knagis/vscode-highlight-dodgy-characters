import * as vscode from 'vscode';
import { debounce } from 'lodash';

export function activate(context: vscode.ExtensionContext) {
  const badCharDecorationType = vscode.window.createTextEditorDecorationType({
    cursor: 'crosshair',
    backgroundColor: 'rgba(255,0,0,0.3)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(255,0,0,0.6)'
  });

  let whitelist = '\n´\u0009'; // allow newline, forward-tick and tabulator
  whitelist += '€£';
  // European characters (http://fasforward.com/list-of-european-special-characters/)
  whitelist +=
    '¡¿äàáâãåǎąăæçćĉčđďðèéêëěęĝģğĥìíîïıĵķĺļłľñńňöòóôõőøœŕřẞßśŝşšșťţþțüùúûűũųůŵýÿŷźžż';
  whitelist += '«»'; // guillemets

  // search for non-ascii characters that are not on the whitelist
  const charRegExp = `[^\x00-\x7F${whitelist}]`;

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

  function updateDecorations(editor: vscode.TextEditor | void) {
    if (!editor) editor = vscode.window.activeTextEditor;
    if (!editor) return;

    let regEx = new RegExp(charRegExp, 'gi');
    const text = editor.document.getText();
    const badChars = [];
    let match;
    while (match = regEx.exec(text)) {
      const startPos = editor.document.positionAt(match.index);
      const endPos = editor.document.positionAt(match.index + match[0].length);
      const hexCharCode = match[0].charCodeAt(0).toString(16);
      const decoration = {
        range: new vscode.Range(startPos, endPos),
        hoverMessage: `Bad character: [${hexCharCode}](https://unicode.org/cldr/utility/character.jsp?a=${hexCharCode})`
      };
      badChars.push(decoration);
    }
    editor.setDecorations(badCharDecorationType, badChars);
  }
}
