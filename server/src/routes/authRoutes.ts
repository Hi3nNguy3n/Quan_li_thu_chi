import { Router } from 'express';
import { googleSignIn, getProfile } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/google', googleSignIn);
router.get('/me', requireAuth, getProfile);

export default router;
