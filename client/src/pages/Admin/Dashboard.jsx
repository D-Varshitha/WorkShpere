import { useState, useEffect } from 'react';
import { Users, Briefcase, Activity, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/projects')
        ]);
        setStats(statsRes.data);
        setRecentProjects(projectsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Total Employees', value: stats?.totalEmployees || '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Projects', value: stats?.activeProjects || '0', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Tasks Completed', value: `${stats?.taskCompletionRate || 0}%`, icon: CheckCircle, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'System Status', value: 'Online', icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Real-time overview of the organization from Supabase.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-400">Live</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Recent Projects</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-400 border-b">
                  <th className="pb-3 font-medium">Project Name</th>
                  <th className="pb-3 font-medium">Manager</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentProjects.map((project) => (
                  <tr key={project.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-4 font-medium">{project.name}</td>
                    <td className="py-4">{project.Manager?.name || 'Unassigned'}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                        project.status === 'completed' ? 'bg-green-100 text-green-700' :
                        project.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-600">{project.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
