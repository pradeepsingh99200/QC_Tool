import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import PDFViewer from './PDFViewer'; // Import PDFViewer component
import TextEditor from './TextEditor'; // Import TextEditor component

function App() {
    const [file, setFile] = useState(null);
    const [text, setText] = useState("");
    const [spellingErrors, setSpellingErrors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pdfUrl, setPdfUrl] = useState("");
    const [editedText, setEditedText] = useState("");
    const [error, setError] = useState("");
    const [selectedError, setSelectedError] = useState(null);

    const handleFileUpload = (event) => {
        const uploadedFile = event.target.files[0];
        setFile(uploadedFile);
        setText(""); 
        setSpellingErrors([]);
        setError("");
        setCurrentPage(1);
        setTotalPages(0);
        setPdfUrl(URL.createObjectURL(uploadedFile)); 
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
            setText(response.data.text || '');
            setTotalPages(response.data.total_pages || 0);
            setEditedText(response.data.text || ''); // Initialize edited text
        } catch (error) {
            setError("Failed to convert PDF. " + (error.response?.data?.error || error.message));
        }
    };

    const handleSpellCheck = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/spellcheck/', { text });
            setSpellingErrors(response.data.errors || []);
        } catch (error) {
            setError("Failed to check spelling. " + (error.response?.data?.error || error.message));
        }
    };

    const handleGrammarCheck = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/grammarcheck/', { text });
            // Handle grammar check errors if needed
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
            let spellError = spellingErrors.find(e => e.word === word);
            if (spellError) {
                return `<span class="spell-error" onclick="handleErrorClick('${word}')">${word}</span>`;
            }
            return word;
        }).join(' ');

        return { __html: highlightedText };
    };

    const handleErrorClick = (word) => {
        const error = spellingErrors.find(e => e.word === word);
        if (error) {
            setSelectedError(error);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        const updatedText = editedText.replace(selectedError.word, suggestion);
        setEditedText(updatedText);
        setText(updatedText);
        setSelectedError(null);
    };

    const handleDownloadPDF = async () => {
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/generate-pdf/', { text });
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'edited_document.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Failed to download PDF:', error);
    }
};

    return (
        <div className="App">
            <input type="file" onChange={handleFileUpload} />
            <button onClick={handleConvert} disabled={!file}>Convert</button>
            {error && <div className="error">{error}</div>}
            <div style={{ display: 'flex' }}>
                <div style={{ flex: 1 }}>
                    {pdfUrl && (
                        <PDFViewer
                            file={pdfUrl}
                            pageNumber={currentPage}
                        />
                    )}
                    <button onClick={handlePreviousPage} disabled={currentPage <= 1}>Previous</button>
                    <button onClick={handleNextPage} disabled={currentPage >= totalPages}>Next</button>
                </div>
                <div style={{ flex: 1 }}>
                    <h3>Converted Text (Page {currentPage}):</h3>
                    <div dangerouslySetInnerHTML={highlightErrors(text)} />
                    {selectedError && (
                        <div>
                            <h4>Suggestions for "{selectedError.word}":</h4>
                            <ul>
                                {selectedError.suggestions.map(suggestion => (
                                    <li key={suggestion} onClick={() => handleSuggestionClick(suggestion)}>{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <h4>Edited Text:</h4>
                    <TextEditor
                        initialText={editedText}
                        onChange={setEditedText}
                    />
                    <button onClick={handleSpellCheck} disabled={!text}>Check Spelling</button>
                    <button onClick={handleGrammarCheck} disabled={!text}>Check Grammar</button>
                    <button onClick={handleDownloadPDF} disabled={!editedText}>Download Edited PDF</button>
                </div>
            </div>
        </div>
    );
}

export default App;