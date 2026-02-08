import React from 'react';
import { type Canvas } from 'fabric';

interface ExportControlsProps {
    canvas: Canvas | null;
}

const ExportControls: React.FC<ExportControlsProps> = ({ canvas }) => {
    const isCanvasEmpty = !canvas || canvas.getObjects().length === 0;

    // Helper to trigger browser downloads
    const downloadFile = (data: string, fileName: string, type: string) => {
        const link = document.createElement('a');
        link.href = data;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportImage = () => {
        if (!canvas || isCanvasEmpty) return;

        // Generates the final edited image (including annotations/drawings)
        const dataUrl = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2, // Optional: Exports at 2x resolution
        });

        downloadFile(dataUrl, 'edited-image.png', 'image/png');
    };

    const exportJSON = () => {
        if (!canvas || isCanvasEmpty) return;

        // Exports all object properties, annotations, and metadata
        // Use toObject to include custom properties
        const canvasData = canvas.toObject(['id', 'selectable', 'hasControls']);

        const jsonString = JSON.stringify(canvasData, null, 2);
        const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`;

        downloadFile(dataUrl, 'metadata.json', 'application/json');
    };

    return (
        <div style={{ display: 'flex', gap: '10px', height: "max-content" }}>
            <button
                onClick={exportImage}
                className="bg-green-600 px-4 py-2 rounded"
                disabled={isCanvasEmpty}
            >
                Download Image
            </button>
            <button
                onClick={exportJSON}
                className="bg-gray-800 px-4 py-2 rounded"
                disabled={isCanvasEmpty}
            >
                Export JSON Data
            </button>
        </div>
    );
};

export default ExportControls;
