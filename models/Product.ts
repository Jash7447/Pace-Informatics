import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Omit<Document, 'model'> {
  name: string;
  brand: string;
  model?: string;
  serialNumber?: string;
  stock: number;
  costPrice: number;
  sellPrice?: number;
  location?: string;
  remarks?: string;
  category: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    serialNumber: {
      type: String,
      trim: true,
    },
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative'],
    },
    sellPrice: {
      type: Number,
      min: [0, 'Sell price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    location: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ProductSchema.index({ category: 1 });
ProductSchema.index({ name: 1, brand: 1, model: 1, serialNumber: 1 });

const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;

