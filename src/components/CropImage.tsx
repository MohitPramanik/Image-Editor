import { FabricImage, Rect, Point, util, type Canvas } from 'fabric';
import { useEffect, useState, useRef } from 'react';

type CropImageProps = {
    canvas: Canvas | null;
}

const CropImage = ({ canvas }: CropImageProps) => {
    const [selectedImage, setSelectedImage] = useState<FabricImage | null>(null);
    const [cropBox, setCropBox] = useState<Rect | null>(null);
    const [isCropping, setIsCropping] = useState<boolean>(false);

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

        // Optional: Disable image selection so it doesn't move during crop
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

        const rectLeft = cropBox.left ?? 0;
        const rectTop = cropBox.top ?? 0;
        const rectWidth = cropBox.getScaledWidth();
        const rectHeight = cropBox.getScaledHeight();

        const matrix = img.calcTransformMatrix();
        const invMatrix = util.invertTransform(matrix);
        const tl = util.transformPoint(new Point(rectLeft, rectTop), invMatrix);
        const br = util.transformPoint(
            new Point(rectLeft + rectWidth, rectTop + rectHeight),
            invMatrix
        );

        // Fabric local coords are centered; convert to top-left image space
        const imgWidth = img.width || 0;
        const imgHeight = img.height || 0;

        const tlX = tl.x + imgWidth / 2;
        const tlY = tl.y + imgHeight / 2;
        const brX = br.x + imgWidth / 2;
        const brY = br.y + imgHeight / 2;

        const minX = Math.min(tlX, brX);
        const minY = Math.min(tlY, brY);
        const newWidth = Math.abs(brX - tlX);
        const newHeight = Math.abs(brY - tlY);

        const newCropX = (img.cropX || 0) + minX;
        const newCropY = (img.cropY || 0) + minY;

        img.set({
            cropX: newCropX,
            cropY: newCropY,
            width: newWidth,
            height: newHeight,
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
        <div className='d-flex m-0'>
            {selectedImage && !isCropping && (
                <button onClick={handleClipPath}>Crop Image</button>
            )}
            {isCropping && (
                <button onClick={applyCrop} style={{ color: 'red', fontWeight: 'bold' }}>
                    Confirm Crop
                </button>
            )}
        </div>
    );
};

export default CropImage;
