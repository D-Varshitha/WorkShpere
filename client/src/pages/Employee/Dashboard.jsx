import { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, Clock, Calendar, MessageSquare } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projectsRes, assetsRes] = await Promise.all([
          api.get('/tasks/my'),
          api.get('/projects'),
          api.get('/assets/my').catch(() => ({ data: [] }))
        ]);
        setTasks(tasksRes.data);
        setProjects(projectsRes.data);
        setAssets(assetsRes.data || []);
      } catch (error) {
        console.error('Error fetching employee dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Assigned Tasks', value: tasks.length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Completed Tasks', value: tasks.filter(t => t.status === 'done').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Active Projects', value: projects.length, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Remaining Leaves', value: (user.totalLeaves || 24) - (user.usedLeaves || 0), icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  const markPresent = async () => {
    try {
      await api.post('/attendance/checkin', { status: 'present' });
      alert('Successfully checked in for today!');
    } catch (error) {
      alert(error.response?.data?.message || 'Check-in failed');
    }
  };

  if (loading) return <div className="p-8">Loading your dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
          <p className="text-gray-500">Here's an overview of your work and progress.</p>
        </div>
        <button 
          onClick={markPresent}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-200 flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Mark Today's Attendance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`${stat.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
            <p className="text-sm font-medium text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-gray-400" />
            My Active Projects
          </h2>
          <div className="space-y-4">
            {projects.map(p => (
              <div key={p.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-gray-800">{p.name}</p>
                  <span className="text-[10px] font-black uppercase text-blue-600">{p.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${p.progress}%` }}></div>
                </div>
              </div>
            ))}
            {projects.length === 0 && <p className="text-gray-400 italic">No projects assigned.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Recent Tasks
          </h2>
          <div className="space-y-4">
            {tasks.slice(0, 4).map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm">
                <div>
                  <p className="font-bold text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.Project?.name}</p>
                </div>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                  t.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-gray-400 italic">No tasks found.</p>}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-gray-400" />
          My Assets
        </h2>
        {assets.length === 0 ? (
          <p className="text-gray-400 italic">No assets assigned.</p>
        ) : (
          <div className="space-y-3">
            {assets.map((a) => (
              <div key={a.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{a.assetType}</p>
                  <p className="text-xs text-gray-500">
                    Assigned: {a.assignedDate ? new Date(a.assignedDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                  (a.status || '').toLowerCase() === 'assigned'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {a.status || 'Unknown'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
