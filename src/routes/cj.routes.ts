import { Router } from "express";
import {
  searchCjProducts,
  syncProductsToDb,
  getCjProductDetail,
} from "../controllers/cj.controller";

const router = Router();

router.get("/search", searchCjProducts);
router.post("/sync", syncProductsToDb);
router.get("/product/:id", getCjProductDetail);

export default router;
