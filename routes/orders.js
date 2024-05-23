import express from 'express';
import {
	getOrder,
	getOrders,
	createOrder,
	updateOrder,
	deleteOrder,
} from '../controllers/orders.js';
import auth from '../middlewares/auth.js';
const router = express.Router();

router.get('/', auth, getOrders);
router.get('/:id', auth, getOrder);
router.post('/', auth, createOrder);
router.patch('/:id', auth, updateOrder);
router.delete('/:id', auth, deleteOrder);

export default router;
