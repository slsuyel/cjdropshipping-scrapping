import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware";

// Routes
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import cjRoutes from "./routes/cj.routes";
import categoryRoutes from "./routes/category.routes";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health Check
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "UP", message: "E-Commerce server is running" });
});

// API Routes
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/cj", cjRoutes);
app.use("/api/v1/categories", categoryRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
