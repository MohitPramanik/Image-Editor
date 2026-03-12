import { Circle, Color, FabricObject, IText, PencilBrush, Rect } from 'fabric'
import { memo, useCallback, useEffect, useState } from 'react'
import { RiPencilFill } from "react-icons/ri";
import { FaLocationArrow, FaRegCircle } from "react-icons/fa";
import { MdOutlineRectangle } from "react-icons/md";
import { FaWineGlass, FaWineGlassEmpty } from "react-icons/fa6";
import ToolTipButton from './ToolTipButton';
import { BiText } from 'react-icons/bi';
import { useCanvas } from '../contexts/CanvasContext';

type Mode = "select" | "pencil"
type Shapes = "circle" | "rectangle";

const Annotations = () => {

    const { canvas } = useCanvas();
    const [mode, setMode] = useState<Mode>("select");
    const [fillMode, setFillMode] = useState<boolean>(true);
    const [brushWidth, setBrushWidth] = useState<number>(2);
    const [color, setColor] = useState("#8b5cf6");
    const [selectedItem, setSelectedItem] = useState<FabricObject | null>(null);

    const normalizeToHex = (value: unknown) => {
        if (typeof value !== "string" || value.trim() === "") return null;
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return value;
        try {
            const hex = new Color(value).toHex();
            return `#${hex}`;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        if (!canvas) return;

        const handleSelection = (e: any) => {
            const selectedObject = e.selected?.[0];
            if (selectedObject) {
                setSelectedItem(selectedObject);
                setMode("select");
            } else {
                setSelectedItem(null);
            }
        };

        const handleCleared = () => {
            setSelectedItem(null);
        };

        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', handleCleared);

        return () => {
            canvas.off('selection:created', handleSelection);
            canvas.off('selection:updated', handleSelection);
            canvas.off('selection:cleared', handleCleared);
        };
    }, [canvas]);

    useEffect(() => {
        if (!canvas) return;

        if (mode === "pencil") {
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush = new PencilBrush(canvas);
            canvas.freeDrawingBrush.width = brushWidth;
            canvas.freeDrawingBrush.color = color;
            canvas.discardActiveObject();
            canvas.renderAll();
        } else {
            canvas.isDrawingMode = false;
        }
    }, [mode, canvas, brushWidth, color]);

    useEffect(() => {
        if (!selectedItem) return;
        const stroke = selectedItem.get("stroke");
        const fill = selectedItem.get("fill");
        const nextColorRaw =
            typeof stroke === "string" && stroke !== "" && stroke !== "transparent"
                ? stroke
                : typeof fill === "string" && fill !== "" && fill !== "transparent"
                    ? fill
                    : null;
        const nextColor = normalizeToHex(nextColorRaw);
        if (nextColor && nextColor !== color) {
            setColor(nextColor);
        }
    }, [selectedItem, color])

    const addText = useCallback(() => {
        if (!canvas) return;
        setMode("select");

        const text = new IText('Type here...', {
            left: 150,
            top: 150,
            fontFamily: 'Inter',
            fontSize: 40,
            fill: color,
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.centerObject(text);
        text.enterEditing();
        canvas.renderAll();
    }, [canvas, color])


    const addShape = (shapeName: Shapes) => {
        if (!canvas) return;
        setMode("select");

        let shape;
        const shapeProps = {
            top: 100,
            left: 100,
            fill: fillMode ? color : "transparent",
            stroke: color,
            strokeWidth: 2,
            cornerColor: '#fff',
            cornerStrokeColor: '#8b5cf6',
            transparentCorners: false,
            cornerSize: 8
        };

        switch (shapeName) {
            case "circle":
                shape = new Circle({ ...shapeProps, radius: 50 });
                break;
            case "rectangle":
                shape = new Rect({ ...shapeProps, height: 100, width: 100 });
                break;
        }

        if (shape) {
            canvas.add(shape);
            canvas.setActiveObject(shape);
            canvas.centerObject(shape);
            canvas.renderAll();
        }
    }

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextColor = e.target.value;
        setColor(nextColor);
        if (selectedItem) {
            const fill = selectedItem.get("fill");
            if (fill === "transparent" || fill == null || fill === "") {
                selectedItem.set({ stroke: nextColor });
            } else {
                selectedItem.set({ stroke: nextColor, fill: nextColor });
            }
            canvas?.renderAll();
            canvas?.fire('object:modified' as any, { target: selectedItem } as any);
        }
    }

    const handleBrushWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 1));
        setBrushWidth(val);
    }

    const handleFill = () => {
        const nextFill = !fillMode;
        setFillMode(nextFill);
        if (selectedItem) {
            selectedItem.set({ fill: nextFill ? color : "transparent" });
            canvas?.renderAll();
            canvas?.fire('object:modified' as any, { target: selectedItem } as any);
        }
    };

    return (
        <>
            <div className="sidebar-group">
                <ToolTipButton
                    icon={FaLocationArrow}
                    className={mode === "select" ? "active" : ""}
                    title='Select Tool'
                    onClick={() => setMode("select")}
                />
                <ToolTipButton
                    icon={RiPencilFill}
                    className={mode === "pencil" ? "active" : ""}
                    title='Pencil Draw'
                    onClick={() => setMode("pencil")}
                />
                <ToolTipButton icon={MdOutlineRectangle} title="Add Rectangle" onClick={() => addShape("rectangle")} />
                <ToolTipButton icon={FaRegCircle} title="Add Circle" onClick={() => addShape("circle")} />
                <ToolTipButton icon={BiText} title="Add Text" onClick={addText} />
            </div>

            {(selectedItem || mode === "pencil") && (
                <div className="tool-panel">
                    <h3 className="outfit">Settings</h3>
                    
                    <div className="input-group">
                        <span className="input-label">Object Color</span>
                        <input type='color' value={color} onChange={handleColorChange} />
                    </div>

                    {mode === "pencil" && (
                        <div className="input-group">
                            <span className="input-label">Brush Size: {brushWidth}px</span>
                            <input type="range" min="1" max="20" value={brushWidth} onChange={handleBrushWidth} />
                        </div>
                    )}

                    {selectedItem && !(selectedItem instanceof IText) && (
                        <div className="input-group">
                            <span className="input-label">Fill Shape</span>
                            <ToolTipButton
                                icon={fillMode ? FaWineGlass : FaWineGlassEmpty}
                                title={fillMode ? "Solid" : "Outline"}
                                className={fillMode ? "active" : ""}
                                onClick={handleFill} 
                            />
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default memo(Annotations);
