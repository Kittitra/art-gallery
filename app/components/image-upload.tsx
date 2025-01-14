import React from 'react'
import {CldUploadWidget, CloudinaryUploadWidgetResults} from "next-cloudinary"

type Props = {
    imageUrls: string[]
    setImageUrls:React.Dispatch<React.SetStateAction<string[]>>
    handleImageChange: (newImageUrl: string) => void
}

const ImageUpload: React.FC<Props> = ({ imageUrls, setImageUrls}) => {
    const onupload =(result: CloudinaryUploadWidgetResults)=> {

        // ตรวจสอบว่า result.info และ secure_url มีอยู่
    if (result.info && typeof result.info !== 'string' && result.info.secure_url) {
        const uploadedImageUrl = result.info.secure_url;
        console.log('Uploaded image URL:', uploadedImageUrl);
  
        // อัปเดตรายการ imageUrls
        setImageUrls((prevUrls) => [...prevUrls, uploadedImageUrl]);
      } else {
        console.error("Upload result does not contain 'secure_url'");
      }
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
