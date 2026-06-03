import express from "express";
import {
  submitUserDetails,
  checkApprovalStatus,
} from "../controllers/userController.js";
import upload from "../config/multer.js";

const router = express.Router();

router.post(
  "/submit",
  upload.fields([
    { name: "idDocument", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  submitUserDetails,
);

router.get("/status/:deviceId", checkApprovalStatus);

export default router;
