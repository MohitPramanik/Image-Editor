import { Circle, Color, FabricObject, IText, PencilBrush, Rect } from 'fabric'
import { memo, useCallback, useEffect, useState } from 'react'
import { RiPencilFill } from "react-icons/ri";
import { FaLocationArrow, FaRegCircle, FaWineGlass } from "react-icons/fa";
import { MdOutlineRectangle } from "react-icons/md";
import { FaWineGlassEmpty } from 'react-icons/fa6';
import ToolTipButton from './ToolTipButton';
import { BiText } from 'react-icons/bi';
import { useCanvas } from '../contexts/CanvasContext';

type Mode = "select" | "pencil"

type Shapes = "circle" | "rectangle";

const Annotations = () => {

    const { canvas } = useCanvas();
    const [mode, setMode] = useState<Mode>("select");
    const [fillMode, setFillMode] = useState<boolean>(true);
    const [brushWidth, setBrushWidth] = useState<number>(1);
    const [color, setColor] = useState("#00a34a");
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
            // IF we are currently cropping, IGNORE selection changes

            const selectedObject = e.selected?.[0];
            if (selectedObject) {
                setSelectedItem(selectedObject);

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

        const text = new IText('Type here...', {
            left: 150,
            top: 150,
            fontFamily: 'Arial',
            fontSize: 24,
            fill: color,
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        // Automatically enter edit mode so the user can start typing immediately
        text.enterEditing();
        canvas.renderAll();
    }, [])


    const addShape = useCallback((shapeName: Shapes) => {
        if (!canvas) return;

        setMode("select");

        let shape;

        switch (shapeName) {
            case "circle":
                shape = new Circle({
                    radius: 40,
                    top: 50,
                    left: 100,
                    fill: fillMode ? "blue" : "transparent",
                    stroke: "blue",
                    strokeWidth: 2,
                });
                break;

            case "rectangle":
                shape = new Rect({
                    height: 100,
                    width: 150,
                    top: 50,
                    left: 100,
                    fill: fillMode ? "green" : "transparent",
                    stroke: "green",
                    strokeWidth: 2,
                });
                break;

        }

        if (shape) {
            canvas.add(shape);
            setSelectedItem(shape);
            canvas.setActiveObject(shape);
            canvas.centerObject(shape);
            canvas.renderAll();
        }
    }, [])

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextColor = e.target.value;
        setColor(nextColor);
        const fill = selectedItem?.get("fill");
        if (fill === "transparent" || fill == null || fill === "") {
            selectedItem?.set({ stroke: nextColor });
        }
        else {
            selectedItem?.set({ stroke: nextColor, fill: nextColor });
        }
        canvas?.renderAll();
    }

    const handleBrushWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = parseInt(e.target.value, 10);
        val = val > 10 ? 10 : val;
        setBrushWidth(val);
    }

    const handleSelect = useCallback(() => {
        setMode("select")
    }, [])

    const handleDraw = useCallback(() => {
        setMode("pencil")
    }, [])

    const addRectangle = useCallback(() => {
        addShape("rectangle")
    }, [])

    const addCircle = useCallback(() => {
        addShape("circle")
    }, [])

    const handleFill = useCallback(() => {
        setFillMode((prev) => !prev)
    }, [])

    return (
        <div className='d-flex flex-wrap' style={{ height: "max-content" }}>
            <ToolTipButton
                icon={FaLocationArrow}
                className={`${mode === "select" ? "active" : null}`}
                title='Select'
                onClick={handleSelect}
            />

            <ToolTipButton
                icon={RiPencilFill}
                className={`${mode === "pencil" ? "active" : null}`}
                title='Draw'
                onClick={handleDraw}
            />

            <ToolTipButton icon={MdOutlineRectangle} title="Add Rectangle" onClick={addRectangle} />
            <ToolTipButton icon={FaRegCircle} title="Add Circle" onClick={addCircle} />
            <ToolTipButton icon={BiText} title="Add Text" onClick={addText} />
            <ToolTipButton
                icon={fillMode ? FaWineGlass : FaWineGlassEmpty}
                title="Fill Shape"
                className={`${fillMode ? "active" : null}`}
                onClick={handleFill} />

            <input className="p-0 rounded-2" style={{ height: "42px" }} type='color' aria-label="Select Color" value={color} onChange={handleColorChange} />
            {
                mode === "pencil" &&
                <input type="number" value={brushWidth} aria-label="Set Brush Width" onChange={handleBrushWidth} min={1} max={10} />
            }

        </div>
    )
}

export default memo(Annotations);


