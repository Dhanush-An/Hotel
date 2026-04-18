import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Calendar, UserCheck, MessageSquare, List, LayoutGrid, MoreHorizontal, Mail, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

const CustomerTab = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await api.getCustomers();
        const list = data.map(c => ({
          ...c,
          status: c.totalStays > 1 ? 'Regular Guest' : 'New Guest'
        }));
        setCustomers(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);


  const filtered = customers.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone || '').includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-fade-in text-black dark:text-white">
      {/* Search & Stats Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-[#1A1D1F] p-5 rounded-[2.5rem] border border-gray-200 dark:border-[#272B30] shadow-sm">
        <div className="flex items-center gap-6">
            <div className="px-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Users size={16} className="text-primary-500" />
                    Customer Database
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 font-medium tracking-tight italic">Total registered: {customers.length}</p>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-[#272B30] p-1 rounded-2xl shadow-inner">
                <button 
                    onClick={() => setView('grid')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'grid' ? 'bg-white dark:bg-[#1A1D1F] text-primary-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <LayoutGrid size={14} /> Grid
                </button>
                <button 
                    onClick={() => setView('table')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'table' ? 'bg-white dark:bg-[#1A1D1F] text-primary-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <List size={14} /> Table
                </button>
            </div>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#272B30] border border-gray-200 dark:border-transparent rounded-2xl py-3 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all font-medium"
          />
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.length > 0 ? (
            filtered.map((customer, idx) => (
              <div key={idx} className="bg-white dark:bg-[#1A1D1F] border border-gray-200 dark:border-[#272B30] p-6 rounded-[2.5rem] hover:border-primary-500/30 transition-all group shadow-sm hover:shadow-md relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-500/5 rounded-full group-hover:scale-150 transition-transform duration-500" />

                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-12 h-12 bg-primary-50 dark:bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-600 font-black text-lg">
                    {customer.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight truncate max-w-[120px]">{customer.name}</h3>
                    <span className={`text-[9px] font-black py-0.5 px-2 rounded-full uppercase tracking-tighter border ${customer.status === 'Regular Guest' ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20' : 'bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 border-primary-200 dark:border-primary-500/20'}`}>
                      {customer.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6 relative z-10">
                  <div className="flex items-center gap-2.5 text-gray-500 dark:text-gray-400 text-[11px] font-bold uppercase tracking-wider leading-none">
                    <Phone size={14} className="text-primary-500/40" />
                    +91 {customer.phone}
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-500 dark:text-gray-400 text-[11px] font-bold uppercase tracking-wider leading-none">
                    <Calendar size={14} className="text-primary-500/40" />
                    Last Visit: {customer.lastVisit || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2.5 text-primary-600 dark:text-primary-400 text-[11px] font-black uppercase tracking-wider leading-none">
                    <UserCheck size={14} className="text-primary-500/40" />
                    Stays: {customer.totalStays}
                  </div>
                </div>


              </div>
            ))
          ) : <EmptyState /> }
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1A1D1F] rounded-[2.5rem] shadow-sm border border-gray-200 dark:border-[#272B30] overflow-hidden">
             <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                     <thead className="bg-gray-50/50 dark:bg-[#13131a]/50 border-b border-gray-100 dark:border-[#272B30]">
                         <tr>
                             {['Customer', 'Mobile Status', 'Join Date', 'Auth Type', 'Actions'].map(h => (
                                 <th key={h} className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                             ))}
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100 dark:divide-[#272B30]">
                         {filtered.length > 0 ? (
                           filtered.map((customer, idx) => (
                             <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-[#13131a]/30 transition-all group">
                                 <td className="px-8 py-5 whitespace-nowrap">
                                     <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 font-black text-sm">
                                             {customer.name[0]?.toUpperCase()}
                                         </div>
                                         <div className="flex flex-col">
                                             <span className="text-sm font-bold text-gray-900 dark:text-white capitalize leading-tight">{customer.name}</span>
                                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">ID: #{customer.phone?.slice(-4)}</span>
                                         </div>
                                     </div>
                                 </td>
                                 <td className="px-8 py-5 whitespace-nowrap">
                                     <div className="flex items-center gap-2">
                                         <span className="text-xs font-bold text-gray-700 dark:text-gray-300">+91 {customer.phone}</span>
                                         <ShieldCheck size={14} className="text-green-500" />
                                     </div>
                                 </td>
                                 <td className="px-8 py-5 whitespace-nowrap text-xs font-bold text-gray-500 dark:text-gray-400">
                                     {new Date(customer.joinedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                 </td>
                                 <td className="px-8 py-5 whitespace-nowrap">
                                     <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${customer.status === 'Regular Guest' ? 'bg-orange-500/10 text-orange-500 border-orange-500/10' : 'bg-primary-500/10 text-primary-500 border-primary-500/10'}`}>
                                         {customer.status} ({customer.totalStays} stays)
                                     </span>
                                 </td>
                                 <td className="px-8 py-5 whitespace-nowrap">
                                     <div className="flex items-center gap-3">
                                         <button className="p-2.5 rounded-xl bg-gray-100 dark:bg-[#272B30] text-gray-500 hover:text-primary-500 transition-colors"><MoreHorizontal size={18} /></button>
                                         <button className="p-2.5 rounded-xl bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all"><Mail size={16} /></button>
                                     </div>
                                 </td>
                             </tr>
                           ))
                         ) : <tr><td colSpan={5}><EmptyState /></td></tr> }
                     </tbody>
                 </table>
             </div>
        </div>
      )}
    </div>
  );
};

const EmptyState = () => (
    <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white dark:bg-[#1A1D1F] rounded-[3rem] border border-dashed border-gray-200 dark:border-[#272B30]">
        <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Users size={32} className="text-gray-300 dark:text-gray-600" />
        </div>
        <h4 className="text-lg font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">Data Not Found</h4>
        <p className="text-xs text-gray-400 mt-2 italic font-medium tracking-tight">Try searching with a different name or phone number</p>
    </div>
);

export default CustomerTab;
