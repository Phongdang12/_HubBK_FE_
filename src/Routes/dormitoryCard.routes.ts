import express from 'express';
const router = express.Router();
import DormitoryCardController from '@/App/Controllers/dormitory.controller';

router.get('/check/:ssn', DormitoryCardController.checkDormitoryCard);
router.put('/set/:ssn', DormitoryCardController.setDormitoryCard);
router.post('/set/:ssn', DormitoryCardController.setDormitoryCard);

export default router;
