import { Router } from "express";
import pingRouter from "./ping.routes.ts";

const v1Router = Router();

v1Router.use("/ping", pingRouter);

export default v1Router;
