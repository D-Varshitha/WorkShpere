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
<<<<<<< HEAD
      </div>
=======
            </div>
>>>>>>> 0a06ae65cf91bb6d9063e587f7198e572e340cc3
  );
};

export default ManagerDashboard;
