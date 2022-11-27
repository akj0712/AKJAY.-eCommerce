import Product from "../models/product.js";
import { createError } from "../utils/error.js";

//** Always use trycatch block with async function or asyncHandler

//** CREATE -- ADMIN
export const createProduct = async (req, res, next) => {
  const newProduct = new Product(req.body);
  try {
    const savedProduct = await newProduct.save();
    res.status(201).json({ success: true, savedProduct });
  } catch (err) {
    next(err);
  }
};

//** GET
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(createError(400, "product not found"));
    }

    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

//** GET ALL
export const getAllProduct = async (req, res, next) => {
  try {
    const products = await Product.find();

    if (products.length == 0) {
      return next(createError(400, "no product available"));
    }

    res.status(200).json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

//** UPDATE -- ADMIN
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(createError(400, "product not found for updation"));
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    next(err);
  }
};

//** DELETE
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(createError(400, "product not found for deletion"));
    }

    await Product.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "product has been deleted" });
  } catch (err) {
    next(err);
  }
};
