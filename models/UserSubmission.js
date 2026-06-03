import mongoose from "mongoose";
import crypto from "crypto";

const userSubmissionSchema = new mongoose.Schema(
  {
    submissionId: {
      type: String,
      default: () => crypto.randomUUID(),
      unique: true,
    },

    deviceId: {
      type: String,
      required: true,
    },

    ticketNumber: { type: String },

    name: { type: String, required: true },
    dob: { type: Date, required: true },

    idType: {
      type: String,
      enum: ["AADHAAR", "PAN", "DRIVING_LICENSE", "PASSPORT", "VOTER_ID"],
      required: true,
    },
    idNumber: {
      type: String,
    },
    idDocumentUrl: {
      type: String,
      required: true,
    },

    selfieUrl: { type: String, required: true },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    tokenId: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSubmissionSchema.virtual("age").get(function () {
  const today = new Date();
  const birthDate = new Date(this.dob);

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
});

// Pre-Save Hook (Formatting & Ticket Gen)
userSubmissionSchema.pre("save", function () {
  // Always uppercase the name for a clean database
  if (this.isModified("name")) {
    this.name = this.name.toUpperCase();
  }

  // Generate Ticket Number ONLY if approved and doesn't have one yet
  if (this.status === "APPROVED" && !this.ticketNumber) {
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();

    // Pulls directly from the flat idType field now
    this.ticketNumber = `TKT-${this.idType.substring(0, 3)}-${randomHex}`;
  }

});

export default mongoose.model("UserSubmission", userSubmissionSchema);
