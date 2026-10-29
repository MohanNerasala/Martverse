'use client';

import React, { useState } from 'react';
import { MOCK_PRODUCTS, MOCK_FLOORS } from '@/lib/mockData';
import {
  Package,
  Layers,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Search,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'placements'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = MOCK_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-400 bg-slate-800 px-3 py-1.5 rounded-xl transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to 3D Store
          </Link>
          <div className="h-5 w-px bg-slate-800" />
          <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
              M
            </span>
            Martverse Supermarket Operations Center
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400 font-medium">3D Store Layout & Sync: Active</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Revenue Today</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white mt-2">₹1,84,350</div>
            <div className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +18.4% vs last week
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Completed 3D Orders</span>
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white mt-2">412 Orders</div>
            <div className="text-[11px] text-slate-400 mt-1">Average trolley size: 4.8 items</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Active Products on Shelves</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white mt-2">66 Products</div>
            <div className="text-[11px] text-slate-400 mt-1">Across 10 Supermarket Aisles</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Store Floors & Capacity</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white mt-2">2 Floors</div>
            <div className="text-[11px] text-purple-300 mt-1">Grocery (F1) + Fashion (F2)</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Inventory & Products
            </button>
            <button
              onClick={() => setActiveTab('placements')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'placements'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              3D Shelf Placements
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Live Orders
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search products, brands, aisles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>
        </div>

        {/* Tab Content: Inventory Table */}
        {activeTab === 'inventory' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price / MRP</th>
                    <th className="py-3 px-4">Aisle & Shelf</th>
                    <th className="py-3 px-4">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-800"
                        />
                        <div>
                          <div className="font-bold text-white">{p.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {p.brand} • {p.unit}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          {p.category.name}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-emerald-400">
                          ₹{p.price.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-500 line-through">
                          ₹{p.mrp.toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {p.placement ? (
                          <div>
                            <span className="font-bold text-white">
                              Floor {p.placement.floorNumber} • Aisle {p.placement.aisleNumber}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              Shelf Tier {p.placement.shelfTier} ({p.placement.shelfSide} side)
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Not placed</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          {p.stockQuantity} in stock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Placements Visualizer */}
        {activeTab === 'placements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_FLOORS.map((floor) => (
              <div
                key={floor.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="font-black text-white text-sm">{floor.name}</h3>
                    <p className="text-xs text-slate-400">{floor.description}</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    Floor #{floor.floorNumber}
                  </span>
                </div>

                <div className="space-y-3">
                  {floor.aisles.map((aisle) => (
                    <div
                      key={aisle.id}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: aisle.colorCode }}
                          />
                          Aisle {aisle.aisleNumber}: {aisle.name}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Category: {aisle.categoryName} • 3 Shelf Tiers
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-1 rounded">
                        x: {aisle.startX}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Recent Orders */}
        {activeTab === 'orders' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-sm">POS Billing Terminal Stream</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Real-time POS checkout transactions processed via Razorpay & Test Payment mode. All orders are atomically validated with backend inventory.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
