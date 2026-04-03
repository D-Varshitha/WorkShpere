import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import api from '../../api/axios';

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks/my');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      fetchTasks();
    } catch (error) {
      alert('Failed to update task status');
    }
  };

  if (loading) return <div className="p-8">Loading tasks...</div>;

  const sections = [
    { label: 'To Do', status: 'todo', color: 'text-gray-400', bg: 'bg-gray-100' },
    { label: 'In Progress', status: 'in-progress', color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Done', status: 'done', color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-500">Manage your daily tasks and keep your team updated.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {sections.map((section) => (
          <div key={section.status} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-bold text-gray-700 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${section.status === 'todo' ? 'bg-gray-400' : section.status === 'in-progress' ? 'bg-blue-600' : 'bg-green-600'}`} />
                {section.label}
              </h2>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {tasks.filter(t => t.status === section.status).length}
              </span>
            </div>

            <div className="space-y-4 min-h-[200px]">
              {tasks.filter(t => t.status === section.status).map((task) => (
                <div key={task.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group">
                  <h3 className="font-bold text-gray-900 mb-2">{task.title}</h3>
                  <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {task.Project?.name}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                      <Calendar className="w-3 h-3" />
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due'}
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      {section.status !== 'in-progress' && section.status !== 'done' && (
                        <button 
                          onClick={() => updateStatus(task.id, 'in-progress')}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                      {section.status !== 'done' && (
                        <button 
                          onClick={() => updateStatus(task.id, 'done')}
                          className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === section.status).length === 0 && (
                <div className="py-8 text-center border-2 border-dashed rounded-2xl text-gray-300 text-sm">
                  Empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeTasks;
