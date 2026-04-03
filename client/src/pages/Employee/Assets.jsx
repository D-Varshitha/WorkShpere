import { useState, useEffect } from 'react';
import { Wrench, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';

const EmployeeAssets = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issueDescription, setIssueDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assets/my');
      setAssets(res.data || []);
    } catch (e) {
      console.error('Failed to fetch assets', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const requestMaintenance = async (e) => {
    e.preventDefault();
    if (!issueDescription.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/assets/maintenance-request', { issueDescription: issueDescription.trim() });
      alert('Maintenance request submitted!');
      setIssueDescription('');
      await fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit maintenance request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Assets</h1>
          <p className="text-gray-500">Current condition and custody duration.</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading assets...</div>
      ) : assets.length === 0 ? (
        <div className="p-12 text-center text-gray-400 border-2 border-dashed rounded-xl bg-gray-50">
          No assets assigned.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.map((a) => (
            <div key={a.id} className="bg-white border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Asset Type</p>
                  <p className="text-lg font-bold text-gray-900">{a.assetType}</p>
                </div>
                <span
                  className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                    (a.status || '').toLowerCase() === 'assigned'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {a.status || 'Unknown'}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">Assigned employee: {a.AssignedEmployee?.name || user?.name}</p>
                <p className="text-sm text-gray-600">Assigned date: {a.assignedDate ? new Date(a.assignedDate).toLocaleDateString() : 'N/A'}</p>
                <p className="text-sm text-gray-600">
                  Custody duration: {a.custodyDays ?? 0} days
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Wrench className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Request Maintenance</h2>
        </div>

        <form onSubmit={requestMaintenance} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Issue description</label>
            <textarea
              required
              rows="4"
              className="w-full p-4 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Describe the issue with your asset..."
            />
          </div>
          <button
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Maintenance Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeAssets;

