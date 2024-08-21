import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [file, setFile] = useState(null);
    const [text, setText] = useState("");
    const [spellingErrors, setSpellingErrors] = useState([]);
    const [grammarErrors, setGrammarErrors] = useState([]);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const handleFileUpload = (event) => {
        const uploadedFile = event.target.files[0];
        setFile(uploadedFile);
        setText(""); 
        setSpellingErrors([]); 
        setGrammarErrors([]); 
        setError(""); 
        setCurrentPage(1);
        setTotalPages(0);
    };

    const handleConvert = async () => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('page', currentPage);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setText(response.data.text);
            setTotalPages(response.data.total_pages);
        } catch (error) {
            setError("Failed to convert PDF. " + (error.response?.data?.error || error.message));
        }
    };

    const handleSpellCheck = async () => {
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/spellcheck/', { text });
        setSpellingErrors(response.data.errors || []); // Default to empty array if response is not defined
    } catch (error) {
        setError("Failed to check spelling. " + (error.response?.data?.error || error.message));
    }
};


    const handleGrammarCheck = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/grammarcheck/', { text });
            setGrammarErrors(response.data.errors);
        } catch (error) {
            setError("Failed to check grammar. " + (error.response?.data?.error || error.message));
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            handleConvert();
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            handleConvert();
        }
    };

    const highlightErrors = (text) => {
        let highlightedText = text.split(' ').map((word, index) => {
            let spellError = spellingErrors.find(e => e.index === index);
            if (spellError) {
                return `<span class="spell-error" title="Suggestions: ${spellError.suggestions.join(', ')}">${word}</span>`;
            }
            return word;
        }).join(' ');

        grammarErrors.forEach(err => {
            let start = err.offset;
            let end = start + err.length;
            let replacement = `<span class="grammar-error" title="${err.message}">${highlightedText.substring(start, end)}</span>`;
            highlightedText = highlightedText.slice(0, start) + replacement + highlightedText.slice(end);
        });

        return { __html: highlightedText };
    };

    return (
        <div className="App">
            <input type="file" onChange={handleFileUpload} />
            <button onClick={handleConvert} disabled={!file}>Convert</button>
            {error && <div className="error">{error}</div>}
            <div style={{ display: 'flex' }}>
                <div style={{ flex: 1 }}>
                    {file && (
                        <iframe 
                            src={URL.createObjectURL(file)} 
                            width="100%" 
                            height="600px" 
                            title="PDF Viewer"
                        />
                    )}
                    <button onClick={handlePreviousPage} disabled={currentPage <= 1}>Previous</button>
                    <button onClick={handleNextPage} disabled={currentPage >= totalPages}>Next</button>
                </div>
                <div style={{ flex: 1 }}>
                    <h3>Converted Text (Page {currentPage}):</h3>
                    <p dangerouslySetInnerHTML={highlightErrors(text)} />
                    <h4>Spelling Errors:</h4>
                    <p>{spellingErrors.length > 0 ? spellingErrors.map(e => `${e.word} (Suggestions: ${e.suggestions.join(', ')})`).join(', ') : 'No spelling errors found'}</p>
                    <h4>Grammar Errors:</h4>
                    <p>{grammarErrors.length > 0 ? grammarErrors.map(e => `${e.message}`).join(', ') : 'No grammar errors found'}</p>
                    <button onClick={handleSpellCheck} disabled={!text}>Check Spelling</button>
                    <button onClick={handleGrammarCheck} disabled={!text}>Check Grammar</button>
                </div>
            </div>
        </div>
    );
}

export default App;
