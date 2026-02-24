import type { Request , Response } from "express";
import logger from "../config/logger.config.ts";

 const healthHandler = async (req:Request,res:Response) => {
      try {
         logger.info('req went in the handler')
        res.status(200).json({message:"app is running all good and fine"})                                                                                      
      } catch (error) {
        console.log("error in health check controller");

      }
  }

  export {healthHandler}