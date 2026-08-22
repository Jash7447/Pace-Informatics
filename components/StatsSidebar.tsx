'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Archive, Layers } from 'lucide-react';

interface Stats {
  totalProducts: number;
  totalCategories: number;
  valuation: {
    totalStock: number;
    totalCost: number;
    totalRetail: number;
    potentialProfit: number;
    categoryValuation: Array<{
      categoryName: string;
      totalStock: number;
      valuationCost: number;
      valuationRetail: number;
    }>;
  };
  weeklyProfit: Array<{
    label: string;
    revenue: number;
    cost: number;
    profit: number;
  }>;
  recentSales: Array<{
    _id: string;
    productName: string;
    brand: string;
    quantity: number;
    costPrice: number;
    sellPrice: number;
    profit: number;
    createdAt: string;
  }>;
}

interface StatsSidebarProps {
  refreshTrigger?: number;
}

export default function StatsSidebar({ refreshTrigger }: StatsSidebarProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <aside className="w-80 border-l bg-white p-4 overflow-y-auto hidden lg:block">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Loading summary...</p>
            </CardContent>
          </Card>
        </div>
      </aside>
    );
  }

  const valuation = stats?.valuation || {
    totalStock: 0,
    totalCost: 0,
    totalRetail: 0,
    potentialProfit: 0,
    categoryValuation: [],
  };

  return (
    <aside className="w-80 border-l bg-white p-4 overflow-y-auto hidden lg:flex flex-col space-y-4">
      {/* Overview Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Inventory Valuation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-xs text-muted-foreground">Total Stock Valuation (Cost)</span>
            <p className="text-2xl font-extrabold text-slate-800">
              ₹{(valuation.totalCost ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
            <div>
              <span className="text-muted-foreground">Retail Value</span>
              <p className="font-bold text-slate-700">
                ₹{(valuation.totalRetail ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Potential Profit</span>
              <p className="font-bold text-green-600">
                ₹{(valuation.potentialProfit ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Valuation Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Valuation by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 max-h-56 overflow-y-auto">
          {valuation.categoryValuation.length === 0 ? (
            <p className="text-xs text-muted-foreground p-4 text-center">No categories to evaluate.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground select-none">
                  <th className="p-2 font-medium">Category</th>
                  <th className="p-2 text-right font-medium">Stock</th>
                  <th className="p-2 text-right font-medium">Cost Val</th>
                </tr>
              </thead>
              <tbody>
                {valuation.categoryValuation.map((cat, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-2 font-medium truncate max-w-[100px]" title={cat.categoryName}>
                      {cat.categoryName}
                    </td>
                    <td className="p-2 text-right">{cat.totalStock}</td>
                    <td className="p-2 text-right font-semibold">
                      ₹{cat.valuationCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Weekly Profit (WoW) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Profit Week-on-Week
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!stats?.weeklyProfit || stats.weeklyProfit.length === 0 ? (
            <p className="text-xs text-muted-foreground p-4 text-center">No transactions recorded inside past 8 weeks.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="p-2 font-medium">Week Range</th>
                  <th className="p-2 text-right font-medium">Revenue</th>
                  <th className="p-2 text-right font-medium">Profit</th>
                </tr>
              </thead>
              <tbody>
                {stats.weeklyProfit.map((w, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-2 text-slate-600 font-medium">{w.label}</td>
                    <td className="p-2 text-right">₹{w.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="p-2 text-right font-bold text-green-600">
                      ₹{w.profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Recent Sales Activity */}
      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="pb-2 shrink-0">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Sales
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-y-auto">
          {!stats?.recentSales || stats.recentSales.length === 0 ? (
            <p className="text-xs text-muted-foreground p-4 text-center">No recent sales transactions recorded.</p>
          ) : (
            <div className="divide-y text-xs">
              {stats.recentSales.map((tx) => (
                <div key={tx._id} className="p-2.5 hover:bg-muted/30 transition-colors flex justify-between items-start gap-2">
                  <div className="truncate flex-1">
                    <p className="font-semibold text-slate-800 truncate" title={tx.productName}>
                      {tx.productName}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {tx.brand} · Qty: {tx.quantity} · Price: ₹{tx.sellPrice}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-green-600">
                      +₹{tx.profit?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
