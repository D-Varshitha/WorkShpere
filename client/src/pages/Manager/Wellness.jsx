import { useEffect, useState } from 'react';
import { HeartPulse, Users } from 'lucide-react';
import api from '../../api/axios';

const ManagerWellness = () => {
  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState([]);

  const fetchWellness = async () => {
    try {
      setLoading(true);
      const res = await api.get('/manager/wellness');
      setCheckins(res.data?.checkins || []);
    } catch (e) {
      console.error('Failed to load wellness', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWellness();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Wellness</h1>
          <p className="text-gray-500">Wellness check-ins from your employees.</p>
        </div>
        <div className="bg-purple-100 p-3 rounded-lg">
          <HeartPulse className="w-6 h-6 text-purple-600" />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading wellness...</div>
      ) : checkins.length === 0 ? (
        <div className="p-12 text-center text-gray-400 border-2 border-dashed rounded-xl bg-gray-50">
          No team wellness check-ins yet.
        </div>
      ) : (
        <div className="space-y-3">
          {checkins.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl border bg-white shadow-sm flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-bold text-gray-900">
                    {c.WellnessEmployee?.name || 'Employee'}
                  </span>
                  <span className="text-xs text-gray-400">({c.WellnessEmployee?.department || '—'})</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Date: {c.checkInDate}</p>
                <p className="text-sm text-gray-700 mt-2">
                  Stress: <span className="font-bold">{c.stressLevel}/10</span> {c.mood ? `• Mood: ${c.mood}` : ''}
                </p>
                {c.notes && <p className="text-xs text-gray-500 mt-2 italic">"{c.notes}"</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerWellness;

