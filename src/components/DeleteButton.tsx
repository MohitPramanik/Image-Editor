import { useEffect, useState } from 'react';
import { type FabricObject } from 'fabric';
import { useCanvas } from '../contexts/CanvasContext';
import ToolTipButton from './ToolTipButton';
import { HiTrash } from 'react-icons/hi';

const DeleteButton = () => {

    const { canvas, isCropping } = useCanvas();
    const [hasSelection, setHasSelection] = useState(false);

    useEffect(() => {
        if (!canvas) return;

        const updateSelection = () => {
            setHasSelection(canvas.getActiveObjects().length > 0);
        };

        canvas.on('selection:created', updateSelection);
        canvas.on('selection:updated', updateSelection);
        canvas.on('selection:cleared', updateSelection);

        return () => {
            canvas.off('selection:created', updateSelection);
            canvas.off('selection:updated', updateSelection);
            canvas.off('selection:cleared', updateSelection);
        };
    }, [canvas]);

    const handleDelete = () => {
        if (!canvas) return;
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
            activeObjects.forEach((obj: FabricObject) => {
                canvas.remove(obj);
            });
            canvas.discardActiveObject();
            canvas.requestRenderAll();
            setHasSelection(false);
        }
    };

    return (
        <ToolTipButton 
            icon={HiTrash} 
            title="Delete Selection" 
            onClick={handleDelete} 
            disabled={!hasSelection || isCropping}
            className="delete-tool-btn"
        />
    );
};

export default DeleteButton;
