import { Router } from "express";
import { getSettings, updateSettings } from "./settings.controller.js";
import { AdminGuard } from "../middleware/guard.middleware.js";

const SettingsRouter = Router();
SettingsRouter.get("/", AdminGuard, getSettings);
SettingsRouter.put("/", AdminGuard, updateSettings);

export default SettingsRouter;
