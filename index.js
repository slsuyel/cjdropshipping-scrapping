require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 5000;

let cachedToken = null;
let tokenExpiry = null;

// 🔐 STEP 1: Get Access Token
async function getAccessToken() {
  try {
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return cachedToken;
    }

    const response = await axios.post(
      "https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken",
      { apiKey: process.env.CJ_API_KEY }
    );

    const token = response.data?.data?.accessToken;
    if (!token) throw new Error("Token Error");

    cachedToken = token;
    tokenExpiry = Date.now() + 55 * 60 * 1000;
    return token;
  } catch (err) {
    console.error("❌ Auth Error:", err.message);
    throw new Error("Auth Failed");
  }
}

// 🔎 STEP 2: Fetch Products with all available fields
async function fetchProducts(keyword, token) {
  try {
    const url = "https://developers.cjdropshipping.com/api2.0/v1/product/listV2";

    const response = await axios.get(url, {
      params: {
        page: 1,
        size: 20,
        keyWord: String(keyword).trim(),
        sort: "desc",
        orderBy: "0"
      },
      headers: {
        "CJ-Access-Token": token,
        "Content-Type": "application/json"
      }
    });

    const content = response.data?.data?.content || [];
    let allProducts = [];

    if (Array.isArray(content) && content.length > 0) {
      content.forEach(item => {
        if (item.productList && Array.isArray(item.productList)) {
          allProducts = [...allProducts, ...item.productList];
        }
      });
    }

    console.log(`🔎 Search for [${keyword}] | Found: ${allProducts.length}`);
    return allProducts;
  } catch (err) {
    console.error("❌ API Fetch Error:", err.response?.data || err.message);
    return [];
  }
}

// 🌐 STEP 3: API Route with comprehensive fields
app.get("/api/v1/products", async (req, res) => {
  try {
    const keyword = req.query.search || "hoodie";
    const token = await getAccessToken();
    const products = await fetchProducts(keyword, token);

    // Complete field mapping based on CJ API documentation
    const formatted = products.map((p) => ({
      // Basic Information
      id: p.id,
      name: p.nameEn,
      sku: p.sku,
      spu: p.spu,

      // Pricing
      price: p.sellPrice,
      nowPrice: p.nowPrice,
      discountPrice: p.discountPrice,
      discountPriceRate: p.discountPriceRate,

      // Images
      image: p.bigImage,
      images: p.productImageSet || [], // All images if available

      // Category Information
      category: {
        id: p.categoryId,
        name: p.threeCategoryName,
        level2: {
          id: p.twoCategoryId,
          name: p.twoCategoryName
        },
        level1: {
          id: p.oneCategoryId,
          name: p.oneCategoryName
        }
      },

      // Inventory & Shipping
      inventory: {
        total: p.warehouseInventoryNum,
        verified: p.totalVerifiedInventory,
        unverified: p.totalUnVerifiedInventory,
        isVerified: p.verifiedWarehouse === 1
      },
      isFreeShipping: p.addMarkStatus === 1,
      deliveryCycle: p.deliveryCycle, // Shipping time in days
      minOrderQuantity: p.directMinOrderNum || 1,

      // Product Status
      isVideo: p.isVideo === 1,
      videoList: p.videoList || [],
      hasVideo: p.isVideo === 1,
      isPersonalized: p.isPersonalized === 1,
      hasCECertification: p.hasCECertification === 1,
      customization: p.customization === 1,

      // Supplier Information
      supplier: {
        name: p.supplierName,
        id: p.supplierId
      },

      // Listing Information
      listedCount: p.listedNum,
      isCollect: p.isCollect === 1,
      myProduct: p.myProduct || false,
      saleStatus: p.saleStatus,
      authorityStatus: p.authorityStatus,

      // Timestamps
      createdAt: p.createAt,

      // Description (if available)
      description: p.description || "",

      // Variant Information (if available)
      variants: {
        key: p.variantKeyEn,
        inventory: p.variantInventories,
        info: p.inventoryInfo
      },

      // Additional Properties
      propertyKey: p.propertyKey,
      zoneRecommend: p.zoneRecommendJson,
      productType: p.productType,
      currency: p.currency || "USD"
    }));

    // Include search metadata
    res.json({
      success: true,
      total: formatted.length,
      searchKeyword: keyword,
      timestamp: new Date().toISOString(),
      products: formatted,
    });
  } catch (error) {
    console.error("❌ Route error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Optional: Endpoint to get single product details
app.get("/api/v1/product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const token = await getAccessToken();

    const response = await axios.get(
      "https://developers.cjdropshipping.com/api2.0/v1/product/query",
      {
        params: { pid: productId },
        headers: { "CJ-Access-Token": token }
      }
    );

    if (response.data?.code === 200 && response.data?.data) {
      const p = response.data.data;

      const productDetail = {
        id: p.pid,
        name: p.productNameEn,
        sku: p.productSku,
        price: p.sellPrice,
        images: p.productImageSet || [],
        description: p.description,
        category: p.categoryName,
        weight: p.productWeight,
        unit: p.productUnit,
        variants: p.variants?.map(v => ({
          id: v.vid,
          name: v.variantNameEn,
          sku: v.variantSku,
          price: v.variantSellPrice,
          weight: v.variantWeight,
          inventory: v.inventories
        })) || [],
        specifications: {
          material: p.materialNameEn,
          packing: p.packingNameEn,
          hsCode: p.entryCode,
          hsName: p.entryNameEn
        }
      };

      res.json({
        success: true,
        product: productDetail
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
  } catch (error) {
    console.error("❌ Product detail error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Optional: Endpoint with filters
app.get("/api/v1/products/filter", async (req, res) => {
  try {
    const {
      search = "hoodie",
      minPrice,
      maxPrice,
      categoryId,
      freeShipping,
      hasVideo,
      minInventory,
      page = 1,
      size = 20
    } = req.query;

    const token = await getAccessToken();

    const params = {
      page: parseInt(page),
      size: parseInt(size),
      keyWord: String(search).trim(),
      sort: "desc",
      orderBy: "0"
    };

    // Add filters if provided
    if (minPrice) params.startSellPrice = parseFloat(minPrice);
    if (maxPrice) params.endSellPrice = parseFloat(maxPrice);
    if (categoryId) params.categoryId = categoryId;
    if (freeShipping === "true") params.addMarkStatus = 1;
    if (hasVideo === "true") params.isVideo = 1;
    if (minInventory) params.startWarehouseInventory = parseInt(minInventory);

    const response = await axios.get(
      "https://developers.cjdropshipping.com/api2.0/v1/product/listV2",
      { params, headers: { "CJ-Access-Token": token } }
    );

    let products = [];
    const content = response.data?.data?.content || [];

    if (Array.isArray(content) && content.length > 0) {
      content.forEach(item => {
        if (item.productList && Array.isArray(item.productList)) {
          products = [...products, ...item.productList];
        }
      });
    }

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.nameEn,
      image: p.bigImage,
      price: p.sellPrice,
      originalPrice: p.nowPrice,
      discount: p.discountPriceRate,
      inventory: p.warehouseInventoryNum,
      freeShipping: p.addMarkStatus === 1,
      hasVideo: p.isVideo === 1,
      category: p.threeCategoryName,
      sku: p.sku
    }));

    res.json({
      success: true,
      pagination: {
        page: parseInt(page),
        size: parseInt(size),
        total: formatted.length
      },
      filters: { search, minPrice, maxPrice, categoryId, freeShipping, hasVideo },
      products: formatted
    });
  } catch (error) {
    console.error("❌ Filter error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.listen(PORT, () => {
  console.log(`\n✅ CJ Dropshipping API Server Running`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   GET  /api/v1/products?search=keyword`);
  console.log(`   GET  /api/v1/product/:id`);
  console.log(`   GET  /api/v1/products/filter?search=keyword&minPrice=10&maxPrice=50`);
  console.log(`   GET  /health`);
  console.log(`\n🔗 Test: http://localhost:${PORT}/api/v1/products?search=hoodie\n`);
});