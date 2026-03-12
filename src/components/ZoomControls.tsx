import { Point } from "fabric";
import { useCallback } from "react";
import { GoZoomIn, GoZoomOut } from "react-icons/go";
import { TbZoomReset } from "react-icons/tb";
import ToolTipButton from "./ToolTipButton";
import { useCanvas } from "../contexts/CanvasContext";

const ZoomControls = () => {

    const { canvas, isCropping } = useCanvas();
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
        <div className="sidebar-group">
            <ToolTipButton icon={GoZoomOut} title="Zoom Out" onClick={zoomOut} disabled={isCropping} />
            <ToolTipButton icon={GoZoomIn} title="Zoom In" onClick={zoomIn} disabled={isCropping} />
            <ToolTipButton icon={TbZoomReset} title="Reset Zoom" onClick={resetZoom} disabled={isCropping} />
        </div>
    );
};

export default ZoomControls;
