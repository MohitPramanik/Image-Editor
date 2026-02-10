import { useEffect, useState } from 'react';
import { type FabricObject } from 'fabric';
import { useCanvas } from '../contexts/CanvasContext';


const DeleteButton = () => {

    const { canvas } = useCanvas();
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
        <button
            onClick={handleDelete}
            aria-label='delete-btn'
            disabled={!hasSelection}
            style={{
                backgroundColor: hasSelection ? '#e74c3c' : '#bdc3c7',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: hasSelection ? 'pointer' : 'not-allowed',
            }}
        >
            Delete
        </button>
    );
};

export default DeleteButton;
