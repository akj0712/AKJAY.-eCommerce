import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProduct,
  getProduct,
  updateProduct,
} from "../controllers/product.js";
import { authorizeRoles, isAuthenticatedUser } from "../utils/auth.js";

const router = express.Router();

router.get("/product/:id", getProduct);

router.get("/products", getAllProduct);

router.post(
  "/product/new",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  createProduct
);

router.put(
  "/product/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateProduct
);

router.delete(
  "/product/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteProduct
);

export default router;
