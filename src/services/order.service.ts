import Order from '../models/Order';
import { cjService } from './cj.service';
import Product from '../models/Product';
import { IOrderCreateRequest } from '../types/order.types';

export class OrderService {
  async createOrder(userId: string, orderData: IOrderCreateRequest) {
    let totalAmount = 0;
    const items = [];

    // Calculate total and prepare order items
    for (const item of orderData.items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);

      totalAmount += product.price * item.quantity;
      items.push({
        product: product._id,
        cjProductId: product.cjProductId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = new Order({
      user: userId,
      orderNumber,
      items,
      totalAmount,
      shippingAddress: orderData.shippingAddress,
    });

    await order.save();

    // Optionally forward to CJ dropshipping immediately or doing it through cron
    const cjResponse = await cjService.placeOrder(order);
    order.cjOrderId = cjResponse.cjOrderId;
    order.status = 'processing';
    await order.save();

    return order;
  }

  async getOrderById(orderId: string, userId: string) {
    return Order.findOne({ _id: orderId, user: userId }).populate('items.product');
  }

  async getUserOrders(userId: string) {
    return Order.find({ user: userId }).populate('items.product').sort({ createdAt: -1 });
  }
}

export const orderService = new OrderService();
