import { Router } from "express";
import {
  searchCjProducts,
  syncProductsToDb,
  getCjProductDetail,
} from "../controllers/cj.controller";

const router = Router();

router.get("/search", searchCjProducts);
router.post("/sync", syncProductsToDb);
router.get("/product/:id", getCjProductDetail); // Fetch full detail from CJ and save to DB

export default router;
