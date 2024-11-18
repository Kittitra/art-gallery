import React, {useState, useEffect} from 'react'
import {CldUploadWidget} from "next-cloudinary"

type Props = {
    imageUrls: string[]
    setImageUrls:React.Dispatch<React.SetStateAction<string[]>>
    handleImageChange: (newImageUrl: string) => void
}

const ImageUpload: React.FC<Props> = ({ imageUrls, setImageUrls, handleImageChange}) => {
    const onupload =(result: any)=> {
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
                    {({ open }: any) => {
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
            <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-10'>
                {imageUrls.map((imageUrl, index) => (
                    <div key={index} className='flex flex-col justify-center items-center'>
                        <img src={imageUrl} className=' w-fit h-[150px] object-cover object-top' alt={`uploades Image ${index + 1}`} />
                        <div className='border-[1px] rounded-lg mt-5 p-2 cursor-pointer' onClick={() => handleDeleteImage(index)}>delete</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ImageUpload;
