import React from "react";

type PanControlsProps = {
    isPanning: boolean;
    setIsPanning: React.Dispatch<React.SetStateAction<boolean>>;
};

const PanControls = ({ isPanning, setIsPanning }: PanControlsProps) => {
    return (
        <div className="d-flex w-max">
            <button
                className={isPanning ? "active" : undefined}
                onClick={() => setIsPanning((prev) => !prev)}
            >
                Pan
            </button>
        </div>
    );
};

export default PanControls;
