import * as z from "zod"

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Email is required"
    }),
    password: z.string().min(1, {
        message: "Password is required"
    }),
});

export const RegisterSchema = z.object({
    email: z.string().email({
        message: "Email is required"
    }),
    password: z.string().min(6, {
        message: "6 charecter required"
    }),
    name: z.string().min(1, {
        message: "name is required"
    })
});

export const UploadArt = z.object({
    title: z.string().min(1, {
        message: "require a title"
    }),
    description: z.string().optional(),
    image: z.string().url({ message: "image must be a valid URL" }),
    software: z.array(z.string()),
    tags: z.array(z.string()),
})

export const EditForm = z.object({
    name: z.string().min(1, {
        message: "require a name"
    }),
    headline: z.string().min(1, {
        message: "require a headline"
    }),
    image: z.string().url({ message: "image must be a valid URL" }),
})

export const SocialForm = z.object({
     type: z.string().min(1, "Social type is required."),
     link: z.string().min(1, { message: "Link must be a valid URL" }),
})