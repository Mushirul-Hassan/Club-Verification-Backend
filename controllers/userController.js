import UserSubmission from "../models/UserSubmission.js";

// API 1: Verify User (The Drop-off)
// Route: POST /api/user/submit

export const verifyUser = async (req, res) => {
  try {
    // We now pull the flattened ID fields directly from the body
    const { deviceId, name, dob, idType, idNumber, idDocumentUrl, selfieUrl } =
      req.body;

    // Validations
    if (
      !deviceId ||
      !name ||
      !dob ||
      !idType ||
      !idNumber ||
      !idDocumentUrl ||
      !selfieUrl
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields. Please fill out the entire form.",
      });
    }

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

export const isApproved = async (req, res) => {
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
        tokenId: user.tokenId, // For the QR Code
        ticketNumber: user.ticketNumber, // Human readable (e.g., TKT-PAN-8F9B2A)
        age: user.age, // Automatically calculated by the Virtual!
      });
    }

    //  If they are still PENDING or were REJECTED
    return res.status(200).json({
      success: true,
      isVerified: false,
      status: user.status,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while checking status",
      error: error.message,
    });
  }
};
