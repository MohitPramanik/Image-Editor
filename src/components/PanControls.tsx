import React from "react";
import { FaHandPaper } from "react-icons/fa";
import ToolTipButton from "./ToolTipButton";

type PanControlsProps = {
    isPanning: boolean;
    setIsPanning: React.Dispatch<React.SetStateAction<boolean>>;
};

const PanControls = ({ isPanning, setIsPanning }: PanControlsProps) => {
    return (
        <div className="d-flex w-max">
            <ToolTipButton
                title="Pan"
                className={isPanning ? "active" : undefined}
                onClick={() => setIsPanning((prev) => !prev)}
            >
                <FaHandPaper />
            </ToolTipButton>
        </div>
    );
};

export default PanControls;
