import { useEffect, useState } from 'react';
import { FaDownload, FaFileExport } from 'react-icons/fa';
import ToolTipButton from './ToolTipButton';
import { useCanvas } from '../contexts/CanvasContext';

const ExportControls = () => {

    const { canvas, isCropping } = useCanvas();
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

        downloadFile(dataUrl, 'optimum-export.png');
    };

    const exportJSON = () => {
        if (!canvas || isCanvasEmpty) return;

        const canvasData = canvas.toObject(['id', 'selectable', 'hasControls']);

        const jsonString = JSON.stringify(canvasData, null, 2);
        const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`;

        downloadFile(dataUrl, 'optimum-project.json');
    };

    return (
        <>
            {!(isCanvasEmpty || !hasActiveSelection || isCropping) && (
                <>
                    <ToolTipButton icon={FaDownload} title='Download Selection' onClick={exportImage} />
                    <ToolTipButton icon={FaFileExport} title='Export Project' onClick={exportJSON} />
                </>
            )}
        </>
    );
};

export default ExportControls;
