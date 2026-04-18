const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:10000';
const API_URL = `${API_BASE}/api`;

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

const getToken = () => localStorage.getItem('token');

const request = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  return handleResponse(response);
};

const api = {
  // Auth
  login: (data) => fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  
  register: (data) => fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),

  // Rooms
  getRooms: () => request(`${API_URL}/rooms`),
  getRoomById: (id) => request(`${API_URL}/rooms/${id}`),
  createRoom: (data) => request(`${API_URL}/rooms`, {

    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateRoom: (id, data) => request(`${API_URL}/rooms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteRoom: (id) => request(`${API_URL}/rooms/${id}`, { method: 'DELETE' }),

  // Bookings
  getBookings: (params = '') => request(`${API_URL}/bookings${params ? '?' + params : ''}`),
  getDashboardStats: () => request(`${API_URL}/bookings/stats`),
  getCustomers: () => request(`${API_URL}/bookings/customers`),
  getNotifications: () => request(`${API_URL}/bookings/notifications`),

  createBooking: (data) => request(`${API_URL}/bookings`, {

    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateBooking: (id, data) => request(`${API_URL}/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteBooking: (id) => request(`${API_URL}/bookings/${id}`, { method: 'DELETE' }),

  // Staff
  getStaff: () => request(`${API_URL}/staff`),
  createStaff: (data) => request(`${API_URL}/staff`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStaff: (id, data) => request(`${API_URL}/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteStaff: (id) => request(`${API_URL}/staff/${id}`, { method: 'DELETE' }),

  // Expenses
  getExpenses: () => request(`${API_URL}/expenses`),
  createExpense: (data) => request(`${API_URL}/expenses`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateExpense: (id, data) => request(`${API_URL}/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteExpense: (id) => request(`${API_URL}/expenses/${id}`, { method: 'DELETE' }),

  // Attendance
  getAttendance: () => request(`${API_URL}/attendance`),
  createAttendance: (data) => request(`${API_URL}/attendance`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAttendance: (id, data) => request(`${API_URL}/attendance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Tasks
  getTasks: () => request(`${API_URL}/tasks`),
  createTask: (data) => request(`${API_URL}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTask: (id, data) => request(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteTask: (id) => request(`${API_URL}/tasks/${id}`, { method: 'DELETE' }),

  // Payments
  getPayments: (params = '') => request(`${API_URL}/payments${params ? '?' + params : ''}`),

  createPayment: (data) => request(`${API_URL}/payments`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updatePayment: (id, data) => request(`${API_URL}/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deletePayment: (id) => request(`${API_URL}/payments/${id}`, { method: 'DELETE' }),

  // Queries (Support)
  getQueries: () => request(`${API_URL}/queries`),
  createQuery: (data) => request(`${API_URL}/queries`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateQuery: (id, data) => request(`${API_URL}/queries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteQuery: (id) => request(`${API_URL}/queries/${id}`, { method: 'DELETE' }),
};

export default api;
