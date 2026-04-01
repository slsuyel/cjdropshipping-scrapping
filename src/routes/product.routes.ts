import { Router } from "express";
import {
  getProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
} from "../controllers/product.controller";

const router = Router();

router.get("/", getProducts);
router.get("/search", searchProducts); // Local DB search ?q=keyword
router.get("/category/:category", getProductsByCategory); // Local DB category search
router.get("/:id", getProductById);

export default router;
