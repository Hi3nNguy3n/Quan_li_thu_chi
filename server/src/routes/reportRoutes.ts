import { Router } from 'express';
import {
  getSummaryReport,
  getTransactionHistory
} from '../controllers/reportController';

const router = Router();

router.get('/history', getTransactionHistory);
router.get('/summary', getSummaryReport);

export default router;
