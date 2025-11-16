import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

// GET statistics
export async function GET() {
  try {
    console.log('Connecting to MongoDB');
    await connectDB();
    console.log('Connected to MongoDB');
    // Total products count
    const totalProducts = await Product.countDocuments();
    
    // Category-wise product count
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      {
        $unwind: '$categoryInfo',
      },
      {
        $project: {
          categoryName: '$categoryInfo.name',
          count: 1,
          totalStock: 1,
        },
      },
    ]);

    // Stock levels summary
    const stockSummary = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$stock' },
          lowStock: {
            $sum: { $cond: [{ $lt: ['$stock', 10] }, 1, 0] },
          },
          inStock: {
            $sum: { $cond: [{ $gte: ['$stock', 10] }, 1, 0] },
          },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] },
          },
        },
      },
    ]);

    // Total categories count
    const totalCategories = await Category.countDocuments();

    return NextResponse.json(
      {
        success: true,
        data: {
          totalProducts,
          totalCategories,
          categoryStats,
          stockSummary: stockSummary[0] || {
            totalStock: 0,
            lowStock: 0,
            inStock: 0,
            outOfStock: 0,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

