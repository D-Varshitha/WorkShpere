import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Notifications from './pages/Notifications';

import AdminAssetMaintenance from './pages/Admin/AssetMaintenance';
import AdminOverworkRisks from './pages/Admin/OverworkRisks';

import EmployeeAssets from './pages/Employee/Assets';
import EmployeeWellness from './pages/Employee/Wellness';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminEmployees from './pages/Admin/Employees';
import AdminProjects from './pages/Admin/Projects';
import AdminAttendance from './pages/Admin/Attendance';
import AdminFeedback from './pages/Admin/Feedback';

// Manager Pages
import ManagerDashboard from './pages/Manager/Dashboard';
import ManagerTeams from './pages/Manager/Teams';
import ManagerProjects from './pages/Manager/Projects';
import ManagerAttendance from './pages/Manager/Attendance';
import ManagerWellness from './pages/Manager/Wellness';
import ManagerAnnouncements from './pages/Manager/Announcements';

// Employee Pages
import EmployeeDashboard from './pages/Employee/Dashboard';
import EmployeeProjects from './pages/Employee/Projects';
import EmployeeTasks from './pages/Employee/Tasks';
import EmployeeAttendance from './pages/Employee/Attendance';
import EmployeeFeedback from './pages/Employee/Feedback';

// Shared Pages
import Leaves from './pages/Shared/Leaves';
import Facilities from './pages/Shared/Facilities';
import Seating from './pages/Shared/Seating';

import './index.css';

const RoleBasedRoute = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

const AccessDenied = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      <h2 className="text-3xl font-extrabold text-red-600 mb-4">Access Denied</h2>
      <p className="text-gray-600 mb-6">You do not have permission to view this page.</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </button>
    </div>
  </div>
);

const RequireRole = ({ roles, children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/access-denied" replace />;

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/access-denied" element={<AccessDenied />} />

          <Route element={<DashboardLayout />}>
            <Route path="/" element={<RoleBasedRoute />} />
...
            {/* Admin Routes */}
            <Route path="/admin" element={<RequireRole roles={['admin']}><AdminDashboard /></RequireRole>} />
            <Route path="/admin/employees" element={<RequireRole roles={['admin']}><AdminEmployees /></RequireRole>} />
            <Route path="/admin/projects" element={<RequireRole roles={['admin']}><AdminProjects /></RequireRole>} />
            <Route path="/admin/attendance" element={<RequireRole roles={['admin']}><AdminAttendance /></RequireRole>} />
            <Route path="/admin/feedback" element={<RequireRole roles={['admin']}><AdminFeedback /></RequireRole>} />
            <Route path="/admin/leaves" element={<RequireRole roles={['admin']}><Leaves /></RequireRole>} />
            <Route path="/admin/facilities" element={<RequireRole roles={['admin']}><Facilities /></RequireRole>} />
            <Route path="/admin/assets" element={<RequireRole roles={['admin']}><AdminAssetMaintenance /></RequireRole>} />
            <Route path="/admin/overwork-risks" element={<RequireRole roles={['admin']}><AdminOverworkRisks /></RequireRole>} />
            <Route path="/admin/seating" element={<RequireRole roles={['admin']}><Seating /></RequireRole>} />
            
            {/* Manager Routes */}
            <Route path="/manager" element={<RequireRole roles={['manager']}><ManagerDashboard /></RequireRole>} />
            <Route path="/manager/team" element={<RequireRole roles={['manager']}><ManagerTeams /></RequireRole>} />
            <Route path="/manager/projects" element={<RequireRole roles={['manager']}><ManagerProjects /></RequireRole>} />
            <Route path="/manager/leaves" element={<RequireRole roles={['manager']}><Leaves /></RequireRole>} />
            <Route path="/manager/facilities" element={<RequireRole roles={['manager']}><Facilities /></RequireRole>} />
            <Route path="/manager/attendance" element={<RequireRole roles={['manager']}><ManagerAttendance /></RequireRole>} />
            <Route path="/manager/wellness" element={<RequireRole roles={['manager']}><ManagerWellness /></RequireRole>} />
            <Route path="/manager/announcements" element={<RequireRole roles={['manager']}><ManagerAnnouncements /></RequireRole>} />
            <Route path="/manager/seating" element={<RequireRole roles={['manager']}><Seating /></RequireRole>} />
            
            {/* Employee Routes */}
            <Route path="/employee" element={<RequireRole roles={['employee']}><EmployeeDashboard /></RequireRole>} />
            <Route path="/employee/projects" element={<RequireRole roles={['employee']}><EmployeeProjects /></RequireRole>} />
            <Route path="/employee/tasks" element={<RequireRole roles={['employee']}><EmployeeTasks /></RequireRole>} />
            <Route path="/employee/leaves" element={<RequireRole roles={['employee']}><Leaves /></RequireRole>} />
            <Route path="/employee/attendance" element={<RequireRole roles={['employee']}><EmployeeAttendance /></RequireRole>} />
            <Route path="/employee/feedback" element={<RequireRole roles={['employee']}><EmployeeFeedback /></RequireRole>} />
            <Route path="/employee/facilities" element={<RequireRole roles={['employee']}><Facilities /></RequireRole>} />
            <Route path="/employee/assets" element={<RequireRole roles={['employee']}><EmployeeAssets /></RequireRole>} />
            <Route path="/employee/wellness" element={<RequireRole roles={['employee']}><EmployeeWellness /></RequireRole>} />
            <Route path="/employee/seating" element={<RequireRole roles={['employee']}><Seating /></RequireRole>} />
            
            {/* Notifications: visible to all roles but protected */}
            <Route path="/notifications" element={<RequireRole roles={['employee', 'manager', 'admin']}><Notifications /></RequireRole>} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
