import { Point, type Canvas } from "fabric";
import { useCallback, useMemo } from "react";

type ZoomControlsProps = {
    canvas: Canvas | null;
};

const ZoomControls = ({ canvas }: ZoomControlsProps) => {
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

    const zoomLabel = useMemo(() => {
        if (!canvas) return "100%";
        return `${Math.round(canvas.getZoom() * 100)}%`;
    }, [canvas]);

    return (
        <div className="d-flex w-max">
            <button onClick={zoomOut}>Zoom -</button>
            <button onClick={zoomIn}>Zoom +</button>
            <button onClick={resetZoom}>Reset Zoom</button>
            <span style={{ fontWeight: 600, padding: "0 6px" }}>{zoomLabel}</span>
        </div>
    );
};

export default ZoomControls;
