export interface ICartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface IOrderCreateRequest {
  items: ICartItem[];
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
}
