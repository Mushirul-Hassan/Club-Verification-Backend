import UserSubmission from "../models/UserSubmission.js";
import uploadFileToCloudinary from "../config/uploadFile.js";

// API 1: Verify User (The Drop-off)
// Route: POST /api/user/submit

export const submitUserDetails = async (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);

  try {
    // We now pull the flattened ID fields directly from the body
    const { deviceId, name, dob, idType, idNumber } = req.body;
    

    // Validations

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

    // Create the new entry (submissionId generates automatically)
    const newUser = new UserSubmission({
      deviceId,
      name,
      dob,
      idType,
      idNumber,
      idDocumentUrl,
      selfieUrl,
    });

    //  Save to MongoDB
    await newUser.save();

    //  Respond to the mobile app
    return res.status(201).json({
      success: true,
      message: "Submission received. Please wait for admin approval.",
      submissionId: newUser.submissionId, // Sent back just in case they need it
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during submission",
      error: error.message,
    });
  }
};

// API 2: Check Approval Status (The Look-up)
// Route: GET /api/user/status/:deviceId

export const checkApprovalStatus = async (req, res) => {
  try {
    // The mobile app sends the deviceId in the URL
    const { deviceId } = req.params;

    //  Find the most recent submission from this specific phone
    const user = await UserSubmission.findOne({ deviceId: deviceId }).sort({
      createdAt: -1,
    });

    //  If we can't find them, they need to submit the form first
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No submission found for this device",
      });
    }

    //  If the Admin has clicked "Approve"
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

    //  If they are still PENDING or were REJECTED
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
