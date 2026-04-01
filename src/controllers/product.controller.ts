import { Request, Response, NextFunction } from "express";
import { productService } from "../services/product.service";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const data = await productService.getAllProductsInDb({}, page, limit);

    res.status(200).json({
      success: true,
      data: data.products,
      pagination: {
        total: data.total,
        page: data.page,
        limit: data.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await productService.getProductById(req.params.id as string);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};
