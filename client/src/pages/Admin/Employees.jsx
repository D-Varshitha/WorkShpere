import { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Mail, Shield, Briefcase } from 'lucide-react';
import api from '../../api/axios';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const managers = employees.filter((e) => e.role === 'manager' && !e.archived);
  const [newEmp, setNewEmp] = useState({ 
    name: '', 
    email: '', 
    password: 'password123', // Default password for new employees
    role: 'employee', 
    department: '',
    managerId: ''
  });
  const [editEmp, setEditEmp] = useState(null);
  const [editForm, setEditForm] = useState({ role: 'employee', department: '', archived: false, managerId: '' });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      // We use the /auth/register route to create new users in the database
      const payload = {
        ...newEmp,
        managerId: newEmp.role === 'employee' ? (newEmp.managerId || null) : null
      };
      await api.post('/auth/register', payload);
      alert('Employee added successfully! Default password is: password123');
      setShowAddModal(false);
      setNewEmp({ name: '', email: '', password: 'password123', role: 'employee', department: '', managerId: '' });
      fetchEmployees();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add employee');
    }
  };

  const deleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      try {
        await api.delete(`/users/${id}`);
        setEmployees(employees.filter(e => e.id !== id));
      } catch (error) {
        alert('Failed to delete employee');
      }
    }
  };

  const openEdit = (emp) => {
    setEditEmp(emp);
    setEditForm({
      role: emp.role || 'employee',
      department: emp.department || '',
      archived: Boolean(emp.archived),
      managerId: emp.managerId || ''
    });
    setShowEditModal(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editEmp) return;
    try {
      await api.patch(`/users/${editEmp.id}`, {
        role: editForm.role,
        department: editForm.department,
        archived: editForm.archived,
        managerId: editForm.managerId || null
      });
      setShowEditModal(false);
      setEditEmp(null);
      fetchEmployees();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update employee');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading employees...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-500">Manage company roles and access levels.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-200"
        >
          <UserPlus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {emp.name.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-900">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      emp.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      emp.role === 'manager' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{emp.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{emp.email}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(emp)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition font-bold text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteEmployee(emp.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8">
            <h2 className="text-xl font-bold mb-6">Add New Employee</h2>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" required
                    className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEmp.name}
                    onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" required
                    className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select 
                    className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEmp.role}
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                  <select
                    disabled={newEmp.role !== 'employee' || managers.length === 0}
                    className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    value={newEmp.managerId}
                    onChange={(e) => setNewEmp({ ...newEmp, managerId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input 
                    type="text" required
                    className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold"
                >
                  Confirm & Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editEmp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8">
            <h2 className="text-xl font-bold mb-6">Edit Employee</h2>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                <select
                  disabled={editForm.role !== 'employee' || managers.length === 0}
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  value={editForm.managerId}
                  onChange={(e) => setEditForm({ ...editForm, managerId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="edit-archived"
                  type="checkbox"
                  checked={editForm.archived}
                  onChange={(e) => setEditForm({ ...editForm, archived: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="edit-archived" className="text-sm font-bold text-gray-700">
                  Archived (offboard)
                </label>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditEmp(null);
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;
