import { type Canvas } from "fabric";
import { useEffect, useState } from "react";
import { BsLayersFill, BsLayersHalf } from "react-icons/bs";
import ToolTipButton from "./ToolTipButton";

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
            <ToolTipButton
                title="Bring Forward"
                onClick={bringForward}
                disabled={!hasSelection}
            >
                <BsLayersHalf />
            </ToolTipButton>

            <ToolTipButton title="Send Backward" onClick={sendBackward} disabled={!hasSelection}>
                <BsLayersFill />
            </ToolTipButton>
        </div>
    );
};

export default LayerControls;
