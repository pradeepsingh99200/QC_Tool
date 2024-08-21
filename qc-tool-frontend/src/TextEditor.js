import React, { useState } from 'react';
import { Editor, EditorState, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';

function TextEditor({ initialText }) {
    const [editorState, setEditorState] = useState(
        EditorState.createWithContent(ContentState.createFromText(initialText))
    );

    return (
        <Editor
            editorState={editorState}
            onChange={setEditorState}
        />
    );
}

export default TextEditor;
