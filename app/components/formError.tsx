import React from 'react'
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

interface formError {
    message?: string
}

const FormError = ({
    message,

}:formError) => {
    if(!message) return null;
  return (
    <div className=' bg-destructive/15 text-destructive p-3 flex rounded-md items-center gap-x-2 text-sm'>
        <ExclamationTriangleIcon className='h-4 w-4' />
        {message}
    </div>
  )
}

export default FormError