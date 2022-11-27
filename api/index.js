import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import productRoute from "./routes/product.js";

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
app.use(express.json());

app.use("/api/v1", productRoute);



app.listen(process.env.PORT || 4000, () => {
  connect();
  console.log(`server is running ${process.env.PORT}`);
});
