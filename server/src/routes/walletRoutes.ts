import { Router } from 'express';
import {
  createWallet,
  deleteWallet,
  listWallets,
  updateWallet
} from '../controllers/walletController';

const router = Router();

router.get('/', listWallets);
router.post('/', createWallet);
router.patch('/:id', updateWallet);
router.delete('/:id', deleteWallet);

export default router;
