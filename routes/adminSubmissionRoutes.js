import express from "express";
import {
  getSubmissions,
  getSubmissionById,
  approveSubmission,
  rejectSubmission,
} from "../controllers/adminSubmissionController.js";
import { verifyAdminToken, restrictTo } from "../middleware/authMiddleware.js";

