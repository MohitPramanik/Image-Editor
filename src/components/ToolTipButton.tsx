import { useEffect, useRef } from "react";

type ToolTipButtonProps = {
    children: React.ReactElement;
    className?: string;
    title: string;
    onClick: () => void;
    disabled?: boolean;
}

declare global {
    interface Window {
        bootstrap: any; // Use 'any' if you don't have Bootstrap types installed
    }
}

const ToolTipButton = ({ children, className, title, onClick, disabled }: ToolTipButtonProps) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const tooltipRef = useRef<any>(null);

    useEffect(() => {
        if (!buttonRef.current) return;

        const tooltip = window.bootstrap.Tooltip.getOrCreateInstance(buttonRef.current);
        tooltipRef.current = tooltip;

        return () => {
            tooltip.dispose();
            tooltipRef.current = null;
        };
    }, [title]);

    const handleClick = () => {
        tooltipRef.current?.hide();
        onClick();
    };

    return (
        <button
            type="button"
            className={className || ""}
            data-bs-toggle="tooltip"
            data-bs-placement="bottom"
            title={title}
            disabled={disabled || false}
            onClick={handleClick}
            ref={buttonRef}
        >
            {children}
        </button>
    )
}

export default ToolTipButton
