import { Router } from "express";
import {
  syncCategories,
  getAllCategories,
  getCategoryByName,
  searchCategory,
} from "../controllers/category.controller";

const router = Router();

router.post("/sync", syncCategories);        // Sync categories from CJ → DB
router.get("/", getAllCategories);            // Get all categories
router.get("/search", searchCategory);       // Search categories by name ?q=office
router.get("/:name", getCategoryByName);     // Get single top-level category

export default router;
