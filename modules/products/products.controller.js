const mongoose = require("mongoose");
const {
  getAllProductService,
  postProductService,
  updateProductService,
} = require("./products.service");

exports.getAllProductController = async (req, resp, next) => {
  try {
    const { name, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (name) filter.name = name;

    const pageNum = parseInt(page, Math.max(page, 1) || 1);
    const limitNum = parseInt(limit, Math.max(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const { count, products } = await getAllProductService(
      filter,
      skip,
      limitNum,
    );

    return resp.status(200).json({
      success: true,
      message: "Products has been fetched",
      count: count,
      page: pageNum,
      data: products,
    });
  } catch (err) {
    return next(err);
  }
};

exports.postProductController = async (req, resp, next) => {
  try {
    const { name, info, actualPrice, stock } = req.body;
    if (
      !name ||
      !info ||
      !actualPrice ||
      typeof actualPrice !== "number" ||
      actualPrice < 0 ||
      !stock ||
      typeof stock !== "number" ||
      stock < 1
    ) {
      throw new Error("Please pass all required fields correctly");
    }

    const product = await postProductService(name, info, actualPrice, stock);

    return resp.status(201).json({
      success: true,
      message: "Product has been created",
      data: product,
    });
  } catch (err) {
    return next(err);
  }
};
exports.updateProductController = async (req, resp, next) => {
  try {
    const { name, info, actualPrice, discountedPrice, stock } = req.body;
    const filter = {};

    if (name) filter.name = name;
    if (info) filter.info = info;
    if (actualPrice) filter.actualPrice = actualPrice;
    if (discountedPrice) filter.discountedPrice = discountedPrice;
    if (stock) filter.stock = stock;

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Please pass valid id");
    }

    const product = await updateProductService(filter, id);

    return resp.status(200).json({
      success: true,
      message: "Products has been updated",
      data: product,
    });
  } catch (err) {
    return next(err);
  }
};
