import { FabricImage, type Canvas } from 'fabric';
import { useRef } from 'react'

type ImageUploaderProps = {
    canvas: Canvas | null;
}

const ImageUploader = ({ canvas }: ImageUploaderProps) => {

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

        image.scaleToHeight(100)

        canvas.add(image);
        canvas.centerObject(image);
        canvas.setActiveObject(image);
        canvas.renderAll();
        if (uploaderRef.current) {
            uploaderRef.current.value = '';
        }

        canvas?.renderAll();
    }

    return (
        <>
            <button className='btn' onClick={uploadImage}>Add Image</button>
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
