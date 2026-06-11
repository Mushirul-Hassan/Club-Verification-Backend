import UserSubmission from "../models/UserSubmission.js";
import uploadFileToCloudinary from "../config/uploadFile.js";
import { parseFlexibleDate } from "../utils/parseDate.js";

export const submitUserDetails = async (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);

  try {
    const { deviceId, name, dob, idType, idNumber } = req.body;

    if (!req.files || !req.files["idDocument"] || !req.files["selfie"]) {
      return res.status(400).json({
        success: false,
        message: "Both ID Document and Selfie files are required.",
      });
    }

    if (!deviceId || !name || !dob || !idType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields. Please fill out the entire form.",
      });
    }

    const [idDocumentUrl, selfieUrl] = await Promise.all([
      uploadFileToCloudinary(req.files["idDocument"][0], "club_app_ids"),
      uploadFileToCloudinary(req.files["selfie"][0], "club_app_selfies"),
    ]);

    const newUser = new UserSubmission({
      deviceId,
      name,
      dob,
      idType,
      idNumber,
      idDocumentUrl,
      selfieUrl,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "Submission received. Please wait for admin approval.",
      submissionId: newUser.submissionId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during submission",
      error: error.message,
    });
  }
};

export const checkApprovalStatus = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const user = await UserSubmission.findOne({ deviceId: deviceId }).sort({
      createdAt: -1,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No submission found for this device",
      });
    }

    //  Approved
    if (user.status === "APPROVED") {
      return res.status(200).json({
        success: true,
        isVerified: true,
        status: user.status,

        userName: user.name,
        deviceId: user.deviceId,
        submissionId: user.submissionId,
        selfieUrl: user.selfieUrl,
        // idDocumentUrl: user.idDocumentUrl,

        tokenId: user.tokenId, // For the QR Code
        ticketNumber: user.ticketNumber,
        age: user.age,
      });
    }

    // BANNED
    if (user.status === "BANNED") {
      return res.status(403).json({
        success: false,
        isVerified: false,
        status: user.status,
        message: "You have been permanently banned from this venue.",
        userName: user.name,
        deviceId: user.deviceId,
        selfieUrl: user.selfieUrl,
        idDocumentUrl: user.idDocumentUrl,
        submissionId: user.submissionId,
      });
    }

    //  PENDING / REJECTED
    return res.status(200).json({
      success: true,
      isVerified: false,
      status: user.status,
      selfieUrl: user.selfieUrl,
      idDocumentUrl: user.idDocumentUrl,

      userName: user.name,
      deviceId: user.deviceId,
      submissionId: user.submissionId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while checking status",
      error: error.message,
    });
  }
};
