import { Router } from "express";
import * as controller from "./controller.js";
import { auth, checkPermission } from "../../middleware/auth.js";

export const historyRouter = Router();
historyRouter.use(auth);
historyRouter.get("/", checkPermission("history.view"), controller.list);
