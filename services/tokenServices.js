import jwt from "jsonwebtoken";
import { tokenConfig } from "../config/token.config.js";

class TokenService {
  /**
   * Generates a standard 15-minute access token
   */
  generateAccessToken(admin) {
    return jwt.sign(
      { adminId: admin._id, role: admin.role, fullName: admin.fullName },
      tokenConfig.access.secret,
      { expiresIn: tokenConfig.access.expiresIn },
    );
  }

  /**
   * Sets the HttpOnly Refresh Cookie directly onto the Express Response stream
   */
  setRefreshCookie(res, admin) {
    const refreshToken = jwt.sign(
      { adminId: admin._id, role: admin.role },
      tokenConfig.refresh.secret,
      { expiresIn: tokenConfig.refresh.expiresIn },
    );

    res.cookie("jwt_refresh", refreshToken, {
      ...tokenConfig.cookieOptions,
      maxAge: tokenConfig.refresh.cookieMaxAge,
    });
  }

  /**
   * Safely clears the refresh cookie out of the client browser
   */
  clearRefreshCookie(res) {
    res.clearCookie("jwt_refresh", tokenConfig.cookieOptions);
  }

  /**
   * Decodes and verifies a raw refresh token string
   */
  verifyRefreshToken(token) {
    return jwt.verify(token, tokenConfig.refresh.secret);
  }
}

export default new TokenService();
