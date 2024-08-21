import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

function PDFViewer({ file }) {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    return (
        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
            <div style={{ height: '750px' }}>
                {file ? (
                    <Viewer
                        fileUrl={file}
                        plugins={[defaultLayoutPluginInstance]}
                    />
                ) : (
                    <p>No PDF file selected</p>
                )}
            </div>
        </Worker>
    );
}

export default PDFViewer;
