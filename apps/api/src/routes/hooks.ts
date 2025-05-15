import { RequestHandler, Router } from "express";
import { allRoutes } from "../controller/hooks";

const hooksRouter = Router();

hooksRouter.all("/:slug", allRoutes) as RequestHandler;

export default hooksRouter;
