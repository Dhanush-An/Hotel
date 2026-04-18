import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Overview from '../components/Overview';
import RoomManagement from '../components/admin/RoomManagement';
import StaffManagement from '../components/admin/StaffManagement';
import BookingManagement from '../components/admin/BookingManagement';
import AvailableRooms from '../components/admin/AvailableRooms';
import ExpensesTab from '../components/admin/ExpensesTab';
import PaymentTab from '../components/admin/PaymentTab';
import RevenueTab from '../components/admin/RevenueTab';
import SalaryManagement from '../components/admin/SalaryManagement';
import SettingsTab from '../components/admin/SettingsTab';
import AttendanceTab from '../components/admin/AttendanceTab';
import TaskTab from '../components/admin/TaskTab';
import QueriesTab from '../components/admin/QueriesTab';
import CustomerTab from '../components/admin/CustomerTab';
import TechnicalTab from '../components/admin/TechnicalTab';
import CredentialTab from '../components/admin/CredentialTab';
import PersonalSettings from '../components/common/PersonalSettings';
import { 
  LayoutDashboard, BedDouble, Users, CalendarCheck, 
  DoorOpen, Receipt, CreditCard, TrendingUp, 
  Banknote, Settings, UserCheck, CheckSquare, MessageCircle, Wrench, ListPlus, Key
} from 'lucide-react';

const AdminTabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'rooms', label: 'Room Management', icon: BedDouble },
  { id: 'staff', label: 'Staff Management', icon: Users },
  { id: 'bookings', label: 'Booking Management', icon: CalendarCheck },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'revenue', label: 'Revenue', icon: TrendingUp },
  { id: 'salary', label: 'Salary Management', icon: Banknote },
  { id: 'attendance', label: 'Attendance', icon: UserCheck },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'technical', label: 'Technical Issues', icon: Wrench },
  { id: 'queries', label: 'Queries', icon: MessageCircle },
  { id: 'credentials', label: 'Staff Credentials', icon: Key },
  { id: 'settings', label: 'My Settings', icon: Settings },
];


export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const contentMap = {
    overview: <Overview setActiveTab={setActiveTab} />,
    rooms: <RoomManagement />,
    staff: <StaffManagement />,
    bookings: <BookingManagement />,
    expenses: <ExpensesTab />,
    payment: <PaymentTab />,
    revenue: <RevenueTab />,
    salary: <SalaryManagement />,
    attendance: <AttendanceTab />,
    tasks: <TaskTab />,
    customers: <CustomerTab />,
    technical: <TechnicalTab />,
    queries: <QueriesTab />,
    credentials: <CredentialTab />,
    settings: <PersonalSettings />,
  };

  return (
    <DashboardLayout
      role="admin"
      title={AdminTabs.find(t => t.id === activeTab)?.label || 'Admin Portal'}
      menuItems={AdminTabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {contentMap[activeTab]}
    </DashboardLayout>
  );
}
