import React, { useEffect, useRef, useState } from 'react';
import { type Canvas } from 'fabric';

const HistoryControls = ({ canvas }: { canvas: Canvas | null }) => {
    const historyStack = useRef<string[]>([]);
    const redoStack = useRef<string[]>([]);
    const isHandlingHistory = useRef(false); // THE GUARD FLAG

    useEffect(() => {
        if (!canvas) return;

        const saveState = () => {
            // IF WE ARE UNDOING/REDOING, DO NOT SAVE A NEW STATE
            if (isHandlingHistory.current) return;

            const json = JSON.stringify(canvas.toJSON());
            
            // Avoid duplicates
            if (historyStack.current[historyStack.current.length - 1] === json) return;

            historyStack.current.push(json);
            redoStack.current = []; // Clear redo stack on NEW manual actions
        };

        // Initial snapshot
        saveState();

        canvas.on('object:modified', saveState);
        canvas.on('object:added', saveState);
        canvas.on('object:removed', saveState);

        return () => {
            canvas.off('object:modified', saveState);
            canvas.off('object:added', saveState);
            canvas.off('object:removed', saveState);
        };
    }, [canvas]);

    const undo = async () => {
        if (!canvas || historyStack.current.length <= 1) return;

        isHandlingHistory.current = true; // LOCK SAVING

        const currentState = historyStack.current.pop()!;
        redoStack.current.push(currentState);

        const previousState = historyStack.current[historyStack.current.length - 1];
        
        // Fabric v6 loadFromJSON returns a Promise
        await canvas.loadFromJSON(JSON.parse(previousState));
        canvas.renderAll();
        canvas.fire('history:restored' as any);

        isHandlingHistory.current = false; // UNLOCK SAVING
    };

    const redo = async () => {
        if (!canvas || redoStack.current.length === 0) return;

        isHandlingHistory.current = true; // LOCK SAVING

        const nextState = redoStack.current.pop()!;
        historyStack.current.push(nextState);

        await canvas.loadFromJSON(JSON.parse(nextState));
        canvas.renderAll();
        canvas.fire('history:restored' as any);

        isHandlingHistory.current = false; // UNLOCK SAVING
    };

    return (
        <div style={{height: "max-content"}}>
            <button onClick={undo}>Undo</button>
            <button onClick={redo}>Redo</button>
        </div>
    );
};

export default HistoryControls;
