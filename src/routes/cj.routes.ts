import { Router } from "express";
import {
  searchCjProducts,
  syncProductsToDb,
} from "../controllers/cj.controller";

const router = Router();

router.get("/search", searchCjProducts);
router.post("/sync", syncProductsToDb);

export default router;
