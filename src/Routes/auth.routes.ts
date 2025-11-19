import express from 'express';
const router = express.Router();
import AuthController from '../App/Controllers/auth.controller';
import { verifyToken } from '@/App/Middlewares/auth';

router.post('/login', AuthController.postLogin);
router.post('/logout', verifyToken, AuthController.postLogout);

export default router;
