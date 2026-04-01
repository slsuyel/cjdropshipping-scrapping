import { Request, Response, NextFunction } from "express";
import { cjService } from "../services/cj.service";
import { productService } from "../services/product.service";

export const searchCjProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const keyword = (req.query.keyword as string) || "hoodie";
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 20;

    const products = await cjService.fetchProducts(keyword, page, size);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        size,
        total: products.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const syncProductsToDb = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const keyword = (req.body.keyword as string) || "t-shirt";
    const products = await productService.syncCjToDb(keyword);

    res.status(200).json({
      success: true,
      message: `Synced ${products.length} products to DB`,
    });
  } catch (err) {
    next(err);
  }
};
