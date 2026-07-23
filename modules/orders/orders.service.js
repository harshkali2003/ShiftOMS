const Order = require("./orders.model");
const Product = require("../products/products.model");

exports.createOrderService = async (userId, items) => {
  let totalPrice = 0;
  for (let item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error("Product is either unavailable or not found");
    }

    totalPrice += item.quantity * item.price;
  }

  const order = await Order.create({
    userId,
    items,
    totalPrice,
    orderStatus: "PENDING",
    paymentStatus: "PENDING",
  });

  return order;
};

exports.getMyOrderService = async (userId) => {
  const orders = await Order.find({ userId });
  if (orders.length === 0) {
    throw new Error("No Order found");
  }

  return orders;
};

exports.getAllOrderService = async (filter, skip, limit) => {
  const orders = await Order.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  if (orders.length === 0) {
    throw new Error("No Order found");
  }

  const count = await Order.find(filter);

  return { count, orders };
};

exports.updateOrderStatusService = async (id , status) => {
  const allowedTransition = {
    PENDING: ["PROCESSED", "CANCELLED"], 
    PROCESSED: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [], 
    CANCELLED: [],
  };

  const order = await Order.findById(id);
  if(!order){
    throw new Error("No Order found")
  }

  const currentStatus = order.orderStatus;

  if(currentStatus.toString() === status.toString()){
    return order;
  }

  const validateStatus = allowedTransition[currentStatus] || [];
  if(!validateStatus.includes(status)){
    throw new Error("Transition not allowed")
  }

  order.orderStatus = status;
  await order.save();

  return order;
};
