import { memo } from "react";
import type { IconType } from "react-icons";

type ToolTipButtonProps = {
    icon: IconType;
    className?: string;
    title: string;
    onClick: () => void;
    disabled?: boolean;
}

const ToolTipButton = ({ icon: Icon, className, title, onClick, disabled }: ToolTipButtonProps) => {
    return (
        <button
            type="button"
            className={`sidebar-button tooltip-btn ${className || ""}`}
            aria-label={title}
            disabled={disabled}
            onClick={onClick}
            data-tooltip={title}
        >
            <Icon size={20} />
        </button>
    );
};

export default memo(ToolTipButton);

