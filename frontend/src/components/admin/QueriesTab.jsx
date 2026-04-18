import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, Filter, Mail, CheckCircle, Clock, Trash2, Reply, MoreHorizontal, User, Phone, Tag, Calendar } from 'lucide-react';
import api from '../../services/api';

export default function QueriesTab() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const data = await api.getQueries();
      setQueries(data);
    } catch (err) {
      console.error("Failed to fetch queries:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updateQuery(id, { status: newStatus });
      fetchQueries();
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently remove this inquiry?")) return;
    try {
      await api.deleteQuery(id);
      fetchQueries();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const filteredQueries = queries.filter(q => {
    const matchesSearch = (q.guestName?.toLowerCase().includes(search.toLowerCase())) || 
                         (q.message?.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === 'All' || q.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: 'Pending', value: queries.filter(q => q.status === 'Pending').length, icon: Clock, color: 'bg-orange-50 text-orange-600 border border-orange-100' },
    { label: 'Resolved', value: queries.filter(q => q.status === 'Resolved').length, icon: CheckCircle, color: 'bg-green-50 text-green-600 border border-green-100' },
    { label: 'Total Requests', value: queries.length, icon: Mail, color: 'bg-gray-100 dark:bg-[#1A1D1F] border border-gray-200 dark:border-[#272B30] text-gray-800 dark:text-white' },
  ];

  if (loading) return <div className="p-20 text-center opacity-40 animate-pulse">Loading Elite Concierge Data...</div>;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Search Header */}
      <div className="bg-white dark:bg-[#1A1D1F] rounded-[32px] p-8 border border-gray-100 dark:border-[#272B30] shadow-sm overflow-hidden relative">
         <div className="relative z-10">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 tracking-tight">Guest Support & Queries</h2>
            <p className="text-sm text-gray-500 font-medium mb-8">Direct requests from the Customer Dashboard.</p>
            
            <div className="flex flex-wrap gap-4">
               <div className="relative flex-1 min-w-[300px]">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or message content..."
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#272B30] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 dark:text-white border-none shadow-inner"
                  />
               </div>
               <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#272B30] rounded-2xl px-5 border-none shadow-inner">
                  <Filter size={18} className="text-gray-400" />
                  <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-transparent py-4 text-sm font-bold text-gray-600 dark:text-gray-300 focus:outline-none pr-4 min-w-[120px]">
                     <option value="All">All Tickets</option>
                     <option value="Pending">Pending</option>
                     <option value="Resolved">Resolved</option>
                  </select>
               </div>
            </div>
         </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {stats.map(s => {
           const Icon = s.icon;
           return (
             <div key={s.label} className={`${s.color} rounded-3xl p-6 transition-all hover:scale-[1.02]`}>
                <div className="flex items-center justify-between mb-4">
                   <div className="p-2 rounded-xl bg-white/50 dark:bg-black/20"><Icon size={20} /></div>
                </div>
                <h4 className="text-4xl font-black mb-1">{s.value}</h4>
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-70">{s.label}</p>
             </div>
           );
         })}
      </div>

      {/* Grid of Queries */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredQueries.map((q) => (
              <div key={q._id} className="bg-white dark:bg-[#1A1D1F] border border-gray-100 dark:border-[#272B30] rounded-[2.5rem] p-8 space-y-6 group hover:shadow-xl hover:shadow-primary-500/5 transition-all">
                  <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0 capitalize text-xl font-black">
                              {q.guestName?.charAt(0)}
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">{q.guestName}</h3>
                              <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                  <Phone size={10} /> {q.guestPhone}
                              </div>
                          </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${q.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                          {q.status}
                      </div>
                  </div>

                  <div className={`p-6 rounded-3xl text-sm font-medium leading-relaxed italic ${q.status === 'Pending' ? 'bg-gray-50 dark:bg-[#272B30] text-gray-600 dark:text-gray-300' : 'bg-green-50/30 text-green-700/80'}`}>
                      "{q.message}"
                  </div>

                  <div className="flex items-center justify-between pt-2">
                       <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-[#272B30] rounded-lg text-[10px] font-bold text-gray-500">
                                <Tag size={12} /> {q.inquiryType}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                <Calendar size={12} /> {new Date(q.createdAt).toLocaleDateString()}
                            </div>
                       </div>
                       <div className="flex gap-2">
                           {q.status === 'Pending' && (
                               <button 
                                onClick={() => handleUpdateStatus(q._id, 'Resolved')}
                                className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                                title="Mark Resolved"
                               >
                                <CheckCircle size={18} />
                               </button>
                           )}
                           <button 
                            onClick={() => handleDelete(q._id)}
                            className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            title="Delete"
                           >
                            <Trash2 size={18} />
                           </button>
                       </div>
                  </div>
              </div>
          ))}
      </div>

      {filteredQueries.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center opacity-20 italic">
              <Mail size={40} className="mb-4" />
              <h4 className="text-xl font-bold uppercase tracking-widest leading-none">Inbox Fully Cleared</h4>
          </div>
      )}
    </div>
  );
}
