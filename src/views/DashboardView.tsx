import React from 'react';
import { Users, CheckSquare, TrendingUp } from 'lucide-react';

export default function DashboardView() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">AI Intelligence Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border rounded-2xl shadow-sm">
          <Users className="text-red-600 mb-2" />
          <p className="text-sm text-gray-500 font-bold uppercase">Active Leads</p>
          <p className="text-3xl font-black">--</p>
        </div>
        <div className="p-6 bg-white border rounded-2xl shadow-sm">
          <CheckSquare className="text-red-600 mb-2" />
          <p className="text-sm text-gray-500 font-bold uppercase">Open Tasks</p>
          <p className="text-3xl font-black">--</p>
        </div>
        <div className="p-6 bg-white border rounded-2xl shadow-sm">
          <TrendingUp className="text-red-600 mb-2" />
          <p className="text-sm text-gray-500 font-bold uppercase">Weekly KPI</p>
          <p className="text-3xl font-black">--</p>
        </div>
      </div>
    </div>
  );
}
