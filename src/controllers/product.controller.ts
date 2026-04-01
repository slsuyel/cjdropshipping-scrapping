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
    const product = await productService.getProductById(
      req.params.id as string,
    );

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

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = (req.query.q as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const data = await productService.searchProducts(query, page, limit);

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

export const getProductsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const category = req.params.category as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const data = await productService.getProductsByCategory(
      category,
      page,
      limit,
    );

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

export const getShippingCost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { variantId, countryCode, quantity, startCountryCode } = req.query;

    if (!variantId || !countryCode) {
      return res.status(400).json({
        success: false,
        message: "variantId and countryCode are required",
      });
    }

    const shippingMethods = await productService.calculateShipping(
      countryCode as string,
      variantId as string,
      parseInt(quantity as string) || 1,
      startCountryCode ? (startCountryCode as string) : "CN"
    );

    res.status(200).json({
      success: true,
      data: shippingMethods,
    });
  } catch (err) {
    next(err);
  }
};
