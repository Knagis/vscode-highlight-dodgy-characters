import * as assert from 'assert';
import * as vscode from 'vscode'
import * as highlightChars from '../extension'

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {

    test("Should highlight bad characters in example file", () => {
        const editor = vscode.window.activeTextEditor;
        assert.ok(editor);
        const decorations = highlightChars.createDecorations(<vscode.TextEditor>editor);
        // the example file contains 18 dodgy characters
        assert.equal(decorations.length, 18);
        // make sure the first two decorators are where they should be
        assert.deepEqual(decorations[0].range.start, { _line: 0, _character: 18 });
        assert.deepEqual(decorations[1].range.start, { _line: 1, _character: 19 });
    });
});