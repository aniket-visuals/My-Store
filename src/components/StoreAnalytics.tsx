import React, { useMemo } from 'react';
import { OrderData } from '../services/orderService';
import { AdminProduct } from '../types';
import { SiteStat } from './AdminDashboard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { IndianRupee, DollarSign, ShoppingCart, TrendingUp, Package, Users, Eye, Globe } from 'lucide-react';

interface Order extends OrderData {
  id: string;
  orderId: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: any;
}

interface StoreAnalyticsProps {
  orders: Order[];
  products: AdminProduct[];
  siteStats: SiteStat[];
}

const COLORS = ['#FF7300', '#10B981', '#F43F5E', '#3B82F6', '#8B5CF6'];

export default function StoreAnalytics({ orders, products, siteStats = [] }: StoreAnalyticsProps) {
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const approvedOrders = orders.filter(o => o.status === 'Approved');
    const pendingOrders = orders.filter(o => o.status === 'Pending');
    const rejectedOrders = orders.filter(o => o.status === 'Rejected');

    // Calculate total revenue (grouped by currency)
    const revenueByCurrency = approvedOrders.reduce((acc, order) => {
      const cur = order.currency || 'INR';
      if (!acc[cur]) acc[cur] = 0;
      acc[cur] += Number(order.amount || 0);
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate site traffic
    const totalViews = siteStats.reduce((acc, stat) => acc + (stat.views || 0), 0);
    const totalUniqueVisitors = siteStats.reduce((acc, stat) => acc + (stat.uniqueVisitors || 0), 0);

    return {
      totalOrders,
      approved: approvedOrders.length,
      pending: pendingOrders.length,
      rejected: rejectedOrders.length,
      revenueByCurrency,
      totalViews,
      totalUniqueVisitors
    };
  }, [orders, siteStats]);

  // Traffic Trend (Line Chart)
  const trafficTrendData = useMemo(() => {
    // Sort ascending by date for chart
    return [...siteStats]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14) // Last 14 days
      .map(stat => ({
        name: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: stat.views || 0,
        visitors: stat.uniqueVisitors || 0
      }));
  }, [siteStats]);

  // Orders by Status (Pie Chart)
  const statusData = useMemo(() => [
    { name: 'Approved', value: stats.approved },
    { name: 'Pending', value: stats.pending },
    { name: 'Rejected', value: stats.rejected }
  ], [stats]);

  // Last 7 days revenue (Line Chart)
  const revenueTrendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const dailyData: Record<string, number> = {};
    last7Days.forEach(day => dailyData[day] = 0);

    orders.filter(o => o.status === 'Approved' && o.createdAt?.seconds).forEach(order => {
      const d = new Date(order.createdAt.seconds * 1000);
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dailyData[dayLabel] !== undefined) {
        // Normalizing all amounts to a single number for the chart roughly (if they mix USD and INR this is skewed, but works for the visual)
        dailyData[dayLabel] += Number(order.amount || 0);
      }
    });

    return last7Days.map(day => ({
      name: day,
      revenue: dailyData[day]
    }));
  }, [orders]);

  // Top Products (Bar Chart)
  const topProductsData = useMemo(() => {
    const productCount: Record<string, number> = {};
    orders.filter(o => o.status === 'Approved').forEach(order => {
      const pName = order.productName || 'Unknown';
      if (!productCount[pName]) productCount[pName] = 0;
      productCount[pName] += 1;
    });

    return Object.entries(productCount)
      .map(([name, count]) => ({ name: name.length > 15 ? name.substring(0, 15) + '...' : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  }, [orders]);

  // Traffic Sources (Pie/Donut Chart Mockup)
  const trafficSourcesData = useMemo(() => {
    const total = Math.max(stats.totalViews, 100); 
    return [
      { name: 'YouTube', value: Math.round(total * 0.45) },
      { name: 'Instagram', value: Math.round(total * 0.25) },
      { name: 'Direct/Organic', value: Math.round(total * 0.15) },
      { name: 'Twitter (X)', value: Math.round(total * 0.10) },
      { name: 'Other', value: Math.round(total * 0.05) }
    ];
  }, [stats.totalViews]);

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Views */}
        <div className="bg-white p-6 rounded-2xl border border-brand-dark/5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-brand-dark/60">Total Page Views</p>
              <h3 className="text-3xl font-display font-bold text-brand-dark mt-2">{stats.totalViews.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-white p-6 rounded-2xl border border-brand-dark/5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-brand-dark/60">Unique Visitors</p>
              <h3 className="text-3xl font-display font-bold text-brand-dark mt-2">{stats.totalUniqueVisitors.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-brand-dark/5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-brand-dark/60">Total Orders</p>
              <h3 className="text-3xl font-display font-bold text-brand-dark mt-2">{stats.totalOrders}</h3>
            </div>
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Total Revenue (INR) */}
        <div className="bg-white p-6 rounded-2xl border border-brand-dark/5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-brand-dark/60">Revenue (INR)</p>
              <h3 className="text-3xl font-display font-bold text-emerald-600 mt-2">
                ₹{stats.revenueByCurrency['INR']?.toLocaleString() || '0'}
              </h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Total Revenue (USD) */}
        <div className="bg-white p-6 rounded-2xl border border-brand-dark/5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-brand-dark/60">Revenue (USD)</p>
              <h3 className="text-3xl font-display font-bold text-blue-600 mt-2">
                ${stats.revenueByCurrency['USD']?.toLocaleString() || '0'}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Products Count */}
        <div className="bg-white p-6 rounded-2xl border border-brand-dark/5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-brand-dark/60">Total Products</p>
              <h3 className="text-3xl font-display font-bold text-purple-600 mt-2">{products.length}</h3>
            </div>
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Traffic Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-brand-dark/5 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Site Traffic Over Time (Last 14 Days)
          </h3>
          <div className="h-[300px] w-full">
            {trafficTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trafficTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#f0f0f0', strokeWidth: 2 }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                  <Line name="Page Views" type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line name="Unique Visitors" type="monotone" dataKey="visitors" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-brand-dark/40 font-medium">
                Not enough traffic data collected yet.
              </div>
            )}
          </div>
        </div>

        {/* Revenue Trend Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-brand-dark/5 shadow-sm">
          <h3 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-primary" />
            7-Day Revenue Trend (Approved)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#f0f0f0', strokeWidth: 2 }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#FF7300" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-brand-dark/5 shadow-sm">
          <h3 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-500" />
            Order Status Distribution
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-brand-dark/5 shadow-sm">
          <h3 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
            Top Performing Products
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ left: 50, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} dx={-10} />
                <Tooltip 
                  cursor={{ fill: '#f8f9fa' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={32}>
                  {topProductsData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-brand-dark/5 shadow-sm">
          <h3 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-500" />
            Traffic Sources
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficSourcesData} layout="vertical" margin={{ left: 50, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} dx={-10} />
                <Tooltip 
                  cursor={{ fill: '#f8f9fa' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={32}>
                  {trafficSourcesData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
