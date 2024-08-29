import React, { useState, useEffect } from 'react';
import { Editor, EditorState, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';

function TextEditor({ initialText }) {
    const [editorState, setEditorState] = useState(
        EditorState.createWithContent(ContentState.createFromText(initialText))
    );

    useEffect(() => {
        setEditorState(EditorState.createWithContent(ContentState.createFromText(initialText)));
    }, [initialText]);

    return (
        <Editor
                editorState={editorState}
            onChange={setEditorState}
        />
    );
}

export default TextEditor;
