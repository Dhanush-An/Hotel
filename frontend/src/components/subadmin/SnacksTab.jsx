import React, { useState } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, Box, ChevronDown, Package, ShoppingCart, TrendingDown } from 'lucide-react';

const SNACKS = [];

export default function SnacksTab() {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  const stats = [
    { label: 'Total Items', value: SNACKS.length, color: 'bg-blue-50 text-blue-700' },
    { label: 'Low Stock', value: SNACKS.filter(s => s.stock < s.lowMark).length, color: 'bg-red-50 text-red-600' },
    { label: 'Total Value', value: '₹0', color: 'bg-green-50 text-green-700' },
  ];

  const filtered = SNACKS.filter(s => {
    const q = search.toLowerCase();
    const match = s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
    return match && (filterCat === 'All' || s.category === filterCat);
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-5 shadow-card text-center`}>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm font-medium mt-1 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1c1c24] rounded-2xl p-4 border border-border dark:border-[#2a2a35] shadow-card flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#a1a1aa]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search snacks..." className="pl-9 pr-4 py-2 border border-border dark:border-[#2a2a35] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 w-56" />
          </div>
          <div className="relative">
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="pl-3 pr-8 py-2 border border-border dark:border-[#2a2a35] rounded-xl text-sm focus:outline-none appearance-none bg-transparent">
              {['All','Chips','Beverages','Chocolate','Nuts','Namkeen'].map(o => <option key={o}>{o === 'All' ? 'All Categories' : o}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#a1a1aa] pointer-events-none" />
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 shadow-sm"><Plus size={15} /> Add Stock</button>
      </div>

      <div className="bg-white dark:bg-[#1c1c24] rounded-2xl shadow-card border border-border dark:border-[#2a2a35] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr>{['ID','Item Name','Category','Price','Stock','Status','Last Restock','Actions'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2a35] dark:bg-[#13131A] transition-colors">
                <td className="table-cell font-semibold text-gray-700 dark:text-[#e4e4e7]">{s.id}</td>
                <td className="table-cell font-medium text-gray-800 dark:text-white">{s.name}</td>
                <td className="table-cell text-gray-500 dark:text-[#a1a1aa]">{s.category}</td>
                <td className="table-cell font-semibold">₹{s.price}</td>
                <td className="table-cell">{s.stock} pcs</td>
                <td className="table-cell">
                  {s.stock < s.lowMark 
                    ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 flex items-center w-fit gap-1"><TrendingDown size={10} /> Low Stock</span>
                    : <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">In Stock</span>
                  }
                </td>
                <td className="table-cell text-gray-500 dark:text-[#a1a1aa]">{s.lastRestock}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-1.5">
                    <button className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-500"><Eye size={14} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/40 text-yellow-500"><Edit2 size={14} /></button>
                    <button className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-md hover:bg-primary-500 hover:text-white transition-colors">Refill</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
