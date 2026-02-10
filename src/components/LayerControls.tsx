import { useCallback, useEffect, useState } from "react";
import { BsLayersFill, BsLayersHalf } from "react-icons/bs";
import ToolTipButton from "./ToolTipButton";
import { useCanvas } from "../contexts/CanvasContext";

const LayerControls = () => {

    const { canvas } = useCanvas();
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

    const bringForward = useCallback(() => {
        if (!canvas) return;
        const obj = canvas.getActiveObject();
        if (!obj) return;
        canvas.bringObjectForward(obj);
        canvas.requestRenderAll();
        canvas.fire("object:modified", { target: obj } as any);
    }, [canvas]);

    const sendBackward = useCallback(() => {
        if (!canvas) return;
        const obj = canvas.getActiveObject();
        if (!obj) return;
        canvas.sendObjectBackwards(obj);
        canvas.requestRenderAll();
        canvas.fire("object:modified", { target: obj } as any);
    }, [canvas]);

    return (
        <div className="d-flex w-max flex-wrap">
            <ToolTipButton icon={BsLayersHalf} title="Bring Forward" onClick={bringForward} disabled={!hasSelection} />
            <ToolTipButton icon={BsLayersFill} title="Send Backward" onClick={sendBackward} disabled={!hasSelection} />
        </div>
    );
};

export default LayerControls;
