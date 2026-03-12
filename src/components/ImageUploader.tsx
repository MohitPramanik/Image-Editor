import { FabricImage } from 'fabric';
import { useRef } from 'react'
import { useCanvas } from '../contexts/CanvasContext';
import { HiOutlineUpload } from 'react-icons/hi';
import ToolTipButton from './ToolTipButton';

const ImageUploader = () => {

    const { canvas } = useCanvas();
    const uploaderRef = useRef<HTMLInputElement | null>(null);

    const fileToDataURL = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });

    const uploadImage = () => {
        if (uploaderRef.current) {
            uploaderRef.current.click();
        }
    }

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file || !canvas) return;
        const dataUrl = await fileToDataURL(file);
        const image = await FabricImage.fromURL(dataUrl);

        (image as any).__skipHistory = true;
        image.scaleToHeight(200)

        canvas.add(image);
        canvas.centerObject(image);
        image.setCoords();
        (image as any).__skipHistory = false;
        canvas.setActiveObject(image);
        canvas.renderAll();
        
        canvas.fire('object:modified', { target: image } as any);
        if (uploaderRef.current) {
            uploaderRef.current.value = '';
        }

        canvas?.renderAll();
    }

    return (
        <>
            <ToolTipButton 
                icon={HiOutlineUpload} 
                title="Upload Image" 
                onClick={uploadImage} 
            />
            <input
                type="file"
                accept='image/*'
                className='d-none'
                ref={uploaderRef}
                onChange={handleChange} 
            />
        </>
    )
}

export default ImageUploader
