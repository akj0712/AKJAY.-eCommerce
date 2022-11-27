import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProduct,
  getProduct,
  updateProduct,
} from "../controllers/product.js";

const router = express.Router();

router.get("/product/:id", getProduct);

router.get("/products", getAllProduct);

router.post("/product/new", createProduct);

router.put("/product/:id", updateProduct);

router.delete("/product/:id", deleteProduct);

export default router;
