const Product = require("./products.model");

exports.getAllProductService = async (filter, skip, limit) => {
  const products = await Product.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  if (products.length === 0) {
    throw new Error("No Product found");
  }

  const count = await Product.countDocuments(filter);

  return { count, products };
};

exports.postProductService = async (name, info, actualPrice, stock) => {
  const product = await Product.create({
    name,
    info,
    actualPrice,
    stock,
    stockMovementLog: [
      {
        type: "STOCK_ADDED",
        description: "Product has been created and stock is refilled",
      },
    ],
  });

  return product;
};

exports.updateProductService = async (updates, id) => {
  const product = await Product.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true },
  );

  if (!product) {
    throw new Error("No Product found for the given id");
  }

  return product;
};
