import { RequestHandler, Router } from "express";
import {
  createEndpoint,
  getEndpoint,
  getRequests,
  deleteRequest,
  deleteEndpoint,
} from "../controller/endpointRequest";

const endpointsRouter = Router();

endpointsRouter.post("/", createEndpoint) as RequestHandler;
endpointsRouter.get("/:slug", getEndpoint) as RequestHandler;
endpointsRouter.get("/:slug/requests", getRequests) as RequestHandler;
endpointsRouter.delete("/requests/:requestId", deleteRequest) as RequestHandler;
endpointsRouter.delete("/:slug", deleteEndpoint) as RequestHandler;

export default endpointsRouter;
