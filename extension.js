const vscode = require('vscode');

function activate(context) {
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

  // search for non-ascii characters that are not on the whitelist
  const charRegExp = `[^\x00-\x7F${whitelist}]`;

  let editor = vscode.window.activeTextEditor;
  if (editor) {
    triggerUpdateDecorations();
  }

  vscode.window.onDidChangeActiveTextEditor(
    editor => {
      editor = editor;
      if (editor) {
        triggerUpdateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    event => {
      if (editor && event.document === editor.document) {
        triggerUpdateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  var timeout = null;
  function triggerUpdateDecorations() {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(updateDecorations, 500);
  }

  function updateDecorations() {
    if (!editor) {
      return;
    }
    let regEx = new RegExp(charRegExp, 'g');
    const text = editor.document.getText();
    const badChars = [];
    let match;
    while ((match = regEx.exec(text))) {
      const startPos = editor.document.positionAt(match.index);
      const endPos = editor.document.positionAt(match.index + match[0].length);
      const decoration = {
        range: new vscode.Range(startPos, endPos),
        hoverMessage: 'Bad char "**' + match[0] + '**"'
      };
      badChars.push(decoration);
    }
    editor.setDecorations(badCharDecorationType, badChars);
  }
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map
