import { FabricImage, Rect, Point, util } from 'fabric';
import { useEffect, useState, useRef } from 'react';
import { IoCropSharp, IoCheckmarkSharp, IoCloseSharp } from 'react-icons/io5';
import ToolTipButton from './ToolTipButton';
import { useCanvas } from '../contexts/CanvasContext';

const CropTool = () => {

    const { canvas, isCropping, setIsCropping } = useCanvas();
    const [selectedImage, setSelectedImage] = useState<FabricImage | null>(null);
    const [cropBox, setCropBox] = useState<Rect | null>(null);

    const isCroppingRef = useRef(false);

    useEffect(() => {
        if (!canvas) return;

        const handleSelection = (e: any) => {
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

        isCroppingRef.current = true;
        setIsCropping(true);

        const img = selectedImage;
        img.set({ selectable: false, evented: false });

        const box = new Rect({
            left: img.left,
            top: img.top,
            width: img.getScaledWidth() / 2,
            height: img.getScaledHeight() / 2,
            fill: "rgba(139, 92, 246, 0.2)",
            stroke: "#8b5cf6",
            strokeWidth: 2,
            strokeUniform: true,
            originX: 'left',
            originY: 'top',
            centeredScaling: false,
            excludeFromExport: true,
            cornerColor: '#fff',
            cornerStrokeColor: '#8b5cf6',
            cornerSize: 10,
            transparentCorners: false
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
            dirty: true
        });

        img.setPositionByOrigin(center, 'center', 'center');
        img.setCoords();
        canvas.remove(cropBox);

        isCroppingRef.current = false;
        setIsCropping(false);
        setCropBox(null);

        canvas.setActiveObject(img);
        canvas.renderAll();
    };

    const handleCancelCrop = () => {
        setIsCropping(false);
        isCroppingRef.current = false;
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
        <>
            {selectedImage && !isCropping && (
                <ToolTipButton icon={IoCropSharp} title="Crop Image" onClick={handleClipPath} />
            )}
            {isCropping && (
                <div className="crop-controls-bubble">
                    <button onClick={applyCrop} className="confirm-btn bubble-btn" title="Apply Crop">
                        <IoCheckmarkSharp size={20} />
                    </button>
                    <button onClick={handleCancelCrop} className="cancel-btn bubble-btn" title="Cancel">
                        <IoCloseSharp size={20} />
                    </button>
                </div>
            )}
        </>
    );
};

export default CropTool;
