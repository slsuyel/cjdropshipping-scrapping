import Product, { IProduct } from "../models/Product";
import { cjService } from "./cj.service";

export class ProductService {
  async getAllProductsInDb(filters = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const products = await Product.find(filters).skip(skip).limit(limit);
    const total = await Product.countDocuments(filters);

    return { products, total, page, limit };
  }

  async syncCjToDb(keyword: string) {
    const cjProducts = await cjService.fetchProducts(keyword);

    const syncedProducts = [];
    for (const p of cjProducts) {
      const dbProduct = await Product.findOneAndUpdate(
        { cjProductId: p.id },
        {
          title: p.nameEn,
          price: p.sellPrice,
          originalPrice: p.nowPrice,
          image: p.bigImage,
          images: p.productImageSet || [],
          category: p.threeCategoryName,
          sku: p.sku,
          inventory: p.warehouseInventoryNum,
          isActive: true,
          variants: p.variantInfo || [],
        },
        { new: true, upsert: true },
      );
      syncedProducts.push(dbProduct);
    }
    return syncedProducts;
  }

  async getProductById(id: string) {
    let product = await Product.findById(id);
    if (!product) {
      // Trying to look it up by CJ Product ID
      product = await Product.findOne({ cjProductId: id });
    }
    return product;
  }
}

export const productService = new ProductService();
