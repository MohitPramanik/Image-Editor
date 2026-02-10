import { useEffect } from 'react';
import { useCanvas } from '../contexts/CanvasContext'
import { Canvas } from 'fabric';

const CanvasBox = () => {

    const { canvas, canvasRef, canvasShellRef, isPanning, setCanvas } = useCanvas();

    useEffect(() => {
        if (!canvasRef.current) return;
        let initCanvas = new Canvas(canvasRef.current, {
            height: 500,
            width: 800,
            targetFindTolerance: 12,
            perPixelTargetFind: true
        });

        initCanvas.backgroundColor = "#fff";
        initCanvas.allowTouchScrolling = false;
        initCanvas.renderAll();

        setCanvas(initCanvas);

        return () => {
            initCanvas.dispose();
        }
    }, [])

    useEffect(() => {
        if (!canvas) return;
        if (isPanning) {
            canvas.isDrawingMode = false;
            canvas.selection = false;
            canvas.skipTargetFind = true;
            canvas.defaultCursor = 'grab';
            canvas.hoverCursor = 'grab';
            canvas.allowTouchScrolling = true;
        } else {
            canvas.skipTargetFind = false;
            canvas.selection = true;
            canvas.defaultCursor = 'default';
            canvas.hoverCursor = 'move';
            canvas.allowTouchScrolling = false;
        }
        canvas.requestRenderAll();
    }, [canvas, isPanning]);


    useEffect(() => {
        const shell = canvasShellRef.current;
        if (!shell) return;

        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;

        const onPointerDown = (e: PointerEvent) => {
            if (!isPanning) return;
            isDown = true;
            startX = e.clientX;
            scrollLeft = shell.scrollLeft;
            shell.setPointerCapture?.(e.pointerId);
            e.preventDefault();
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!isDown || !isPanning) return;
            const dx = e.clientX - startX;
            shell.scrollLeft = scrollLeft - dx;
        };

        const onPointerUp = (e: PointerEvent) => {
            if (!isDown) return;
            isDown = false;
            shell.releasePointerCapture?.(e.pointerId);
        };

        shell.addEventListener('pointerdown', onPointerDown);
        shell.addEventListener('pointermove', onPointerMove);
        shell.addEventListener('pointerup', onPointerUp);
        shell.addEventListener('pointercancel', onPointerUp);

        return () => {
            shell.removeEventListener('pointerdown', onPointerDown);
            shell.removeEventListener('pointermove', onPointerMove);
            shell.removeEventListener('pointerup', onPointerUp);
            shell.removeEventListener('pointercancel', onPointerUp);
        };
    }, [isPanning]);

    return (
        <div className={`border border-2 border-secondary rounded-3 overflow-hidden d-flex justify-content-center ${isPanning ? 'is-panning' : ''}`} ref={canvasShellRef}>
            <canvas id='canvas' ref={canvasRef} className='editor-canvas' />
        </div>
    )
}

export default CanvasBox
