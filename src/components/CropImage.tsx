import { FabricImage, Rect, Point, util, type Canvas } from 'fabric';
import { useEffect, useState, useRef } from 'react';
import { IoCropSharp } from 'react-icons/io5';
import ToolTipButton from './ToolTipButton';

type CropImageProps = {
    canvas: Canvas | null;
    isCropping: boolean;
    setIsCropping: React.Dispatch<React.SetStateAction<boolean>>
}

const CropImage = ({ canvas, isCropping, setIsCropping }: CropImageProps) => {
    const [selectedImage, setSelectedImage] = useState<FabricImage | null>(null);
    const [cropBox, setCropBox] = useState<Rect | null>(null);

    // Use a Ref to track cropping status synchronously 
    // This prevents the selection listeners from clearing the state
    const isCroppingRef = useRef(false);

    useEffect(() => {
        if (!canvas) return;

        const handleSelection = (e: any) => {
            // IF we are currently cropping, IGNORE selection changes
            if (isCroppingRef.current) return;

            const selectedObject = e.selected?.[0];
            if (selectedObject instanceof FabricImage) {
                setSelectedImage(selectedObject);
            } else {
                setSelectedImage(null);
            }
        };

        const handleCleared = () => {
            if (!isCroppingRef.current) {
                setSelectedImage(null);
            }
        };

        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', handleCleared);

        return () => {
            canvas.off('selection:created', handleSelection);
            canvas.off('selection:updated', handleSelection);
            canvas.off('selection:cleared', handleCleared);
        };
    }, [canvas]);

    const handleClipPath = () => {
        if (!selectedImage || !canvas) return;

        // 1. Lock the state IMMEDIATELY
        isCroppingRef.current = true;
        setIsCropping(true);

        const img = selectedImage;

        // Disabling image selection so it doesn't move during crop
        img.set({ selectable: false, evented: false });

        const box = new Rect({
            left: img.left,
            top: img.top,
            width: img.getScaledWidth() / 2,
            height: img.getScaledHeight() / 2,
            fill: "rgba(255, 0, 0, 0.1)", // Slight fill makes it easier to see
            stroke: "red",
            strokeWidth: 2,
            strokeUniform: true,
            originX: 'left',
            originY: 'top',
            centeredScaling: false,
            excludeFromExport: true,
        });

        box.on('moving', () => {
            const imgRect = img.getBoundingRect();
            if (box.left < imgRect.left) box.left = imgRect.left;
            if (box.top < imgRect.top) box.top = imgRect.top;
            const maxLeft = imgRect.left + imgRect.width - box.getScaledWidth();
            const maxTop = imgRect.top + imgRect.height - box.getScaledHeight();
            if (box.left > maxLeft) box.left = maxLeft;
            if (box.top > maxTop) box.top = maxTop;
        });

        box.on('scaling', () => {
            box.setCoords();
            const imgRect = img.getBoundingRect();
            const boxRect = box.getBoundingRect();

            if (boxRect.left < imgRect.left) {
                const diff = boxRect.left - imgRect.left;
                box.left = imgRect.left;
                box.scaleX = (boxRect.width + diff) / box.width;
            }
            if (boxRect.left + boxRect.width > imgRect.left + imgRect.width) {
                box.scaleX = (imgRect.left + imgRect.width - box.left) / box.width;
            }
            if (boxRect.top < imgRect.top) {
                const diff = boxRect.top - imgRect.top;
                box.top = imgRect.top;
                box.scaleY = (boxRect.height + diff) / box.height;
            }
            if (boxRect.top + boxRect.height > imgRect.top + imgRect.height) {
                box.scaleY = (imgRect.top + imgRect.height - box.top) / box.height;
            }
            canvas.renderAll();
        });

        canvas.add(box);
        canvas.setActiveObject(box);
        setCropBox(box);
    };

    const applyCrop = () => {
        if (!canvas || !selectedImage || !cropBox) return;

        const img = selectedImage;
        const center = img.getCenterPoint();

        cropBox.setCoords();
        const matrix = img.calcTransformMatrix();
        const invMatrix = util.invertTransform(matrix);
        const coords = cropBox.getCoords();
        const transformed = coords.map((pt) => util.transformPoint(new Point(pt.x, pt.y), invMatrix));

        // Fabric local coords are centered; convert to top-left image space
        const imgWidth = img.width || 0;
        const imgHeight = img.height || 0;

        const xs = transformed.map((p) => p.x + imgWidth / 2);
        const ys = transformed.map((p) => p.y + imgHeight / 2);

        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);

        const newWidth = Math.max(0, maxX - minX);
        const newHeight = Math.max(0, maxY - minY);

        const cropX = Math.max(0, Math.min(imgWidth, (img.cropX || 0) + minX));
        const cropY = Math.max(0, Math.min(imgHeight, (img.cropY || 0) + minY));
        const cropW = Math.max(0, Math.min(imgWidth - cropX, newWidth));
        const cropH = Math.max(0, Math.min(imgHeight - cropY, newHeight));

        img.set({
            cropX,
            cropY,
            width: cropW,
            height: cropH,
            selectable: true,
            evented: true,
            dirty: true // Tells Fabric v6 to redraw the internal buffer
        });

        // Preserve on-canvas position after changing dimensions
        img.setPositionByOrigin(center, 'center', 'center');

        // 6. Finalize updates
        img.setCoords(); // Updates interaction boundaries
        canvas.remove(cropBox);

        isCroppingRef.current = false;
        setIsCropping(false);
        setCropBox(null);

        canvas.setActiveObject(img);
        canvas.renderAll();
    };

    const handleCancelCrop = () => {
        setIsCropping(false);
        if (cropBox) {
            canvas?.remove(cropBox);
            selectedImage?.set({ selectable: true, evented: true });
        }
    }


    useEffect(() => {
        if (!canvas) return;

        const handleHistoryRestored = () => {
            isCroppingRef.current = false;
            setIsCropping(false);
            setCropBox(null);

            const active = canvas.getActiveObject();
            if (active instanceof FabricImage) {
                setSelectedImage(active);
            } else {
                setSelectedImage(null);
            }
        };

        canvas.on('history:restored' as any, handleHistoryRestored);

        return () => {
            canvas.off('history:restored' as any, handleHistoryRestored);
        };
    }, [canvas]);


    return (
        <div className='d-flex m-0 flex-wrap'>
            {selectedImage && !isCropping && (
                <ToolTipButton title="Crop" onClick={handleClipPath}><IoCropSharp /></ToolTipButton>
            )}
            {isCropping && (
                <>
                    <button onClick={applyCrop} className='text-danger fw-bold'>
                        Confirm Crop
                    </button>
                    <button onClick={handleCancelCrop}>
                        Cancel Crop
                    </button>
                </>
            )}
        </div>
    );
};

export default CropImage;
