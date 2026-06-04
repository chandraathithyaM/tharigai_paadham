"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice } from "@/lib/utils";

interface SalesChartProps {
  data: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}

export function SalesChart({ data }: SalesChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center border rounded-xl bg-card/50 text-muted-foreground text-xs">
        No sales data available for this period.
      </div>
    );
  }

  return (
    <div className="h-80 w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
          <XAxis
            dataKey="date"
            className="text-[10px] fill-muted-foreground font-semibold"
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            className="text-[10px] fill-muted-foreground font-semibold"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value}`}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              fontSize: "12px",
            }}
            formatter={(value: any, name: any) => [
              name === "revenue" ? formatPrice(value) : value,
              name === "revenue" ? "Revenue" : "Orders",
            ]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            name="revenue"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
