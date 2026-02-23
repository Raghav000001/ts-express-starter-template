    import express from "express";
    import type { ZodObject } from "zod";

    export const validate = (schema:ZodObject)=> {
        return async (req:express.Request,res:express.Response,next:express.NextFunction) => {
            try {
              const parsed = await schema.parseAsync(req.body)
              req.body = parsed
              next()
            } catch (error:any) {
               return res.status(400).json({
                    message:"error in zod middleware",
                    success:false,
                    errors: error.errors
                })
            }
        }
    }