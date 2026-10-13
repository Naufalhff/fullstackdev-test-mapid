import { Router } from "express";
import * as controller from "./controller.js";
import { auth, checkPermission } from "../../middleware/auth.js";

export const reportsRouter = Router();
reportsRouter.use(auth);
reportsRouter.get("/", checkPermission("reports.view"), controller.list);
reportsRouter.get("/stats", checkPermission("reports.view"), controller.stats);
reportsRouter.post("/", checkPermission("reports.create"), controller.create);
reportsRouter.patch(
  "/:id",
  checkPermission("reports.edit"),
  controller.updateReport,
);
reportsRouter.patch(
  "/:id/status",
  checkPermission("reports.approve"),
  controller.patchStatus,
);
