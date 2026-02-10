import { Point } from "fabric";
import { useCallback } from "react";
import { GoZoomIn, GoZoomOut } from "react-icons/go";
import { TbZoomReset } from "react-icons/tb";
import ToolTipButton from "./ToolTipButton";
import { useCanvas } from "../contexts/CanvasContext";

const ZoomControls = () => {

    const { canvas } = useCanvas();
    const minZoom = 0.2;
    const maxZoom = 4;
    const step = 0.1;

    const getCenterPoint = useCallback(() => {
        if (!canvas) return null;
        return new Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
    }, [canvas]);

    const applyZoom = useCallback((nextZoom: number) => {
        if (!canvas) return;
        const clamped = Math.max(minZoom, Math.min(maxZoom, nextZoom));
        const center = getCenterPoint();
        if (!center) return;
        canvas.zoomToPoint(center, clamped);
        canvas.requestRenderAll();
    }, [canvas, getCenterPoint]);

    const zoomIn = () => {
        if (!canvas) return;
        applyZoom(canvas.getZoom() + step);
    };

    const zoomOut = () => {
        if (!canvas) return;
        applyZoom(canvas.getZoom() - step);
    };

    const resetZoom = () => {
        if (!canvas) return;
        applyZoom(1);
    };

    return (
        <div className="d-flex w-max">
            <ToolTipButton icon={GoZoomOut} title="Zoom-out" onClick={zoomOut} />
            <ToolTipButton icon={GoZoomIn} title="Zoom-in" onClick={zoomIn} />
            <ToolTipButton icon={TbZoomReset} title="Reset zoom" onClick={resetZoom} />
        </div>
    );
};

export default ZoomControls;
