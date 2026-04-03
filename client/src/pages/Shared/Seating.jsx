import { useEffect, useMemo, useState } from 'react';
import { Armchair } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';

const buildDefaultCubicles = () => {
  // 5 rows x 6 cols = 30 cubicles (A1..A6, B1..B6 ...)
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = [1, 2, 3, 4, 5, 6];
  const ids = [];
  for (const r of rows) for (const c of cols) ids.push(`${r}${c}`);
  return ids;
};

const Seating = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState([]);
  const [assigning, setAssigning] = useState(false);

  const cubicles = useMemo(() => buildDefaultCubicles(), []);
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  const fetchSeating = async () => {
    try {
      setLoading(true);
      const res = await api.get('/seating');
      setSeats(res.data || []);
    } catch (e) {
      console.error('Failed to load seating', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeating();
  }, []);

  const seatByCubicle = useMemo(() => {
    const m = new Map();
    for (const s of seats) m.set(s.cubicleId, s);
    return m;
  }, [seats]);

  const assign = async (cubicleId) => {
    if (!isAdminOrManager) return;
    const userId = prompt('Enter employee userId to assign (leave empty to free):', '');
    setAssigning(true);
    try {
      await api.patch(`/seating/${cubicleId}`, { userId: userId?.trim() || null });
      await fetchSeating();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update seating');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seating Arrangement</h1>
          <p className="text-gray-500">Cubicle occupancy overview.</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-lg">
          <Armchair className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      {!isAdminOrManager && (
        <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm font-medium border border-yellow-200">
          Seating is read-only for employees. Ask your manager/admin to update assignments.
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading seating...</div>
      ) : (
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {cubicles.map((id) => {
              const seat = seatByCubicle.get(id);
              const occupied = Boolean(seat?.userId);
              return (
                <button
                  key={id}
                  disabled={!isAdminOrManager || assigning}
                  onClick={() => assign(id)}
                  className={`p-4 rounded-xl border text-left transition ${
                    occupied ? 'bg-red-50 border-red-100 hover:bg-red-100' : 'bg-green-50 border-green-100 hover:bg-green-100'
                  } ${!isAdminOrManager ? 'cursor-default' : ''}`}
                  title={isAdminOrManager ? 'Click to assign/free' : ''}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-widest text-gray-500">{id}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      occupied ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {occupied ? 'Occupied' : 'Free'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {occupied ? (seat.SeatedUser?.name || 'Employee') : '—'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {occupied ? (seat.SeatedUser?.department || '') : ''}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Seating;

