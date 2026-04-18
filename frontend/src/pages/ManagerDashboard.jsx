
import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import RoomManagement from '../components/admin/RoomManagement';
import AvailableRooms from '../components/admin/AvailableRooms';
import ExpensesTab from '../components/admin/ExpensesTab';
import PaymentTab from '../components/admin/PaymentTab';
import TechnicalTab from '../components/admin/TechnicalTab';
import ShiftAllocation from '../components/manager/ShiftAllocation';
import RoomHistory from '../components/manager/RoomHistory';
import PersonalSettings from '../components/common/PersonalSettings';

import { 
  LayoutDashboard, BedDouble, Users, CalendarCheck, 
  DoorOpen, Receipt, CreditCard, Wrench, 
  History, Settings, ClipboardList
} from 'lucide-react';

const ManagerTabs = [
  { id: 'available', label: 'Room Information', icon: DoorOpen },
  { id: 'shifts', label: 'Shift Allocation', icon: Users },
  { id: 'invoices', label: 'Recent Invoice', icon: CreditCard },
  { id: 'technical', label: 'Technical Issue', icon: Wrench },
  { id: 'history', label: 'History of Rooms', icon: History },
  { id: 'rooms', label: 'Room Management', icon: BedDouble },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'settings', label: 'My Settings', icon: Settings },
];

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('available');
  const [historySearch, setHistorySearch] = useState('');

  const handleRoomHistory = (roomNo) => {
    setHistorySearch(roomNo);
    setActiveTab('history');
  };

  const contentMap = {
    available: <AvailableRooms onHistory={handleRoomHistory} />,
    shifts: <ShiftAllocation />,
    invoices: <PaymentTab />,
    technical: <TechnicalTab />,
    history: <RoomHistory initialSearch={historySearch} />,
    rooms: <RoomManagement />,
    expenses: <ExpensesTab />,
    settings: <PersonalSettings />,
  };

  return (
    <DashboardLayout
      role="manager"
      title={ManagerTabs.find(t => t.id === activeTab)?.label || 'Manager Portal'}
      menuItems={ManagerTabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <div className="animate-in fade-in duration-500">
        {contentMap[activeTab]}
      </div>
    </DashboardLayout>
  );
}
