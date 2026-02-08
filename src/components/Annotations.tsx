import { Canvas, Rect, Circle, Textbox, PencilBrush, Point } from 'fabric';
import { useEffect, useRef, useState } from 'react';

type AnnotationsProps = {
    canvas: Canvas | null;
};

type Mode = 'select' | 'pencil' | 'rect' | 'circle' | 'text';

const Annotations = ({ canvas }: AnnotationsProps) => {
    const [mode, setMode] = useState<Mode>('select');
    const [strokeColor, setStrokeColor] = useState('#111111');
    const [strokeWidth, setStrokeWidth] = useState(2);

    const isDrawing = useRef(false);
    const startPoint = useRef<Point | null>(null);
    const activeShape = useRef<Rect | Circle | Textbox | null>(null);
    const dragThreshold = 3;
    const pencilDown = useRef(false);
    const pencilMoved = useRef(false);

    useEffect(() => {
        if (!canvas) return;

        canvas.isDrawingMode = false;
        canvas.selection = mode === 'select';

        if (mode === 'pencil') {
            const brush = new PencilBrush(canvas);
            brush.color = strokeColor;
            brush.width = strokeWidth;
            canvas.freeDrawingBrush = brush;
        }

        canvas.renderAll();
    }, [canvas, mode, strokeColor, strokeWidth]);

    useEffect(() => {
        if (!canvas) return;

        const handleMouseDown = (opt: any) => {
            if (!canvas) return;
            if (opt.e?.button !== 0) return;

            const pointer = (canvas as any).getPointer(opt.e);
            startPoint.current = new Point(pointer.x, pointer.y);
            if (mode === 'pencil') {
                pencilDown.current = true;
                pencilMoved.current = false;
                canvas.isDrawingMode = true;
                return;
            }

            if (mode === 'rect') {
                const rect = new Rect({
                    left: pointer.x,
                    top: pointer.y,
                    width: 0,
                    height: 0,
                    fill: 'rgba(0,0,0,0)',
                    stroke: strokeColor,
                    strokeWidth,
                    strokeUniform: true,
                    selectable: false,
                    evented: false,
                    originX: 'left',
                    originY: 'top',
                });
                activeShape.current = rect;
                isDrawing.current = true;
                canvas.add(rect);
            }

            if (mode === 'circle') {
                const circle = new Circle({
                    left: pointer.x,
                    top: pointer.y,
                    radius: 0,
                    fill: 'rgba(0,0,0,0)',
                    stroke: strokeColor,
                    strokeWidth,
                    strokeUniform: true,
                    selectable: false,
                    evented: false,
                    originX: 'center',
                    originY: 'center',
                });
                activeShape.current = circle;
                isDrawing.current = true;
                canvas.add(circle);
            }

            if (mode === 'text') {
                const text = new Textbox('Text', {
                    left: pointer.x,
                    top: pointer.y,
                    width: 20,
                    height: 20,
                    fill: strokeColor,
                    fontSize: 20,
                    selectable: false,
                    evented: false,
                    originX: 'left',
                    originY: 'top',
                });
                activeShape.current = text;
                isDrawing.current = true;
                canvas.add(text);
            }
        };

        const handleMouseMove = (opt: any) => {
            if (!canvas || !isDrawing.current || !activeShape.current || !startPoint.current) return;

            const pointer = (canvas as any).getPointer(opt.e);
            const start = startPoint.current;

            if (activeShape.current instanceof Rect) {
                const left = Math.min(start.x, pointer.x);
                const top = Math.min(start.y, pointer.y);
                const width = Math.abs(pointer.x - start.x);
                const height = Math.abs(pointer.y - start.y);

                activeShape.current.set({ left, top, width, height });
            }

            if (activeShape.current instanceof Circle) {
                const dx = pointer.x - start.x;
                const dy = pointer.y - start.y;
                const radius = Math.sqrt(dx * dx + dy * dy) / 2;
                const cx = (start.x + pointer.x) / 2;
                const cy = (start.y + pointer.y) / 2;

                activeShape.current.set({ left: cx, top: cy, radius });
            }

            if (activeShape.current instanceof Textbox) {
                const left = Math.min(start.x, pointer.x);
                const top = Math.min(start.y, pointer.y);
                const width = Math.max(Math.abs(pointer.x - start.x), 20);
                const height = Math.max(Math.abs(pointer.y - start.y), 20);
                activeShape.current.set({ left, top, width, height });
            }

            canvas.renderAll();
        };

        const handleMouseUp = (opt: any) => {
            if (!canvas || !isDrawing.current || !activeShape.current) return;

            const pointer = (canvas as any).getPointer(opt.e);
            const start = startPoint.current;
            const dx = start ? Math.abs(pointer.x - start.x) : 0;
            const dy = start ? Math.abs(pointer.y - start.y) : 0;
            const tooSmall = dx < dragThreshold && dy < dragThreshold;

            if (tooSmall) {
                canvas.remove(activeShape.current);
                activeShape.current = null;
                isDrawing.current = false;
                startPoint.current = null;
                canvas.renderAll();
                return;
            }

            activeShape.current.set({ selectable: true, evented: true });
            canvas.setActiveObject(activeShape.current);
            if (activeShape.current instanceof Textbox && typeof activeShape.current.enterEditing === 'function') {
                activeShape.current.enterEditing();
            }
            activeShape.current = null;
            isDrawing.current = false;
            startPoint.current = null;
            canvas.renderAll();
        };

        const handlePencilMove = (opt: any) => {
            if (mode !== 'pencil' || !pencilDown.current || !startPoint.current || !canvas) return;
            const pointer = (canvas as any).getPointer(opt.e);
            const start = startPoint.current;
            const dx = Math.abs(pointer.x - start.x);
            const dy = Math.abs(pointer.y - start.y);
            if (dx >= dragThreshold || dy >= dragThreshold) {
                pencilMoved.current = true;
            }
        };

        const handlePencilUp = () => {
            if (mode !== 'pencil') return;
            pencilDown.current = false;
            canvas.isDrawingMode = false;
        };

        const handleMouseOut = () => {
            if (mode !== 'pencil') return;
            pencilDown.current = false;
            canvas.isDrawingMode = false;
        };

        const handleWindowMouseUp = () => {
            if (!canvas || mode !== 'pencil') return;
            pencilDown.current = false;
            pencilMoved.current = false;
            canvas.isDrawingMode = false;
        };

        const handlePathCreated = (opt: any) => {
            if (mode !== 'pencil') return;
            if (!pencilMoved.current) {
                canvas?.remove(opt.path);
                canvas?.renderAll();
            }
        };

        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);
        canvas.on('mouse:move', handlePencilMove);
        canvas.on('mouse:up', handlePencilUp);
        canvas.on('mouse:out', handleMouseOut);
        canvas.on('path:created', handlePathCreated);
        window.addEventListener('mouseup', handleWindowMouseUp);

        return () => {
            canvas.off('mouse:down', handleMouseDown);
            canvas.off('mouse:move', handleMouseMove);
            canvas.off('mouse:up', handleMouseUp);
            canvas.off('mouse:move', handlePencilMove);
            canvas.off('mouse:up', handlePencilUp);
            canvas.off('mouse:out', handleMouseOut);
            canvas.off('path:created', handlePathCreated);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [canvas, mode, strokeColor, strokeWidth]);

    return (
        <div className='d-inline-block w-max'>
            <button onClick={() => setMode('select')}>Select</button>
            <button onClick={() => setMode('pencil')}>Pencil</button>
            <button onClick={() => setMode('rect')}>Rectangle</button>
            <button onClick={() => setMode('circle')}>Circle</button>
            <button onClick={() => setMode('text')}>Text</button>
            <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                title="Stroke Color"
            />
            <input
                type="number"
                min={1}
                max={20}
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                title="Stroke Width"
            />
        </div>
    );
};

export default Annotations;
