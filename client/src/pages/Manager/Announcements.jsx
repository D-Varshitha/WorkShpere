import { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import api from '../../api/axios';

const ManagerAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/manager/announcements');
      setAnnouncements(res.data || []);
    } catch (e) {
      console.error('Failed to fetch announcements', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const createAnnouncement = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/manager/announcements', form);
      alert('Announcement posted');
      setForm({ title: '', message: '' });
      await fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Announcements</h1>
          <p className="text-gray-500">Post updates to your team.</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-lg">
          <Megaphone className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Create Announcement</h2>
        <form onSubmit={createAnnouncement} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold disabled:opacity-60"
          >
            {submitting ? 'Posting...' : 'Post Announcement'}
          </button>
        </form>
      </div>

      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Recent</h2>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center text-gray-400 border-2 border-dashed rounded-xl bg-gray-50">
            No announcements yet.
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="p-4 rounded-xl border bg-gray-50">
                <p className="font-bold text-gray-900">{a.title}</p>
                <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{a.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerAnnouncements;

