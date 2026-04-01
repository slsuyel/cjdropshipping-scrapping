import Category from "../models/Category";
import { cjService } from "./cj.service";

export class CategoryService {
  /**
   * Sync categories from CJ API and store in DB
   */
  async syncCategories() {
    const cjCategories = await cjService.fetchCategories();

    const results = [];
    for (const firstLevel of cjCategories) {
      const subcategories = (firstLevel.categoryFirstList || []).map(
        (second: any) => ({
          categorySecondName: second.categorySecondName,
          items: (second.categorySecondList || []).map((third: any) => ({
            categoryId: third.categoryId,
            categoryName: third.categoryName,
          })),
        })
      );

      const doc = await Category.findOneAndUpdate(
        { categoryFirstName: firstLevel.categoryFirstName },
        {
          categoryFirstName: firstLevel.categoryFirstName,
          subcategories,
          lastSyncedAt: new Date(),
        },
        { new: true, upsert: true }
      );
      results.push(doc);
    }
    return results;
  }

  /**
   * Get all categories (full tree)
   */
  async getAllCategories() {
    return Category.find({}).sort({ categoryFirstName: 1 });
  }

  /**
   * Get a single top-level category by name (with its subcategories)
   */
  async getCategoryByName(name: string) {
    return Category.findOne({
      categoryFirstName: { $regex: new RegExp(name, "i") },
    });
  }

  /**
   * Find the third-level categoryId by searching category name
   */
  async findCategoryId(searchName: string) {
    const categories = await Category.find({});
    const results: { categoryId: string; categoryName: string; path: string }[] =
      [];

    for (const cat of categories) {
      for (const sub of cat.subcategories) {
        for (const item of sub.items) {
          if (
            item.categoryName.toLowerCase().includes(searchName.toLowerCase())
          ) {
            results.push({
              categoryId: item.categoryId,
              categoryName: item.categoryName,
              path: `${cat.categoryFirstName} > ${sub.categorySecondName} > ${item.categoryName}`,
            });
          }
        }
      }
    }
    return results;
  }
}

export const categoryService = new CategoryService();
