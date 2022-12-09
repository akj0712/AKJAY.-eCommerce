import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { createError } from "../utils/error.js";

//** get single order */
export const newOrder = async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  try {
    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

//** get single order */
export const getSingleOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return next(createError(404, "order not found"));
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

//** get loggedin user order */
export const myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

//** get all order admin */
export const myAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find();

    let totalAmount = 0;
    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });

    res.status(200).json({ success: true, totalAmount, orders });
  } catch (err) {
    next(err);
  }
};

//** update order status admin */
export const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(createError(404, "order not found"));
    }

    if (order.orderStatus === "Delivered") {
      return next(createError(404, "order already delivered"));
    }

    order.orderItems.forEach(async (order) => {
      await updateStock(order.product, order.quantity);
    });

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

//** delete order admin */
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(createError(404, "order not found"));
    }

    await order.remove();

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
