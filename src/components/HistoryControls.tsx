import { useCallback, useEffect, useRef, useState } from 'react';
import { IoIosRedo, IoIosUndo } from 'react-icons/io';
import ToolTipButton from './ToolTipButton';
import { useCanvas } from '../contexts/CanvasContext';

const HistoryControls = () => {

    const { canvas } = useCanvas();
    const historyStack = useRef<string[]>([]);
    const redoStack = useRef<string[]>([]);
    const isHandlingHistory = useRef(false);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    useEffect(() => {
        if (!canvas) return;

        const updateButtons = () => {
            setCanUndo(historyStack.current.length > 1);
            setCanRedo(redoStack.current.length > 0);
        };

        const saveState = (e?: any) => {
            if (isHandlingHistory.current) return;
            if (e?.target && (e.target as any).__skipHistory) return;

            const json = JSON.stringify(canvas.toJSON());
            
            if (historyStack.current[historyStack.current.length - 1] === json) return;

            historyStack.current.push(json);
            redoStack.current = [];
            updateButtons();
        };

        saveState();
        updateButtons();

        canvas.on('object:modified', saveState);
        canvas.on('object:added', saveState);
        canvas.on('object:removed', saveState);

        return () => {
            canvas.off('object:modified', saveState);
            canvas.off('object:added', saveState);
            canvas.off('object:removed', saveState);
        };
    }, [canvas]);

    const undo = useCallback(async () => {
        if (!canvas || historyStack.current.length <= 1) return;

        isHandlingHistory.current = true;

        const currentState = historyStack.current.pop()!;
        redoStack.current.push(currentState);

        const previousState = historyStack.current[historyStack.current.length - 1];
        
        await canvas.loadFromJSON(JSON.parse(previousState));
        canvas.renderAll();
        canvas.fire('history:restored' as any);

        isHandlingHistory.current = false;
        setCanUndo(historyStack.current.length > 1);
        setCanRedo(redoStack.current.length > 0);
    }, [canvas]);

    const redo = useCallback(async () => {
        if (!canvas || redoStack.current.length === 0) return;

        isHandlingHistory.current = true;

        const nextState = redoStack.current.pop()!;
        historyStack.current.push(nextState);

        await canvas.loadFromJSON(JSON.parse(nextState));
        canvas.renderAll();
        canvas.fire('history:restored' as any);

        isHandlingHistory.current = false;
        setCanUndo(historyStack.current.length > 1);
        setCanRedo(redoStack.current.length > 0);
    }, [canvas]);

    return (
        <>
            <ToolTipButton icon={IoIosUndo} onClick={undo} title="Undo" disabled={!canUndo} />
            <ToolTipButton icon={IoIosRedo} onClick={redo} title="Redo" disabled={!canRedo} />
        </>
    );
};

export default HistoryControls;
