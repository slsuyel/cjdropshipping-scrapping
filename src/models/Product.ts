import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  cjProductId: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPrice: number;
  discountPriceRate: string;
  image: string;
  images: string[];
  category: {
    id: string;
    name: string;
    level2: { id: string; name: string };
    level1: { id: string; name: string };
  };
  sku: string;
  spu: string;
  weight: number;
  unit: string;
  inventory: {
    total: number;
    verified: number;
    unverified: number;
    isVerified: boolean;
  };
  variants: {
    id: string;
    name: string;
    sku: string;
    price: number;
    weight: number;
    inventory: number;
    image: string;
  }[];
  specifications: {
    material: string;
    packing: string;
    hsCode: string;
    hsName: string;
  };
  supplier: { name: string; id: string };
  isFreeShipping: boolean;
  deliveryCycle: string;
  isVideo: boolean;
  videoList: string[];
  isPersonalized: boolean;
  isActive: boolean;
  isSynced: boolean;
  isDetailFetched: boolean;
}

const ProductSchema: Schema = new Schema(
  {
    cjProductId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    discountPrice: { type: Number },
    discountPriceRate: { type: String },
    image: { type: String },
    images: [{ type: String }],
    category: {
      id: String,
      name: String,
      level2: { id: String, name: String },
      level1: { id: String, name: String },
    },
    sku: { type: String },
    spu: { type: String },
    weight: { type: Number },
    unit: { type: String },
    inventory: {
      total: { type: Number, default: 0 },
      verified: { type: Number, default: 0 },
      unverified: { type: Number, default: 0 },
      isVerified: { type: Boolean, default: false },
    },
    variants: [
      {
        id: String,
        name: String,
        sku: String,
        price: Number,
        weight: Number,
        inventory: Number,
        image: String,
      },
    ],
    specifications: {
      material: String,
      packing: String,
      hsCode: String,
      hsName: String,
    },
    supplier: { name: String, id: String },
    isFreeShipping: { type: Boolean, default: false },
    deliveryCycle: { type: String },
    isVideo: { type: Boolean, default: false },
    videoList: [{ type: String }],
    isPersonalized: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isSynced: { type: Boolean, default: true },
    isDetailFetched: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
