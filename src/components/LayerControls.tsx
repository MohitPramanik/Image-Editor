import { type Canvas } from "fabric";
import { useEffect, useState } from "react";

type LayerControlsProps = {
    canvas: Canvas | null;
};

const LayerControls = ({ canvas }: LayerControlsProps) => {
    const [hasSelection, setHasSelection] = useState(false);

    useEffect(() => {
        if (!canvas) return;

        const updateSelection = () => {
            setHasSelection(!!canvas.getActiveObject());
        };

        updateSelection();

        canvas.on("selection:created", updateSelection);
        canvas.on("selection:updated", updateSelection);
        canvas.on("selection:cleared", updateSelection);

        return () => {
            canvas.off("selection:created", updateSelection);
            canvas.off("selection:updated", updateSelection);
            canvas.off("selection:cleared", updateSelection);
        };
    }, [canvas]);

    const bringForward = () => {
        if (!canvas) return;
        const obj = canvas.getActiveObject();
        if (!obj) return;
        canvas.bringObjectForward(obj);
        canvas.requestRenderAll();
        canvas.fire("object:modified", { target: obj } as any);
    };

    const sendBackward = () => {
        if (!canvas) return;
        const obj = canvas.getActiveObject();
        if (!obj) return;
        canvas.sendObjectBackwards(obj);
        canvas.requestRenderAll();
        canvas.fire("object:modified", { target: obj } as any);
    };

    return (
        <div className="d-flex w-max flex-wrap">
            <button onClick={bringForward} disabled={!hasSelection}>Bring Forward</button>
            <button onClick={sendBackward} disabled={!hasSelection}>Send Backward</button>
        </div>
    );
};

export default LayerControls;
