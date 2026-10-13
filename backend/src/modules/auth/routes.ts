import { Router } from "express";
import * as controller from "./controller.js";
import { auth, checkPermission } from "../../middleware/auth.js";

export const authRouter = Router();
authRouter.post("/login", controller.login);
authRouter.get("/me", auth, controller.me);
authRouter.get(
  "/users",
  auth,
  checkPermission("users.manage"),
  controller.listUsers,
);
authRouter.post(
  "/users",
  auth,
  checkPermission("users.manage"),
  controller.createUser,
);
authRouter.patch(
  "/users/:id",
  auth,
  checkPermission("users.manage"),
  controller.patchUser,
);
authRouter.delete(
  "/users/:id",
  auth,
  checkPermission("users.manage"),
  controller.removeUser,
);
authRouter.get("/my-permissions", auth, controller.myPermissions);
authRouter.get(
  "/permissions",
  auth,
  checkPermission("rights.manage"),
  controller.listPermissions,
);
authRouter.patch(
  "/permissions",
  auth,
  checkPermission("rights.manage"),
  controller.updatePermission,
);
