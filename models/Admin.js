import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    fullName: {
      type: String,
      required: [true, "Display name is required"],
    },
    role: {
      type: String,
      enum: ["ADMIN", "CLUB"],
      default: "ADMIN",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // clubId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Club",
    //   default: null, // null = Clubin superadmin, has access to everything
    // },
  },
  { timestamps: true },
);

AdminSchema.pre("save", async function () {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
});

export default mongoose.model("Admin", AdminSchema);
