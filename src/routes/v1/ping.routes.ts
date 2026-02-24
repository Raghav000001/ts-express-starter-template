import Router from "express";
import { pingHandler } from "../../controllers/ping.controller.ts";
import { validate } from "../../middlewares/zod.middleware.ts";
import { userValidatorSchema } from "../../validators/validator.ts";

const pingRouter = Router()

pingRouter.route("/").get(pingHandler)


export default pingRouter