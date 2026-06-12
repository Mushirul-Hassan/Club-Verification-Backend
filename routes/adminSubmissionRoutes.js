import express from "express";
import {
  getSubmissions,
  getSubmissionById,
  approveSubmission,
  rejectSubmission,
  banSubmission
} from "../controllers/adminSubmissionController.js";

import { verifyAdminToken, restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verifyAdminToken);

router.get("/", restrictTo("ADMIN", "CLUB"), getSubmissions);

router.get("/:id", restrictTo("ADMIN", "CLUB"), getSubmissionById);

router.post("/:id/approve", restrictTo("ADMIN"), approveSubmission);

router.post("/:id/reject", restrictTo("ADMIN"), rejectSubmission);

router.post("/:id/ban", restrictTo("ADMIN"), banSubmission);

export default router;
