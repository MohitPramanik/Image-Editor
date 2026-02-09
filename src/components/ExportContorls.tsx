import React, { useEffect, useState } from 'react';
import { type Canvas } from 'fabric';

interface ExportControlsProps {
    canvas: Canvas | null;
    isCropping: boolean;
}

const ExportControls: React.FC<ExportControlsProps> = ({ canvas, isCropping }) => {
    const isCanvasEmpty = !canvas || canvas.getObjects().length === 0;
    const [hasActiveSelection, setHasActiveSelection] = useState(false);

    useEffect(() => {
        if (!canvas) {
            setHasActiveSelection(false);
            return;
        }

        const updateSelection = () => {
            setHasActiveSelection(!!canvas.getActiveObject());
        };

        updateSelection();
        canvas.on('selection:created', updateSelection);
        canvas.on('selection:updated', updateSelection);
        canvas.on('selection:cleared', updateSelection);

        return () => {
            canvas.off('selection:created', updateSelection);
            canvas.off('selection:updated', updateSelection);
            canvas.off('selection:cleared', updateSelection);
        };
    }, [canvas]);

    const downloadFile = (data: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = data;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportImage = () => {
        if (!canvas || isCanvasEmpty) return;
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;

        const retina =
            typeof (canvas as any).getRetinaScaling === 'function'
                ? (canvas as any).getRetinaScaling()
                : window.devicePixelRatio || 1;
        const multiplier = Math.max(2, retina);

        const dataUrl = activeObject.toDataURL({
            format: 'png',
            quality: 1,
            multiplier,
        });

        downloadFile(dataUrl, 'edited-image.png');
    };

    const exportJSON = () => {
        if (!canvas || isCanvasEmpty) return;

        const canvasData = canvas.toObject(['id', 'selectable', 'hasControls']);

        const jsonString = JSON.stringify(canvasData, null, 2);
        const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`;

        downloadFile(dataUrl, 'metadata.json');
    };

    return (
        <div className='d-flex flex-wrap' style={{ gap: '10px', height: "max-content" }}>
            {!(isCanvasEmpty || !hasActiveSelection || isCropping) ?
                <>
                    <button
                        onClick={exportImage}
                        className="bg-green-600 px-4 py-2 rounded"
                    >
                        Download Selected
                    </button>
                    <button
                        onClick={exportJSON}
                        className="bg-gray-800 px-4 py-2 rounded"
                    >
                        Export JSON Data
                    </button>
                </>
                : null
            }
        </div>
    );
};

export default ExportControls;
