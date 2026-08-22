import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    product: mongoose.Types.ObjectId;
    productName: string;
    brand: string;
    type: 'add' | 'sell';
    quantity: number;
    costPrice: number;
    sellPrice?: number;
    profit?: number;
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        productName: {
            type: String,
            required: true,
            trim: true,
        },
        brand: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['add', 'sell'],
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1'],
        },
        costPrice: {
            type: Number,
            required: true,
            min: [0, 'Cost price cannot be negative'],
        },
        sellPrice: {
            type: Number,
            min: [0, 'Sell price cannot be negative'],
        },
        profit: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

// Add index for fast querying by date
TransactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
