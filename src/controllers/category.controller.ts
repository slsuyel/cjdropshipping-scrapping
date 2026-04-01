import { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/category.service";

export const syncCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await categoryService.syncCategories();
    res.status(200).json({
      success: true,
      message: `Synced ${categories.length} top-level categories`,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

export const getCategoryByName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const name = req.params.name as string;
    const category = await categoryService.getCategoryByName(name);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

export const searchCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req.query.q as string) || "";
    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Query param 'q' is required" });
    }

    const results = await categoryService.findCategoryId(query);
    res.status(200).json({ success: true, total: results.length, data: results });
  } catch (err) {
    next(err);
  }
};
