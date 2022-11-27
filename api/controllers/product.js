import Product from "../models/product.js";

//** CREATE -- ADMIN
export const createProduct = async (req, res, next) => {
  const newProduct = new Product(req.body);
  try {
    const savedProduct = await newProduct.save();
    res.status(201).json({ success: true, savedProduct });
  } catch (err) {
    res.status(500).json({ success: false, err });
  }
};

//** GET
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ success: false, err });
  }
};

//** GET ALL
export const getAllProduct = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, err });
  }
};

//** UPDATE -- ADMIN
export const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ success: false, err });
  }
};

//** DELETE
export const deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("product has been deleted");
  } catch (err) {
    res.status(500).json({ success: false, err });
  }
};
