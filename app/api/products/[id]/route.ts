import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

// PUT update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();
    const { id } = await Promise.resolve(params);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, brand, model, serialNumber, stock, costPrice, sellPrice, location, remarks, category } = body;

    // If category is being updated, validate it
    if (category && !mongoose.Types.ObjectId.isValid(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (brand !== undefined) updateData.brand = brand;
    if (model !== undefined) updateData.model = model;
    if (serialNumber !== undefined) updateData.serialNumber = serialNumber;
    if (stock !== undefined) updateData.stock = Number(stock);
    if (costPrice !== undefined) updateData.costPrice = Number(costPrice);
    if (sellPrice !== undefined) updateData.sellPrice = sellPrice === '' ? undefined : Number(sellPrice);
    if (location !== undefined) updateData.location = location;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (category !== undefined) updateData.category = category;

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name');

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check stock difference for transaction logging
    if (stock !== undefined) {
      const newStock = Number(stock);
      const stockDiff = newStock - existingProduct.stock;

      if (stockDiff !== 0) {
        try {
          if (stockDiff > 0) {
            // Stock added
            await Transaction.create({
              product: product._id,
              productName: product.name,
              brand: product.brand,
              type: 'add',
              quantity: stockDiff,
              costPrice: costPrice !== undefined ? Number(costPrice) : existingProduct.costPrice,
            });
          } else {
            // Stock sold
            const quantitySold = Math.abs(stockDiff);
            const txCostPrice = costPrice !== undefined ? Number(costPrice) : existingProduct.costPrice;
            const txSellPrice = sellPrice !== undefined && sellPrice !== '' ? Number(sellPrice) : (existingProduct.sellPrice || txCostPrice);
            const profit = (txSellPrice - txCostPrice) * quantitySold;

            await Transaction.create({
              product: product._id,
              productName: product.name,
              brand: product.brand,
              type: 'sell',
              quantity: quantitySold,
              costPrice: txCostPrice,
              sellPrice: txSellPrice,
              profit: profit,
            });
          }
        } catch (err) {
          console.error('Failed to log product update transaction:', err);
        }
      }
    }

    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();
    const { id } = await Promise.resolve(params);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

