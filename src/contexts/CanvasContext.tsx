import type { Canvas } from "fabric";
import { createContext, useContext, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";

type CanvasProviderType = {
    children: React.ReactElement;
}

type CanvasValues = {
    canvas: Canvas | null;
    setCanvas: Dispatch<SetStateAction<Canvas | null>>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    isCropping: boolean;
    setIsCropping: Dispatch<SetStateAction<boolean>>;
    canvasShellRef: RefObject<HTMLDivElement | null>;
    isPanning: boolean;
    setIsPanning: Dispatch<SetStateAction<boolean>>;
}

const CanvasContext = createContext<CanvasValues | null>(null);

export const useCanvas = () => {
    const context = useContext(CanvasContext);
    if (!context) {
        throw new Error("useCanvas must be used within a CanvasProvider");
    }
    return context;
}

export const CanvasProvider = ({ children }: CanvasProviderType) => {

    const [canvas, setCanvas] = useState<Canvas | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isCropping, setIsCropping] = useState<boolean>(false);
    const canvasShellRef = useRef<HTMLDivElement | null>(null);
    const [isPanning, setIsPanning] = useState<boolean>(false);

    return (
        <CanvasContext.Provider value={
            {
                canvas, setCanvas, canvasRef, isCropping, setIsCropping,
                canvasShellRef, isPanning, setIsPanning
            }}
        >
            {children}
        </CanvasContext.Provider>
    )
}