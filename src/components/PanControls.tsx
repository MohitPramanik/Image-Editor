import { useCanvas } from "../contexts/CanvasContext";
import ToolTipButton from "./ToolTipButton";
import { FaHandPaper } from "react-icons/fa";

const PanControls = () => {

    const { isPanning, setIsPanning, isCropping } = useCanvas();

    return (
        <ToolTipButton
            icon={FaHandPaper}
            title="Pan Workspace"
            className={isPanning ? "active" : ""}
            onClick={() => setIsPanning((prev) => !prev)}
            disabled={isCropping}
        />
    );
};

export default PanControls;
