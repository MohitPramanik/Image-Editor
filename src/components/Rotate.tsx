import { FabricImage, type Canvas } from 'fabric';
import React, { useEffect, useState } from 'react'

type RotateProps = {
    canvas: Canvas | null;
}

const Rotate = ({ canvas }: RotateProps) => {
    const [selectedImage, setSelectedImage] = useState<FabricImage | null>(null);

    useEffect(() => {
        if (!canvas) return;

        const handleSelection = (e: any) => {
            // In v6, selected is an array of objects
            const selectedObject = e.selected?.[0];

            console.log('Selected Object:', selectedObject);

            if (selectedObject instanceof FabricImage) {
                setSelectedImage(selectedObject);
            } else {
                setSelectedImage(null);
            }
        };

        const handleCleared = () => {
            setSelectedImage(null);
        };

        // Attach listeners
        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', handleCleared);

        // Cleanup: remove listeners when component unmounts or canvas changes
        return () => {
            canvas.off('selection:created', handleSelection);
            canvas.off('selection:updated', handleSelection);
            canvas.off('selection:cleared', handleCleared);
        };
    }, [canvas])

    const rotateImage = () => {
        if (!selectedImage || !canvas) return;

        // Get current angle and add 90 degrees
        const currentAngle = selectedImage.angle || 0;

        selectedImage.set({
            angle: currentAngle - 90,
            centeredRotation: true, // Rotates around center
        });


        selectedImage.setCoords();
        canvas.renderAll();
    }
    const resetRotation = () => {
        if (!selectedImage || !canvas) return;

        // Get current angle and add 90 degrees

        selectedImage.set({
            angle: 0,
            centeredRotation: true, // Rotates around center
        });


        selectedImage.setCoords();
        canvas.renderAll();
    }

    return (
        <div className='d-flex w-max'>
            <button onClick={rotateImage}>Rotate 90 deg</button>
            <button onClick={resetRotation}>Reset Rotation</button>
        </div>
    )
}

export default Rotate
