import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import "dotenv/config";

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const admin = await Admin.create({
    username: process.env.SEED_ADMIN_USERNAME,
    password: process.env.SEED_ADMIN_PASSWORD,
    fullName: process.env.SEED_ADMIN_FULLNAME,
    role: "ADMIN",
    isActive: true,
  });

  console.log("Admin created:", admin.username);
  process.exit(0);
};

seedAdmin();
