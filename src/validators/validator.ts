import {z} from "zod";

export const userValidatorSchema =  z.object({
     email :z.string().trim().toLowerCase().email("invalid email address"),
     password:z.string().trim().min(5, "password must be at least 5 characters").max(20, "pass can not be bigger than 20 characters")
})

