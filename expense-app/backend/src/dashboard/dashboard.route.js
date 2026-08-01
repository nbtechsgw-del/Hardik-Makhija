import {Router} from "express";

import { AdminUserGuard } from "../middleware/guard.middleware.js";
import { getReport } from "./dashboard.controller.js";

const DashboardRouter = Router();

DashboardRouter.get("/report", AdminUserGuard, getReport);

export default DashboardRouter;