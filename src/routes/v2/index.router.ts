import { Router } from "express";
import healthRouter from "./health.routes.ts";

const v2Router = Router()

v2Router.use("/health",healthRouter)

export default v2Router