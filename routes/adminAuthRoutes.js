import express from 'express';
import { loginAdmin, refreshAdminSession, logoutAdmin } from '../controllers/adminAuthControllers.js';

const router = express.Router();

// Public login node - Used on initial dashboard boot up screen
router.post('/login', loginAdmin);

// Silent auto-refresh check - Dashboard calls this if the 15m access token expires
router.post('/refresh', refreshAdminSession);

// Clears cookies upon dashboard exit
router.post('/logout', logoutAdmin);

export default router;