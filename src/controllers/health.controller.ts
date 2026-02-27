import type { Request , Response } from "express";
import {  internalServerError } from "../errors/app.errors.ts";

 const healthHandler = async (req:Request,res:Response) => {
      try {
        res.status(200).json({message:"app is running all good and fine"})                                                                                   
      } catch (error) {
        throw new internalServerError("error in health handler")
      }
  }

  export {healthHandler}