import { FabricImage } from 'fabric';
import { useRef } from 'react'
import { useCanvas } from '../contexts/CanvasContext';

const ImageUploader = () => {

    const {canvas} = useCanvas();
    const uploaderRef = useRef<HTMLInputElement | null>(null);

    const fileToDataURL = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });

    const uploadImage = () => {
        if (uploaderRef) {
            let imgInput = uploaderRef.current;
            imgInput?.click();
        }
    }

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        // console.log("Value", file);

        if (!file || !canvas) return;
        const dataUrl = await fileToDataURL(file);
        const image = await FabricImage.fromURL(dataUrl);

        (image as any).__skipHistory = true;
        image.scaleToHeight(100)

        canvas.add(image);
        canvas.centerObject(image);
        image.setCoords();
        (image as any).__skipHistory = false;
        canvas.setActiveObject(image);
        canvas.renderAll();
        // Ensure history captures the centered position, not the initial add position
        canvas.fire('object:modified', { target: image } as any);
        if (uploaderRef.current) {
            uploaderRef.current.value = '';
        }

        canvas?.renderAll();
    }

    return (
        <>
            <button className='btn' aria-label='upload-image-btn' onClick={uploadImage}>Add Image</button>
            <input
                type="file"
                accept='image/*'
                className='d-none'
                ref={uploaderRef}
                onChange={handleChange} />
        </>
    )
}

export default ImageUploader
