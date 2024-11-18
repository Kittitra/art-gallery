import React from 'react';
import { CldUploadWidget } from "next-cloudinary";
import { ArrowUpIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FaUser } from 'react-icons/fa';

type Props = {
    imageUrls: string[];
    setImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
    handleImageChange: (newImageUrl: string) => void;
    userImage: string | null | undefined;
};

const EditImage: React.FC<Props> = ({ userImage, imageUrls, setImageUrls, handleImageChange }) => {
    const onupload = (result: any) => {
        const uploadedImageUrl = result.info.secure_url; // ดึง URL ของรูปที่อัปโหลด
        console.log("Uploaded image URL:", uploadedImageUrl);
        
        // อัปเดตภาพใน Avatar
        setImageUrls([uploadedImageUrl]); // แทนที่ภาพเก่าด้วยภาพใหม่
        handleImageChange(uploadedImageUrl); // อัปเดตภาพใน Avatar
    };

    return (
        <div>
            <div className='mb-10'>
                <CldUploadWidget uploadPreset='wsahvwt1' onSuccess={onupload}>
                    {({ open }: any) => {
                        function handleOnclick(e: React.MouseEvent<HTMLButtonElement>) {
                            e.preventDefault();
                            console.log("Open widget clicked"); // ตรวจสอบว่า open ถูกเรียกใช้งาน
                            open();
                        }
                        return (
                            <div className='flex flex-col items-center p-3 border border-white rounded-md gap-5'>
                                <Avatar className='w-[7rem] h-[7rem]'>
                                    <AvatarImage src={imageUrls[0] || ''} 
                                    className='object-cover'/> {/* แสดงเฉพาะภาพแรก */}
                                    <AvatarFallback className='bg-white'>
                                        <FaUser className='text-black text-[3rem]' />
                                    </AvatarFallback>
                                </Avatar>

                                <button className='border-[1px] rounded-lg p-1 px-2 my-3 font-semibold' onClick={handleOnclick}>
                                    <div className='flex flex-row gap-2'>
                                        <ArrowUpIcon />
                                        Upload New Avatar
                                    </div>
                                </button>
                            </div>
                        );
                    }}
                </CldUploadWidget>
            </div>
        </div>
    );
};

export default EditImage;
