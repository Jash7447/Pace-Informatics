import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import ExcelJS from 'exceljs';
import mongoose from 'mongoose';
import dns from "node:dns";

// GET /api/transactions/download
export async function GET(request: NextRequest) {
    try {
        // Configure dns servers to match lib/mongodb connection hacks
        dns.setServers(["8.8.8.8", "1.1.1.1"]);

        await connectDB();
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range'); // '1m', '3m', '6m', '1y', '5y', 'all'

        let query: any = {};
        if (range && range !== 'all') {
            const now = new Date();
            const cutoff = new Date();
            if (range === '1m') cutoff.setMonth(now.getMonth() - 1);
            else if (range === '3m') cutoff.setMonth(now.getMonth() - 3);
            else if (range === '6m') cutoff.setMonth(now.getMonth() - 6);
            else if (range === '1y') cutoff.setFullYear(now.getFullYear() - 1);
            else if (range === '5y') cutoff.setFullYear(now.getFullYear() - 5);

            query.createdAt = { $gte: cutoff };
        }

        const transactions = await Transaction.find(query).sort({ createdAt: -1 });

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Transactions');

        // Define columns
        worksheet.columns = [
            { header: 'Date', key: 'date', width: 25 },
            { header: 'Product Name', key: 'productName', width: 25 },
            { header: 'Brand', key: 'brand', width: 15 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Quantity', key: 'quantity', width: 10 },
            { header: 'Cost Price (INR)', key: 'costPrice', width: 18 },
            { header: 'Sell Price (INR)', key: 'sellPrice', width: 18 },
            { header: 'Profit (INR)', key: 'profit', width: 18 },
        ];

        // Add rows
        transactions.forEach((tx) => {
            worksheet.addRow({
                date: tx.createdAt ? tx.createdAt.toLocaleString() : '-',
                productName: tx.productName,
                brand: tx.brand,
                type: tx.type === 'sell' ? 'Sale' : 'Stock Addition',
                quantity: tx.quantity,
                costPrice: tx.costPrice,
                sellPrice: tx.type === 'sell' ? (tx.sellPrice !== undefined ? tx.sellPrice : '-') : '-',
                profit: tx.type === 'sell' ? (tx.profit !== undefined ? tx.profit : '-') : '-',
            });
        });

        // Formatting headers
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        const buffer = await workbook.xlsx.writeBuffer();

        return new Response(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="transaction-history-${range || 'all'}.xlsx"`,
            },
        });
    } catch (error: any) {
        console.error('Failed to export transitions:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate Excel report' },
            { status: 500 }
        );
    }
}
