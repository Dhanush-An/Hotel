import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import RoomManagement from '../components/admin/RoomManagement';
import ExpensesTab from '../components/admin/ExpensesTab';
import RevenueTab from '../components/admin/RevenueTab';
import { BedDouble, Receipt, TrendingUp } from 'lucide-react';


const SubAdminTabs = [
  { id: 'rooms', label: 'Room Information', icon: BedDouble },
  { id: 'revenue', label: 'Revenue', icon: TrendingUp },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
];


const SubAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('rooms');

  const contentMap = {
    rooms: <RoomManagement />,
    revenue: <RevenueTab />,
    expenses: <ExpensesTab />,
  };


  return (
    <DashboardLayout 
      role="subadmin" 
      title={SubAdminTabs.find(t => t.id === activeTab)?.label || 'Sub-Admin Portal'}
      menuItems={SubAdminTabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {contentMap[activeTab]}
    </DashboardLayout>
  );
};

export default SubAdminDashboard;
