import { Router } from "express";
import { healthHandler } from "../../controllers/health.controller.ts";

const healthRouter = Router()


healthRouter.route("/").get(healthHandler)


export default healthRouter