import Product from "../models/Product";
import { cjService } from "./cj.service";

export class ProductService {
  private parsePrice(priceVal: any): number {
    if (typeof priceVal === "number") return priceVal;
    if (!priceVal) return 0;
    const match = String(priceVal).match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  async getAllProductsInDb(filters = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const products = await Product.find(filters).skip(skip).limit(limit);
    const total = await Product.countDocuments(filters);
    return { products, total, page, limit };
  }

  /**
   * Sync products from CJ list API → saves basic data to DB.
   * For full details (variants, description, specs), call fetchAndStoreFullDetail per product.
   */
  async syncCjToDb(keyword: string) {
    const cjProducts = await cjService.fetchProducts(keyword);

    const syncedProducts = [];
    for (const p of cjProducts) {
      const dbProduct = await Product.findOneAndUpdate(
        { cjProductId: p.id },
        {
          title: p.nameEn,
          price: this.parsePrice(p.sellPrice),
          originalPrice: this.parsePrice(p.nowPrice),
          discountPrice: this.parsePrice(p.discountPrice),
          discountPriceRate: p.discountPriceRate,
          image: p.bigImage,
          images: p.productImageSet || [],
          category: {
            id: p.categoryId,
            name: p.threeCategoryName,
            level2: { id: p.twoCategoryId, name: p.twoCategoryName },
            level1: { id: p.oneCategoryId, name: p.oneCategoryName },
          },
          sku: p.sku,
          spu: p.spu,
          inventory: {
            total: p.warehouseInventoryNum || 0,
            verified: p.totalVerifiedInventory || 0,
            unverified: p.totalUnVerifiedInventory || 0,
            isVerified: p.verifiedWarehouse === 1,
          },
          supplier: { name: p.supplierName, id: p.supplierId },
          isFreeShipping: p.addMarkStatus === 1,
          deliveryCycle: p.deliveryCycle,
          isVideo: p.isVideo === 1,
          videoList: p.videoList || [],
          isPersonalized: p.isPersonalized === 1,
          isActive: true,
          isSynced: true,
        },
        { new: true, upsert: true }
      );
      syncedProducts.push(dbProduct);
    }
    return syncedProducts;
  }

  /**
   * Fetch FULL product detail from CJ /product/query API
   * and update the DB record with rich data (description, variants, weight, specs).
   */
  async fetchAndStoreFullDetail(cjProductId: string) {
    const cjData = await cjService.fetchProductDetail(cjProductId);
    if (!cjData) return null;

    const p: any = cjData;

    const variants =
      p.variants?.map((v: any) => ({
        id: v.vid,
        name: v.variantNameEn,
        sku: v.variantSku,
        price: this.parsePrice(v.variantSellPrice),
        weight: v.variantWeight,
        inventory: v.inventories,
        image: v.variantImage || "",
      })) || [];

    const dbProduct = await Product.findOneAndUpdate(
      { cjProductId: p.pid },
      {
        title: p.productNameEn,
        description: p.description || "",
        price: this.parsePrice(p.sellPrice),
        image: p.productImage,
        images: p.productImageSet || [],
        sku: p.productSku,
        weight: p.productWeight,
        unit: p.productUnit,
        variants,
        specifications: {
          material: p.materialNameEn || "",
          packing: p.packingNameEn || "",
          hsCode: p.entryCode || "",
          hsName: p.entryNameEn || "",
        },
        category: {
          id: p.categoryId,
          name: p.categoryName,
          level2: { id: "", name: "" },
          level1: { id: "", name: "" },
        },
        isDetailFetched: true,
      },
      { new: true, upsert: true }
    );
    return dbProduct;
  }

  /**
   * Get single product:
   * 1. Try DB first
   * 2. If found but missing full details → fetch from CJ API and update
   * 3. If not found in DB → fetch from CJ API, store, and return
   */
  async getProductById(id: string) {
    // Try MongoDB first (by Mongo _id or by CJ product ID)
    let product = await Product.findById(id).catch(() => null);
    if (!product) {
      product = await Product.findOne({ cjProductId: id });
    }

    // If found in DB but details never fetched → enrich from CJ
    if (product && !product.isDetailFetched) {
      const enriched = await this.fetchAndStoreFullDetail(product.cjProductId);
      return enriched || product;
    }

    // If not in DB at all → try fetching directly from CJ
    if (!product) {
      const freshProduct = await this.fetchAndStoreFullDetail(id);
      return freshProduct;
    }

    return product;
  }

  /**
   * Search products in DB by category name (matches any level)
   */
  async getProductsByCategory(categoryName: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter = {
      $or: [
        { "category.name": { $regex: new RegExp(categoryName, "i") } },
        { "category.level1.name": { $regex: new RegExp(categoryName, "i") } },
        { "category.level2.name": { $regex: new RegExp(categoryName, "i") } },
      ],
    };

    const products = await Product.find(filter).skip(skip).limit(limit);
    const total = await Product.countDocuments(filter);
    return { products, total, page, limit };
  }

  /**
   * Search products in DB by keyword (title or description)
   */
  async searchProducts(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter = {
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { description: { $regex: new RegExp(query, "i") } },
      ],
    };

    const products = await Product.find(filter).skip(skip).limit(limit);
    const total = await Product.countDocuments(filter);
    return { products, total, page, limit };
  }

  /**
   * Calculate shipping for a variant to a destination
   */
  async calculateShipping(
    endCountryCode: string,
    variantId: string,
    quantity: number = 1,
    startCountryCode: string = "CN",
  ) {
    return await cjService.calculateShipping(
      startCountryCode,
      endCountryCode,
      variantId,
      quantity,
    );
  }
}

export const productService = new ProductService();
