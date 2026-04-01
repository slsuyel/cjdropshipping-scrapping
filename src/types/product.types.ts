export interface ICjProduct {
  pid: string;
  productNameEn: string;
  productSku: string;
  sellPrice: number;
  productImageSet: string[];
  description?: string;
  categoryName?: string;
  productWeight?: number;
  productUnit?: string;
  variants?: ICjVariant[];
}

export interface ICjVariant {
  vid: string;
  variantNameEn: string;
  variantSku: string;
  variantSellPrice: number;
  variantWeight: number;
  inventories: number;
}
