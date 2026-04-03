import { useState, useEffect } from 'react';
import { Briefcase, Users, Calendar, Clock } from 'lucide-react';
import api from '../../api/axios';

const EmployeeProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [updateProgress, setUpdateProgress] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${selectedProject.id}`, { progress: updateProgress });
      alert(`Progress updated for ${selectedProject.name}!`);
      setSelectedProject(null);
      fetchProjects();
    } catch (error) {
      alert('Failed to update progress');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your projects...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <p className="text-gray-500">View and update progress for projects you are part of.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed">
            <p className="text-gray-400">You are not assigned to any projects yet.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{project.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      project.status === 'completed' ? 'bg-green-100 text-green-700' :
                      project.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-red-600">
                    <Calendar className="w-4 h-4" />
                    <span className="font-bold text-xs">{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No Due Date'}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{project.description}</p>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Progress</span>
                  <span className="text-blue-600 font-bold">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-3">Managed By: <span className="text-gray-700">{project.Manager?.name || 'Unknown'}</span></p>
                <div className="flex flex-wrap gap-4">
                  {project.TeamMembers?.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                        <Users className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{member.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => {
                  setSelectedProject(project);
                  setUpdateProgress(project.progress);
                }}
                className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition font-bold flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Update My Progress
              </button>
            </div>
          ))
        )}
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Update Progress: {selectedProject.name}</h2>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Completion (%)</label>
                <input 
                  type="range" min="0" max="100" 
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  value={updateProgress}
                  onChange={(e) => setUpdateProgress(e.target.value)}
                />
                <div className="text-right text-lg font-black text-blue-600 mt-2">{updateProgress}%</div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setSelectedProject(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold"
                >
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProjects;
