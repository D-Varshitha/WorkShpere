import { useState, useEffect } from 'react';
import { Briefcase, Clock, Calendar, Search, Tag } from 'lucide-react';
import api from '../../api/axios';

const ManagerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', dueDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasksMap, setTasksMap] = useState({});
  const [updatingTask, setUpdatingTask] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
      
      // Fetch tasks for all projects to display their status
      const tasksObj = {};
      for (const proj of response.data) {
        try {
          const taskRes = await api.get(`/tasks/project/${proj.id}`);
          tasksObj[proj.id] = taskRes.data;
        } catch (e) {
          console.error(`Failed to fetch tasks for project ${proj.id}`, e);
        }
      }
      setTasksMap(tasksObj);
    } catch (error) {
      console.error('Error fetching projects:', error);
      alert('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim() || !newProject.description.trim()) {
      alert('Project name and description are required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post('/projects', newProject);
      alert('Project created successfully!');
      setShowCreateModal(false);
      setNewProject({ name: '', description: '', dueDate: '' });
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      alert(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus, projectId) => {
    setUpdatingTask(taskId);
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      
      // Update local state without full refetch for better UX
      setTasksMap(prev => {
        const projectTasks = prev[projectId] || [];
        const updatedProjectTasks = projectTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);

        const total = updatedProjectTasks.length;
        const doneCount = updatedProjectTasks.filter(t => t.status === 'done').length;
        const newProgress = total > 0 ? Math.round((doneCount / total) * 100) : 0;

        setProjects(prevProjects =>
          prevProjects.map(p => (p.id === projectId ? { ...p, progress: newProgress } : p))
        );

        return {
          ...prev,
          [projectId]: updatedProjectTasks
        };
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    } finally {
      setUpdatingTask(null);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your projects...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assigned Projects</h1>
          <p className="text-gray-500">Detailed list and status of projects under your management.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap font-bold"
          >
            Create Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                project.status === 'completed' ? 'bg-green-100 text-green-700' :
                project.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {project.status}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{project.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-6">{project.description}</p>

            <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                <span>Progress</span>
                <span className="text-blue-600">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-4 mb-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No Due Date'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span>{project.TeamMembers?.length || 0} Members</span>
                </div>
              </div>

              {/* Tasks List */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Project Tasks</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {tasksMap[project.id]?.map(task => (
                    <div key={task.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold text-gray-800">{task.title}</span>
                        <select
                          disabled={updatingTask === task.id}
                          className={`text-xs p-1 rounded font-bold outline-none cursor-pointer border ${
                            task.status === 'done' ? 'bg-green-50 text-green-700 border-green-200' :
                            task.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                          value={task.status}
                          onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value, project.id)}
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>Assigned to: {task.AssignedTo?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                  ))}
                  {(!tasksMap[project.id] || tasksMap[project.id].length === 0) && (
                    <p className="text-xs text-gray-400 italic text-center py-2">No tasks found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-400 italic">No projects found.</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Project Name</label>
                <input 
                  type="text" required
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Enter project name..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea 
                  required rows="3"
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Enter project description..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Due Date</label>
                <input 
                  type="date"
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProject.dueDate}
                  onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerProjects;
