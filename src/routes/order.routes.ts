import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Secure all order routes
router.use(authenticate);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

export default router;
