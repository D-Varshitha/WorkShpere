import { Users, ClipboardList, Calendar, CheckCircle } from 'lucide-react';

const ManagerDashboard = () => {
  const stats = [
    { label: 'My Team', value: '12', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Open Tasks', value: '28', icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Leave Requests', value: '3', icon: Calendar, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Team Progress', value: '75%', icon: CheckCircle, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-500">Manage your team, assign tasks, and track progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Team Task Assignment</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Task Title</label>
              <input type="text" className="mt-1 block w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-blue-500 outline-none" placeholder="e.g., Update README" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assign To</label>
              <select className="mt-1 block w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-blue-500 outline-none">
                <option>Employee A</option>
                <option>Employee B</option>
              </select>
            </div>
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Assign Task</button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Leave Approvals Pending (Team)</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-bold">Mike Chen</p>
                <p className="text-sm text-gray-500">3 days (Vacation)</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-green-600 text-white rounded text-xs">Approve</button>
                <button className="px-3 py-1 bg-red-600 text-white rounded text-xs">Reject</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
