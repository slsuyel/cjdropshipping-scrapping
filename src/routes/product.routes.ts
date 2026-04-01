import { Router } from "express";
import {
  getProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  getShippingCost,
} from "../controllers/product.controller";

const router = Router();

router.get("/", getProducts);
router.get("/shipping", getShippingCost); // Get shipping cost ?variantId=&countryCode=
router.get("/search", searchProducts); // Local DB search ?q=keyword
router.get("/category/:category", getProductsByCategory); // Local DB category search
router.get("/:id", getProductById);

export default router;
