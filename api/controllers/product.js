import Product from "../models/Product.js";
import { ApiFeatures } from "../utils/apiFeatures.js";
import { createError } from "../utils/error.js";

//** Always use trycatch block with async function or asyncHandler

//** CREATE -- ADMIN
export const createProduct = async (req, res, next) => {
  req.body.user = req.user.id;
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
  const resultPerPage = 5;
  const productCount = await Product.countDocuments();
  try {
    const apiFeatures = new ApiFeatures(Product.find(), req.query)
      .search()
      .filter()
      .pagination(resultPerPage);
    const products = await apiFeatures.query;

    if (productCount == 0) {
      return next(createError(400, "no product available"));
    }

    res.status(200).json({ success: true, products, productCount });
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

//** create new review or update the review */
export const createProductReview = async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  try {
    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });
    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

//** get all reviews of a single product */
export const getProductReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.id);
    if (!product) {
      return next(createError(400, "product not found"));
    }
    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (err) {
    next(err);
  }
};

//** delete reviews of a product */
export const deleteReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.productId);
    if (!product) {
      return next(createError(400, "product not found"));
    }

    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;
    reviews.forEach((rev) => {
      avg += rev.rating;
    });
    const ratings = avg / reviews.length;

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
};
