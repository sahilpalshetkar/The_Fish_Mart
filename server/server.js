import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import shopRouter from "./routes/shop.routes.js";
import itemRouter from "./routes/item.routes.js";
import cartRouter from "./routes/cart.routes.js";
import pincodeRouter from "./routes/pincode.routes.js";
import orderRouter from "./routes/order.routes.js";
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://the-fish-mart.onrender.com",
    credentials: true,
  }),
);
const port = process.env.PORT || 3000;

//mongodb connection
connectDB();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/cart", cartRouter);
app.use("/api/delivery", pincodeRouter);
app.use("/api/order", orderRouter);

app.listen(port, () => {
  console.log(`Server started at ${port}`);
});
