import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, LayoutGrid, List, X, ChevronDown, Tag, Calendar, User, AlertCircle, Check, Trash2, Edit2 } from 'lucide-react';

const STAFF_LIST = ['Admin', 'Receptionist', 'Housekeeping', 'Room Boy', 'Manager'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const PRIORITY_COLOR = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Urgent: 'bg-red-100 text-red-700',
};

const AddTaskModal = ({ onClose, onSaved }) => {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', assignee: '',
    priority: 'Medium', dueDate: '', column: 'To Do'
  });

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const data = await api.getStaff();
        setStaff(data);
        if (data.length > 0) setForm(p => ({ ...p, assignee: data[0].name }));
      } catch (e) {
        console.error(e);
      }
    };
    loadStaff();
  }, []);

  const handleSave = () => {
    if (!form.title.trim()) { alert('Task title is required'); return; }
    if (!form.assignee) { alert('Please assign to a staff member'); return; }
    
    // Map to Backend Model: staffName, deadline, notes
    onSaved({
      id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
      staffName: form.assignee,
      title: form.title.trim(),
      notes: form.description.trim(),
      priority: form.priority,
      status: form.column,
      deadline: form.dueDate,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1c24] w-full max-w-md rounded-2xl shadow-premium overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border dark:border-[#2a2a35]">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Create New Task</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2a2a35] text-gray-500"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Task Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="e.g. Clean Room 302" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
              placeholder="Details..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Assign To</label>
              <select value={form.assignee} onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))}
                className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                {staff.map(s => <option key={s._id} value={s.name}>{s.name} ({s.role})</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                {PRIORITIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Column</label>
              <select value={form.column} onChange={e => setForm(p => ({ ...p, column: e.target.value }))}
                className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                {['To Do', 'In Progress', 'For Review', 'Completed'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border dark:border-[#2a2a35] flex justify-end gap-3 bg-gray-50/50 dark:bg-[#13131a]/30">
          <button onClick={onClose} className="px-5 py-2.5 border border-border rounded-xl text-sm text-gray-500 hover:bg-gray-100">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 shadow-lg active:scale-95">Create Task</button>
        </div>
      </div>
    </div>
  );
};

const COLUMNS = ['To Do', 'In Progress', 'For Review', 'Completed'];

import api from '../../services/api';

export default function TaskTab() {
  const [view, setView] = useState('kanban');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks();
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSaveTask = async (task) => {
    try {
      // Find staff dept from staff list
      const staffList = await api.getStaff();
      const staff = staffList.find(s => s.name === task.staffName);
      const dept = staff ? staff.dept : 'Operations';

      const created = await api.createTask({ ...task, dept }); 
      setTasks(prev => [created, ...prev]);
      setShowModal(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        const task = tasks.find(t => t.id === id || t._id === id);
        await api.deleteTask(task._id);
        setTasks(prev => prev.filter(t => t._id !== task._id));
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleMoveTask = async (id, newCol) => {
    try {
      const task = tasks.find(t => t.id === id || t._id === id);
      const updated = await api.updateTask(task._id, { status: newCol });
      setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.assignee || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Total Tasks', value: tasks.length, color: 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, color: 'bg-white dark:bg-[#1A1D1F] border border-gray-100 dark:border-[#272B30] text-gray-800 dark:text-white' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: 'bg-white dark:bg-[#1A1D1F] border border-gray-100 dark:border-[#272B30] text-gray-800 dark:text-white' },
    { label: 'High Priority', value: tasks.filter(t => t.priority === 'High' || t.priority === 'Urgent').length, color: 'bg-white dark:bg-[#1A1D1F] border border-gray-100 dark:border-[#272B30] text-gray-800 dark:text-white' },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      {showModal && <AddTaskModal onClose={() => setShowModal(false)} onSaved={handleSaveTask} />}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1A1D1F] dark:text-white">Staff Task Management</h1>
          <p className="text-[11px] font-bold text-gray-400 dark:text-[#a1a1aa] uppercase tracking-widest mt-1">Assign and track operational workflows</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#DCEB8C] text-[#1A1D1F] px-6 py-3 rounded-2xl text-sm font-bold shadow-sm hover:translate-y-[-2px] transition-all active:scale-95">
          <Plus size={18} /> Create New Task
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-5 shadow-sm`}>
            <p className={`text-[12px] font-bold uppercase tracking-widest opacity-70`}>{s.label}</p>
            <h3 className="text-4xl font-bold mt-2">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1c1c24] rounded-[24px] p-4 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35] flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks or staff..."
            className="pl-11 pr-4 py-3 bg-[#F7F9FB] dark:bg-[#13131A] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DCEB8C] w-full shadow-inner" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('kanban')} className={`p-3 rounded-xl transition-all ${view === 'kanban' ? 'bg-[#DCEB8C] text-[#1A1D1F]' : 'text-gray-400 hover:bg-[#F4F4F4]'}`}><LayoutGrid size={20} /></button>
          <button onClick={() => setView('list')} className={`p-3 rounded-xl transition-all ${view === 'list' ? 'bg-[#DCEB8C] text-[#1A1D1F]' : 'text-gray-400 hover:bg-[#F4F4F4]'}`}><List size={20} /></button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[500px]">
          {COLUMNS.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col);
            return (
              <div key={col} className="bg-gray-50/50 dark:bg-[#13131A]/30 rounded-[32px] p-5 border-2 border-dashed border-gray-100 dark:border-[#272B30] transition-all hover:border-[#DCEB8C]/50">
                <div className="flex items-center justify-between mb-6 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50" />
                    <h4 className="text-[13px] font-bold text-gray-800 dark:text-white uppercase tracking-widest">{col}</h4>
                    <span className="text-[10px] bg-gray-200 dark:bg-[#2a2a35] px-2 py-0.5 rounded-full font-bold text-gray-600 dark:text-gray-400">{colTasks.length}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {colTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 mt-4 bg-white/40 dark:bg-[#1c1c24]/20 rounded-2xl">
                      <Plus size={24} className="text-gray-200 dark:text-[#272B30] mb-2" />
                      <p className="text-[11px] font-bold text-gray-400/80 uppercase tracking-widest">No Tasks</p>
                    </div>
                  ) : colTasks.map(task => (
                    <div key={task._id} className="bg-white dark:bg-[#1c1c24] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-[#2a2a35] hover:border-primary-200 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
                        <button onClick={() => handleDeleteTask(task._id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-red-400 rounded-lg transition-all"><Trash2 size={12} /></button>
                      </div>
                      <p className="font-bold text-gray-800 dark:text-white text-sm mb-1">{task.title}</p>
                      {task.notes && <p className="text-[11px] text-gray-400 mb-3 line-clamp-2">{task.notes}</p>}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><User size={10}/>{task.staffName}</span>
                        {task.deadline && <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Calendar size={10}/>{task.deadline}</span>}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-1">
                        {col !== 'Completed' && <button onClick={() => handleMoveTask(task._id, 'Completed')} className="text-[9px] font-black bg-green-50 text-green-700 py-1.5 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-1"><Check size={9}/>Done</button>}
                        {col !== 'In Progress' && col !== 'Completed' && <button onClick={() => handleMoveTask(task._id, 'In Progress')} className="text-[9px] font-black bg-blue-50 text-blue-700 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Move →</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1c1c24] rounded-2xl shadow-sm border border-border dark:border-[#2a2a35] overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 dark:bg-[#13131A]">
              {['ID','Title','Staff','Priority','Status','Due Date','Actions'].map(h => <th key={h} className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a35]">
              {filteredTasks.map(t => (
                <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-[#2a2a35] transition-colors">
                  <td className="px-5 py-4 text-xs font-bold text-primary-600">{(t.id || t._id).toString().slice(-6)}</td>
                  <td className="px-5 py-4 font-bold text-gray-800 dark:text-white">{t.title}</td>
                  <td className="px-5 py-4 text-gray-500">{t.staffName}</td>
                  <td className="px-5 py-4"><span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span></td>
                  <td className="px-5 py-4 text-gray-500">{t.status}</td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{t.deadline || '—'}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleDeleteTask(t._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && <tr><td colSpan={7} className="px-6 py-16 text-center text-gray-400 font-bold uppercase tracking-widest">No Tasks Found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
