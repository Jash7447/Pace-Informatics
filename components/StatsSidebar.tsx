'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Stats {
  totalProducts: number;
  totalCategories: number;
  categoryStats: Array<{
    categoryName: string;
    count: number;
    totalStock: number;
  }>;
  stockSummary: {
    totalStock: number;
    lowStock: number;
    inStock: number;
    outOfStock: number;
  };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

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
    // Optionally keep a longer interval as fallback (e.g., 5 minutes)
    // const interval = setInterval(fetchStats, 300000);
    // return () => clearInterval(interval);
  }, [refreshTrigger]);

  const pieData = stats?.stockSummary
    ? [
        { name: 'In Stock (≥10)', value: stats.stockSummary.inStock },
        { name: 'Low Stock (<10)', value: stats.stockSummary.lowStock },
        { name: 'Out of Stock', value: stats.stockSummary.outOfStock },
      ].filter((item) => item.value > 0)
    : [];

  if (loading) {
    return (
      <aside className="w-80 border-l bg-white p-4 overflow-y-auto">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 border-l bg-white p-4 overflow-y-auto">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold">{stats?.totalCategories || 0}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Stock</p>
              <p className="text-2xl font-bold">{stats?.stockSummary.totalStock || 0}</p>
            </div>
          </CardContent>
        </Card>

        {stats && stats.categoryStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Products by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.categoryStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="categoryName"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {pieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Stock Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Stock Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">In Stock (≥10):</span>
                <span className="font-semibold">{stats.stockSummary.inStock}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Low Stock (&lt;10):</span>
                <span className="font-semibold">{stats.stockSummary.lowStock}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Out of Stock:</span>
                <span className="font-semibold">{stats.stockSummary.outOfStock}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </aside>
  );
}

