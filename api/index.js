import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import productRoute from "./routes/product.js";
import userRoute from "./routes/user.js";
import orderRoute from "./routes/order.js";
import cookieParser from "cookie-parser";

//** Handling uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("shutting down server due to Uncaught Exception");
  process.exit(1);
});

const app = express();
dotenv.config();

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("connected to MONGODB.");
  } catch (error) {
    throw error;
  }
};
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected.");
});

// ** middleware (able to reach our request and response before sending anything to the user)
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use("/api/v1", productRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", orderRoute);

// ** Error handling middleware
app.use((err, req, res, next) => {
  let errorStatus = err.status || 500;
  let errorMessage = err.message || "Something went wrong!";
  if (err.name === "CastError") {
    errorMessage = `resource not found. Invalid: ${err.path}`;
    errorStatus = 400;
  }

  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  });
});

const server = app.listen(process.env.PORT || 4000, () => {
  connect();
  console.log(`server is running ${process.env.PORT}`);
});

//** Unhandled Promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("shutting down server due to unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});
