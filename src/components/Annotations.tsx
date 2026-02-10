import { Circle, Color, FabricObject, IText, PencilBrush, Rect, type Canvas } from 'fabric'
import { useEffect, useState } from 'react'
import { RiPencilFill } from "react-icons/ri";
import { FaLocationArrow, FaRegCircle, FaWineGlass } from "react-icons/fa";
import { MdOutlineRectangle } from "react-icons/md";
import { FaWineGlassEmpty } from 'react-icons/fa6';
import ToolTipButton from './ToolTipButton';
import { BiText } from 'react-icons/bi';

type AnnotationsProps = {
    canvas: Canvas | null;
}

type Mode = "select" | "pencil"

type Shapes = "circle" | "rectangle";

const Annotations = ({ canvas }: AnnotationsProps) => {

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

    const addText = () => {
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
    };


    const addShape = (shapeName: Shapes) => {
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
    }

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


    return (
        <div className='d-flex flex-wrap'>
            <ToolTipButton
                className={`${mode === "select" ? "active" : null}`}
                title='Select'
                onClick={() => setMode("select")}
            >
                <FaLocationArrow />
            </ToolTipButton>

            <ToolTipButton
                className={`${mode === "pencil" ? "active" : null}`}
                title='Draw'
                onClick={() => setMode("pencil")}
            >
                <RiPencilFill />
            </ToolTipButton>

            <ToolTipButton title="Add Rectangle" onClick={() => addShape("rectangle")}>
                <MdOutlineRectangle />
            </ToolTipButton>

            <ToolTipButton title="Add Circle" onClick={() => addShape("circle")}>
                <FaRegCircle />
            </ToolTipButton>

            <ToolTipButton title="Add Text" onClick={addText}>
                <BiText />
            </ToolTipButton>

            <ToolTipButton title="Fill Shape" onClick={() => setFillMode((prev) => !prev)}>
                {fillMode ? <FaWineGlass className='text-danger' /> : <FaWineGlassEmpty />}
            </ToolTipButton>

            <input className="p-0 rounded-2 h-100" type='color' aria-label="Select Color" value={color} onChange={handleColorChange} />
            {
                mode === "pencil" &&
                <input type="number" value={brushWidth} aria-label="Set Brush Width" onChange={handleBrushWidth} min={1} max={10} />
            }

        </div>
    )
}

export default Annotations


