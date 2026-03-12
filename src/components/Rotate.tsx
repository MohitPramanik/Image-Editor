import { FabricImage } from 'fabric';
import { useCallback, useEffect, useState } from 'react'
import ToolTipButton from './ToolTipButton';
import { MdRotate90DegreesCcw } from 'react-icons/md';
import { GrPowerReset } from 'react-icons/gr';
import { useCanvas } from '../contexts/CanvasContext';

const Rotate = () => {

    const { canvas, isCropping } = useCanvas();
    const [selectedImage, setSelectedImage] = useState<FabricImage | null>(null);

    useEffect(() => {
        if (!canvas) return;

        const handleSelection = (e: any) => {
            const selectedObject = e.selected?.[0];
            if (selectedObject instanceof FabricImage) {
                setSelectedImage(selectedObject);
            } else {
                setSelectedImage(null);
            }
        };

        const handleCleared = () => {
            setSelectedImage(null);
        };

        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', handleCleared);

        return () => {
            canvas.off('selection:created', handleSelection);
            canvas.off('selection:updated', handleSelection);
            canvas.off('selection:cleared', handleCleared);
        };
    }, [canvas])

    const rotateImage = useCallback(() => {
        if (!selectedImage || !canvas) return;
        const currentAngle = selectedImage.angle || 0;
        selectedImage.set({
            angle: currentAngle - 90,
            centeredRotation: true,
        });
        selectedImage.setCoords();
        canvas.renderAll();
        canvas.fire('object:modified', { target: selectedImage } as any);
    }, [selectedImage, canvas]);

    const resetRotation = useCallback(() => {
        if (!selectedImage || !canvas) return;
        selectedImage.set({
            angle: 0,
            centeredRotation: true,
        });
        selectedImage.setCoords();
        canvas.renderAll();
        canvas.fire('object:modified', { target: selectedImage } as any);
    }, [selectedImage, canvas]);

    return (
        <>
            {selectedImage && !isCropping && (
                <>
                    <ToolTipButton icon={MdRotate90DegreesCcw} title='Rotate 90°' onClick={rotateImage} />
                    <ToolTipButton icon={GrPowerReset} title="Reset Orientation" onClick={resetRotation} />
                </>
            )}
        </>
    )
}

export default Rotate
