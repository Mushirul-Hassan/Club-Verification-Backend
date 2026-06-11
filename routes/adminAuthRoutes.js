import express from "express";
import {
  loginAdmin,
  refreshAdminSession,
  getMe,
  logoutAdmin,
} from "../controllers/adminAuthControllers.js";

import { verifyAdminToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);

router.post("/refresh", refreshAdminSession);

router.post("/logout", verifyAdminToken, logoutAdmin);

router.get("/me", verifyAdminToken, getMe);

export default router;
