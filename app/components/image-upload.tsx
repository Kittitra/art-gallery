import React from 'react'
import {CldUploadWidget, CloudinaryUploadWidgetInfo} from "next-cloudinary"

type Props = {
    imageUrls: string[]
    setImageUrls:React.Dispatch<React.SetStateAction<string[]>>
    handleImageChange: (newImageUrl: string) => void
}

const ImageUpload: React.FC<Props> = ({ imageUrls, setImageUrls}) => {
    const onupload =(result: CloudinaryUploadWidgetInfo)=> {
        if(result.info === undefined) {
            console.error("Upload result does not contain 'info'");
            return;
        }
        
        const uploadedImageUrl = result.info.secure_url; // ดึง URL ของรูปที่อัปโหลด
        console.log("Uploaded image URL:", uploadedImageUrl);
        
        setImageUrls((prevUrls) => [...prevUrls, uploadedImageUrl]); 
    }

    const handleDeleteImage = (index: number) => {
        setImageUrls(prevImageUrls => {
            const updateImageUrls = [...prevImageUrls];
            updateImageUrls.splice(index, 1);
            return updateImageUrls;
        });
    }

    return (
        <div>
            <div className='mb-10'>
                <CldUploadWidget uploadPreset='wsahvwt1' onSuccess={onupload}
                >
                    {({ open }: { open: () => void }) => {
                        function handleOnclick(e: React.MouseEvent<HTMLButtonElement>) {
                            e.preventDefault();
                            console.log("Open widget clicked"); // ตรวจสอบว่า open ถูกเรียกใช้งาน
                            open();
                        }
                        return (
                            <button className='border-[1px] rounded-lg p-1 px-2 my-3 font-semibold' onClick={handleOnclick}>
                                Upload Artwork
                            </button>
                        );
                    }}
                </CldUploadWidget>
            </div>
            <div  >
                {imageUrls.map((imageUrl, index) => (
                    <div key={index} className='flex flex-col justify-center items-center pb-3'>
                        <img src={imageUrl} className=' w-fit h-[300px] object-cover object-top' alt={`uploades Image ${index + 1}`} />
                        <div className='rounded-lg mt-5 p-2 cursor-pointer text-red-500' onClick={() => handleDeleteImage(index)}>Remove</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ImageUpload;
