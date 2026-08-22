import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// PUT update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();
    const { id } = await Promise.resolve(params);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category }, { status: 200 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Category name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();
    const { id } = await Promise.resolve(params);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action'); // 'delete-products' | 'move-products'
    const transferTo = searchParams.get('transferTo');

    // Check if there are associated products
    const productCount = await Product.countDocuments({ category: id });

    if (productCount > 0 && !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category has associated products',
          hasProducts: true,
          productCount,
        },
        { status: 400 }
      );
    }

    if (action === 'delete-products') {
      // Delete all products in this category
      await Product.deleteMany({ category: id });
    } else if (action === 'move-products') {
      if (!transferTo || !mongoose.Types.ObjectId.isValid(transferTo)) {
        return NextResponse.json(
          { success: false, error: 'Invalid migration target category ID' },
          { status: 400 }
        );
      }

      // Verify target category exists
      const targetCategoryExists = await Category.findById(transferTo);
      if (!targetCategoryExists) {
        return NextResponse.json(
          { success: false, error: 'Migration target category not found' },
          { status: 404 }
        );
      }

      // Move products to target category
      await Product.updateMany({ category: id }, { category: transferTo });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Category deleted successfully', data: category },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}

