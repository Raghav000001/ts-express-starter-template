import type { Request , Response } from "express";

 const healthHandler = async (req:Request,res:Response) => {
      try {
        res.status(400).json({message:"app is running all good and fine"})
      } catch (error) {
        console.log("error in health check controller");
        
      }
  }

  export {healthHandler}