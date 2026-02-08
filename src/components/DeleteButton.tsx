import React, { useEffect, useState } from 'react';
import { type Canvas, type FabricObject } from 'fabric';

interface DeleteObjectProps {
    canvas: Canvas | null;
}

const DeleteButton: React.FC<DeleteObjectProps> = ({ canvas }) => {
    const [hasSelection, setHasSelection] = useState(false);

    useEffect(() => {
        if (!canvas) return;

        const updateSelection = () => {
            // Check if there is at least one object selected
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

        // 1. Get all currently selected objects (handles single and multi-select)
        const activeObjects = canvas.getActiveObjects();

        if (activeObjects.length > 0) {
            // 2. Remove them from the canvas
            activeObjects.forEach((obj: FabricObject) => {
                canvas.remove(obj);
            });

            // 3. Clear the selection box from the UI
            canvas.discardActiveObject();
            
            // 4. Re-render the canvas
            canvas.requestRenderAll();
            
            setHasSelection(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
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
            Delete Selected
        </button>
    );
};

export default DeleteButton;
