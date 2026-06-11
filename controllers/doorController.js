import UserSubmission from "../models/UserSubmission.js";

/**
 * GET /api/door/verify/:qrKey
 * Called by the bouncer app when scanning a user's QR code
 * Returns name, age, selfie for visual verification
 * No sensitive data (no ID document, no ID number)
 */

