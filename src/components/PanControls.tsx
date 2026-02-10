import { useCanvas } from "../contexts/CanvasContext";
import ToolTipButton from "./ToolTipButton";
import { FaHandPaper } from "react-icons/fa";

const PanControls = () => {

    const { isPanning, setIsPanning } = useCanvas();

    return (
        <div className="d-md-none d-flex w-max">
            <ToolTipButton
                icon={FaHandPaper}
                title="Pan"
                className={isPanning ? "active" : undefined}
                onClick={() => setIsPanning((prev) => !prev)}
            />
        </div>
    );
};

export default PanControls;
