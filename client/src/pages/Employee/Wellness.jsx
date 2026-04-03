import { useEffect, useState } from 'react';
import { Heart, Activity } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';

const EmployeeWellness = () => {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stressLevel, setStressLevel] = useState(5);
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCheckins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wellness/my');
      setCheckins(res.data || []);
    } catch (e) {
      console.error('Failed to fetch wellness check-ins', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchCheckins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const submitCheckin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/wellness/checkin', {
        stressLevel,
        mood: mood.trim() || null,
        notes: notes.trim() || null
      });
      alert('Wellness check-in submitted!');
      setMood('');
      setNotes('');
      await fetchCheckins();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit check-in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Wellness Check-In</h1>
          <p className="text-gray-500">Confidential stress & mood update.</p>
        </div>
        <div className="bg-purple-100 p-3 rounded-lg">
          <Heart className="w-6 h-6 text-purple-600" />
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Submit Check-In</h2>
        </div>
        <form onSubmit={submitCheckin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Stress Level (1-10)</label>
            <input
              type="number"
              min={1}
              max={10}
              required
              value={stressLevel}
              onChange={(e) => setStressLevel(Number(e.target.value))}
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mood (optional)</label>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Calm, Focused, Overwhelmed"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Anything you want to share privately..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Check-In'}
          </button>
        </form>
      </div>

      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4 text-gray-900">Your Recent Check-Ins</h2>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : checkins.length === 0 ? (
          <div className="p-8 text-center text-gray-400 border-2 border-dashed rounded-xl bg-gray-50">
            No wellness check-ins yet.
          </div>
        ) : (
          <div className="space-y-3">
            {checkins.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{c.checkInDate}</p>
                    <p className="text-xs text-gray-500 mt-1">Stress level: {c.stressLevel}/10</p>
                    {c.mood && <p className="text-xs text-gray-500 mt-1">Mood: {c.mood}</p>}
                  </div>
                  <p className="text-xs text-gray-400 italic">{c.notes ? `"${c.notes}"` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeWellness;

