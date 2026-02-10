import { memo } from "react";

type ToolTipButtonProps = {
    icon: React.ComponentType;
    className?: string;
    title: string;
    onClick: () => void;
    disabled?: boolean;
}

const ToolTipButton = ({ icon: Icon, className, title, onClick, disabled }: ToolTipButtonProps) => {
    return (
        <button
            type="button"
            className={`tooltip-btn ${className || ""}`}
            aria-label={title}
            disabled={disabled}
            onClick={onClick}
            data-tooltip={title}
        >
            <Icon />
        </button>
    );
};

export default memo(ToolTipButton);

