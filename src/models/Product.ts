import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  cjProductId: string; // PID from CJ Dropshipping
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  images: string[];
  category: string;
  sku: string;
  inventory: number;
  variants: any[];
  isActive: boolean;
  isSynced: boolean;
}

const ProductSchema: Schema = new Schema(
  {
    cjProductId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    image: { type: String },
    images: [{ type: String }],
    category: { type: String },
    sku: { type: String },
    inventory: { type: Number, default: 0 },
    variants: { type: Schema.Types.Mixed }, // flexible format for variants
    isActive: { type: Boolean, default: true },
    isSynced: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
