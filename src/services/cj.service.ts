import { cjClient, getAccessToken } from "../config/cjApi";
import { ICjProduct } from "../types/product.types";

export class CjService {
  async fetchProducts(
    keyword: string = "hoodie",
    page: number = 1,
    size: number = 20,
  ): Promise<any[]> {
    const token = await getAccessToken();

    const response = await cjClient.get("/product/listV2", {
      params: { page, size, keyWord: keyword, sort: "desc", orderBy: "0" },
      headers: { "CJ-Access-Token": token },
    });

    const content = response.data?.data?.content || [];
    let allProducts: any[] = [];

    if (Array.isArray(content) && content.length > 0) {
      content.forEach((item) => {
        if (item.productList && Array.isArray(item.productList)) {
          allProducts = [...allProducts, ...item.productList];
        }
      });
    }
    return allProducts;
  }

  async fetchProductDetail(productId: string): Promise<ICjProduct | null> {
    const token = await getAccessToken();

    const response = await cjClient.get("/product/query", {
      params: { pid: productId },
      headers: { "CJ-Access-Token": token },
    });

    if (response.data?.code === 200 && response.data?.data) {
      return response.data.data;
    }
    return null;
  }

  async fetchCategories(): Promise<any[]> {
    const token = await getAccessToken();

    const response = await cjClient.get("/product/getCategory", {
      headers: { "CJ-Access-Token": token },
    });

    if (response.data?.code === 200 && response.data?.data) {
      return response.data.data;
    }
    return [];
  }

  async placeOrder(orderPayload: any) {
    // API endpoint for placing order with CJ Dropshipping. Look into actual CJ Dropshipping docs to map correctly
    // This is a placeholder for the logic
    return { success: true, cjOrderId: "CJ_" + Date.now() };
  }

  async calculateShipping(
    startCountryCode: string = "CN",
    endCountryCode: string,
    vid: string,
    quantity: number = 1
  ): Promise<any[]> {
    const token = await getAccessToken();

    const payload = {
      startCountryCode,
      endCountryCode,
      products: [
        {
          quantity,
          vid,
        },
      ],
    };

    const response = await cjClient.post("/logistic/freightCalculate", payload, {
      headers: { "CJ-Access-Token": token },
    });

    if (response.data?.code === 200 && response.data?.data) {
      return response.data.data;
    }
    return [];
  }
}

export const cjService = new CjService();
