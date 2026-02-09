import { FabricImage, type Canvas } from 'fabric';
import { useEffect, useState } from 'react'

type RotateProps = {
    canvas: Canvas | null;
    isCropping: boolean;
}

const Rotate = ({ canvas, isCropping }: RotateProps) => {
    const [selectedImage, setSelectedImage] = useState<FabricImage | null>(null);
    const [btnEnabled, setBtnEnabled] = useState<boolean>(false);

    useEffect(() => {
        if (!isCropping && selectedImage) setBtnEnabled(true);
        else setBtnEnabled(false);
    }, [isCropping, selectedImage])

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

    const rotateImage = () => {
        if (!selectedImage || !canvas) return;

        const currentAngle = selectedImage.angle || 0;

        selectedImage.set({
            angle: currentAngle - 90,
            centeredRotation: true,
        });


        selectedImage.setCoords();
        canvas.renderAll();
        canvas.fire('object:modified', { target: selectedImage } as any);
    }
    const resetRotation = () => {
        if (!selectedImage || !canvas) return;


        selectedImage.set({
            angle: 0,
            centeredRotation: true,
        });


        selectedImage.setCoords();
        canvas.renderAll();
        canvas.fire('object:modified', { target: selectedImage } as any);
    }

    return (
        <div className='d-flex w-max'>
            {btnEnabled &&
                <>
                    <button onClick={rotateImage}>Rotate 90 deg</button>
                    <button onClick={resetRotation}>Reset Rotation</button>
                </>
            }
        </div>
    )
}

export default Rotate
