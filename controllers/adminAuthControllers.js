import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import tokenService from "../services/tokenServices.js";

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username and password",
      });
    }

    const admin = await Admin.findOne({
      username: username.toLowerCase().trim(),
    }).select("+password");
    if (
      !admin ||
      !admin.isActive ||
      !(await bcrypt.compare(password, admin.password))
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    //  new decoupled token engine
    const accessToken = tokenService.generateAccessToken(admin);
    tokenService.setRefreshCookie(res, admin);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      admin: { fullName: admin.fullName, role: admin.role },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Login error", error: error.message });
  }
};

export const refreshAdminSession = async (req, res) => {
  try {
    const cookieToken = req.signedCookies.jwt_refresh;
    if (!cookieToken)
      return res
        .status(401)
        .json({ success: false, message: "Session expired" });

    const decoded = tokenService.verifyRefreshToken(cookieToken);
    const admin = await Admin.findById(decoded.adminId);

    if (!admin || !admin.isActive)
      return res
        .status(401)
        .json({ success: false, message: "Access revoked" });

    const newAccessToken = tokenService.generateAccessToken(admin);
    return res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid session renewal key" });
  }
};

export const logoutAdmin = (req, res) => {
  tokenService.clearRefreshCookie(res);
  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
};

export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }
    return res.status(200).json({
      success: true,
      admin: {
        fullName: admin.fullName,
        username: admin.username,
        role: admin.role,
        clubId: admin.clubId || null,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
