import express from "express";
import {
  deleteOrder,
  getSingleOrder,
  myAllOrders,
  myOrders,
  newOrder,
  updateOrder,
} from "../controllers/order.js";
import { authorizeRoles, isAuthenticatedUser } from "../utils/auth.js";

const router = express.Router();

router.post("/order/new", isAuthenticatedUser, newOrder);

router.get("/order/:id", isAuthenticatedUser, getSingleOrder);

router.get("/orders/me", isAuthenticatedUser, myOrders);

router.get(
  "/admin/orders",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  myAllOrders
);

router.put(
  "/admin/order/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateOrder
);

router.delete(
  "/admin/order/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteOrder
);

export default router;
