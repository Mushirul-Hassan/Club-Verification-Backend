import mongoose from "mongoose";

const userSubmissionSchema = new mongoose.Schema(
  {
    submissionId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    dob: { type: String, required: true },
    age: { type: Number, required: true },

    // Cloudinary URLs
    aadhaarUrl: { type: String, required: true },
    selfieUrl: { type: String, required: true },

    // Queue Status
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    // Generated ONLY if approved
    tokenId: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("UserSubmission", userSubmissionSchema);
