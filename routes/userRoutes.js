import express from "express";
import { verifyUser, isApproved } from "../controllers/userController.js";
import upload from "../config/multer.js";

const router = express.Router();

router.post(
  "/verify",
  upload.fields([
    { name: "idDocument", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  verifyUser,
);

router.get("/is-approved/:deviceId", isApproved);

export default router;
