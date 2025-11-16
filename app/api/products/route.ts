import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// GET all products (optionally filtered by category)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');

    const query: any = {};
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      query.category = categoryId;
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST create a new product
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, brand, model, stock, location, remarks, category } = body;

    // Validate required fields
    if (!name || !brand || !model || stock === undefined || !location || !category) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name,
      brand,
      model,
      stock: Number(stock),
      location,
      remarks,
      category,
    });

    await product.populate('category', 'name');

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

