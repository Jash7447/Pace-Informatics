import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Transaction from '@/models/Transaction';

// GET statistics
export async function GET() {
  try {
    await connectDB();

    // Total products and categories count
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();

    // 1. Inventory Valuation Overall (Total cost, total retail value, potential profit)
    const valuationSummaryArray = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$stock' },
          totalCost: { $sum: { $multiply: [{ $ifNull: ['$costPrice', 0] }, '$stock'] } },
          totalRetail: {
            $sum: {
              $multiply: [
                { $ifNull: ['$sellPrice', { $ifNull: ['$costPrice', 0] }] },
                '$stock',
              ],
            },
          },
        },
      },
    ]);

    const valuationSummary = valuationSummaryArray[0] || {
      totalStock: 0,
      totalCost: 0,
      totalRetail: 0,
    };

    // Category breakdown for inventory valuation
    const categoryValuation = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalStock: { $sum: '$stock' },
          valuationCost: { $sum: { $multiply: [{ $ifNull: ['$costPrice', 0] }, '$stock'] } },
          valuationRetail: {
            $sum: {
              $multiply: [
                { $ifNull: ['$sellPrice', { $ifNull: ['$costPrice', 0] }] },
                '$stock',
              ],
            },
          },
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
      { $unwind: '$categoryInfo' },
      {
        $project: {
          categoryName: '$categoryInfo.name',
          totalStock: 1,
          valuationCost: 1,
          valuationRetail: 1,
        },
      },
      { $sort: { categoryName: 1 } },
    ]);

    // 2. Weekly Profit (Week-on-Week profit over last 8 weeks)
    const startOfPeriod = new Date();
    startOfPeriod.setDate(startOfPeriod.getDate() - 8 * 7); // ~8 weeks ago

    const weeklyStatsRaw = await Transaction.aggregate([
      {
        $match: {
          type: 'sell',
          createdAt: { $gte: startOfPeriod },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' },
          },
          revenue: { $sum: { $multiply: [{ $ifNull: ['$sellPrice', 0] }, '$quantity'] } },
          cost: { $sum: { $multiply: [{ $ifNull: ['$costPrice', 0] }, '$quantity'] } },
          profit: { $sum: { $ifNull: ['$profit', 0] } },
          startDate: { $min: '$createdAt' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.week': 1 },
      },
    ]);

    // Format weekly stats for simpler frontend rendering
    const weeklyProfit = weeklyStatsRaw.map((w) => {
      const date = new Date(w.startDate);
      const label = `Week ${w._id.week} (${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })})`;
      return {
        label,
        revenue: w.revenue,
        cost: w.cost,
        profit: w.profit,
      };
    });

    // 3. Recent Sales / Profits Table
    const recentSales = await Transaction.find({ type: 'sell' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('productName brand quantity costPrice sellPrice profit createdAt');

    return NextResponse.json(
      {
        success: true,
        data: {
          totalProducts,
          totalCategories,
          valuation: {
            totalStock: valuationSummary.totalStock,
            totalCost: valuationSummary.totalCost,
            totalRetail: valuationSummary.totalRetail,
            potentialProfit: Math.max(0, valuationSummary.totalRetail - valuationSummary.totalCost),
            categoryValuation,
          },
          weeklyProfit,
          recentSales,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Stats aggregation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
