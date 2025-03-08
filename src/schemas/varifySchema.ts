import {z} from 'zod';

export const varifyCodeValidation = z.object({
    code : z.string().length(6 , {message:"Varify code must be at least 6 characters long"})
})
