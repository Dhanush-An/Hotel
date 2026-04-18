import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import PaymentTab from '../components/admin/PaymentTab';
import AvailableRooms from '../components/admin/AvailableRooms';
import TechnicalTab from '../components/admin/TechnicalTab';
import QueriesTab from '../components/admin/QueriesTab';
import RoomManagement from '../components/admin/RoomManagement';
import BookingManagement from '../components/admin/BookingManagement';
import PersonalSettings from '../components/common/PersonalSettings';
import { BedDouble, CreditCard, MessageCircle, ListPlus, Wrench, CalendarCheck, Settings } from 'lucide-react';

const ReceptionistTabs = [
  { id: 'bookings', label: 'Online Booking', icon: CalendarCheck },
  { id: 'available', label: 'Available Rooms', icon: ListPlus },
  { id: 'roominfo', label: 'Room Information', icon: BedDouble },
  { id: 'technical', label: 'Technical Issues', icon: Wrench },
  { id: 'queries', label: 'Queries', icon: MessageCircle },
  { id: 'settings', label: 'My Settings', icon: Settings },
];

const ReceptionistDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [assignmentData, setAssignmentData] = useState(null); // { room, booking }

  const handleAssignToPortal = (room, booking) => {
    setAssignmentData({ room, booking });
    setActiveTab('available');
  };

  const contentMap = {
    bookings: <BookingManagement initialStatus="Pending" sourceFilter="Website" onAssignToPortal={handleAssignToPortal} />,
    available: <AvailableRooms initialRoom={assignmentData?.room} initialBooking={assignmentData?.booking} />,
    roominfo: <RoomManagement />,
    technical: <TechnicalTab />,
    queries: <QueriesTab />,
    settings: <PersonalSettings />,
  };

  return (
    <DashboardLayout 
      role="receptionist" 
      title={ReceptionistTabs.find(t => t.id === activeTab)?.label || 'Reception Portal'}
      menuItems={ReceptionistTabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <div className="animate-fade-in transition-all">
        {contentMap[activeTab]}
      </div>
    </DashboardLayout>
  );
};

export default ReceptionistDashboard;

