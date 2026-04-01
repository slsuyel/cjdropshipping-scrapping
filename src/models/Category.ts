import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  categoryFirstName: string;
  subcategories: {
    categorySecondName: string;
    items: {
      categoryId: string;
      categoryName: string;
    }[];
  }[];
  lastSyncedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    categoryFirstName: { type: String, required: true, unique: true },
    subcategories: [
      {
        categorySecondName: { type: String },
        items: [
          {
            categoryId: { type: String },
            categoryName: { type: String },
          },
        ],
      },
    ],
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
