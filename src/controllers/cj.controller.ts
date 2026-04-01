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
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

export const getCjProductDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cjProductId = req.params.id as string;
    const product = await productService.fetchAndStoreFullDetail(cjProductId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found on CJ" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};
