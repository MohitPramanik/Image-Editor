import { memo, useRef } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

type ToolTipButtonProps = {
    children: React.ReactElement;
    className?: string;
    title: string;
    onClick: () => void;
    disabled?: boolean;
}

const ToolTipButton = ({ children, className, title, onClick, disabled }: ToolTipButtonProps) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const tooltipRef = useRef<any>(null);

    const handleClick = () => {
        tooltipRef.current?.hide();
        onClick();
    };

    return (
        <>
            <OverlayTrigger
                placement="bottom"
                delay={{ show: 0, hide: 10 }}
                overlay={<Tooltip>{title}</Tooltip>}
            >

                <button
                    type="button"
                    className={className || ""}
                    aria-label={title}
                    disabled={disabled || false}
                    onClick={handleClick}
                    ref={buttonRef}
                >
                    {children}
                </button>
            </OverlayTrigger>

        </>
    )
}

export default memo(ToolTipButton);
