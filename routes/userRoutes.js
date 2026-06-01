import express from 'express';
import { verifyUser, isApproved } from '../controllers/userController.js'; 

const router = express.Router();

router.post('/verify', verifyUser);
router.get('/is-approved/:deviceId', isApproved);

export default router;