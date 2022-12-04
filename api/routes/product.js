import express from "express";
import {
  createProduct,
  createProductReview,
  deleteProduct,
  deleteReviews,
  getAllProduct,
  getProduct,
  getProductReviews,
  updateProduct,
} from "../controllers/product.js";
import { authorizeRoles, isAuthenticatedUser } from "../utils/auth.js";

const router = express.Router();

router.get("/product/:id", getProduct);

router.get("/products", getAllProduct);

router.post(
  "/admin/product/new",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  createProduct
);

router.put(
  "/admin/product/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateProduct
);

router.delete(
  "/admin/product/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteProduct
);

router.put("/review", isAuthenticatedUser, createProductReview);

router.get("/reviews", getProductReviews);

router.delete("/reviews", isAuthenticatedUser, deleteReviews);

export default router;
