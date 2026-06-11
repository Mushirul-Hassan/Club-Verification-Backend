import crypto from "crypto";
import jwt from "jsonwebtoken";
import UserSubmission from "../models/UserSubmission.js";

export const getSubmissions = async (req, res) => {
  try {
    const { status = "PENDING", page = 1, limit = 20 } = req.query;

    const filter = {};

    // Multi-tenancy: CLUB admin only sees their own club's submissions
    // if (req.admin.role === "CLUB" && req.admin.clubId) {
    //   filter.clubId = req.admin.clubId;
    // }

    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "BANNED"];
    if (validStatuses.includes(status.toUpperCase())) {
      filter.status = status.toUpperCase();
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [submissions, total] = await Promise.all([
      UserSubmission.find(filter)
        .select("-idDocumentUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      UserSubmission.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      submissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching submissions",
      error: error.message,
    });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await UserSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // CLUB admin cannot view other clubs' submissions
    // if (
    //   req.admin.role === "CLUB" &&
    //   req.admin.clubId &&
    //   submission.clubId?.toString() !== req.admin.clubId.toString()
    // ) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Access forbidden",
    //   });
    // }

    return res.status(200).json({
      success: true,
      submission: {
        ...submission.toObject(),
        age: submission.age,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching submission",
      error: error.message,
    });
  }
};

export const approveSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await UserSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    if (submission.status === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Submission already approved",
      });
    }

    const qrKey = `CLB-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

    submission.status = "APPROVED";
    submission.tokenId = qrKey;
    submission.approvedAt = new Date();
    submission.approvedBy = req.admin.id;
    submission.rejectionReason = null;

    await submission.save();

    return res.status(200).json({
      success: true,
      message: "User approved successfully",
      submission: {
        id: submission._id,
        name: submission.name,
        status: submission.status,
        tokenId: submission.tokenId,
        ticketNumber: submission.ticketNumber,
        approvedAt: submission.approvedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error approving submission",
      error: error.message,
    });
  }
};

export const rejectSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const submission = await UserSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    if (submission.status === "REJECTED") {
      return res.status(400).json({
        success: false,
        message: "Submission already rejected",
      });
    }

    submission.status = "REJECTED";
    submission.rejectedAt = new Date();
    submission.rejectedBy = req.admin.id;
    submission.rejectionReason = reason.trim();
    submission.tokenId = null;

    await submission.save();

    return res.status(200).json({
      success: true,
      message: "User rejected successfully",
      submission: {
        id: submission._id,
        name: submission.name,
        status: submission.status,
        rejectionReason: submission.rejectionReason,
        rejectedAt: submission.rejectedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error rejecting submission",
      error: error.message,
    });
  }
};
