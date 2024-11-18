import React from 'react'
import { CheckCircledIcon } from "@radix-ui/react-icons"

interface formSuccess {
    message?: string
}

const FormSuccess = ({
    message,

}:formSuccess) => {
    if(!message) return null;
  return (
    <div className=' bg-emerald-200 text-emerald-500 p-3 flex rounded-md items-center gap-x-2 text-sm'>
        <CheckCircledIcon className='h-4 w-4' />
        {message}
    </div>
  )
}

export default FormSuccess