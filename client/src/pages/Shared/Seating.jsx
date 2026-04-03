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
<<<<<<< HEAD
  const [assigningSeat, setAssigningSeat] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
=======
>>>>>>> 0a06ae65cf91bb6d9063e587f7198e572e340cc3

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

<<<<<<< HEAD
  const fetchEmployees = async () => {
    if (!isAdminOrManager) return;
    try {
      const res = await api.get('/users');
      setEmployees(res.data || []);
    } catch (e) {
      console.error('Failed to load users for seating', e);
    }
  };

  useEffect(() => {
    fetchSeating();
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminOrManager]);
=======
  useEffect(() => {
    fetchSeating();
  }, []);
>>>>>>> 0a06ae65cf91bb6d9063e587f7198e572e340cc3

  const seatByCubicle = useMemo(() => {
    const m = new Map();
    for (const s of seats) m.set(s.cubicleId, s);
    return m;
  }, [seats]);

<<<<<<< HEAD
  const openAssign = (cubicleId) => {
    if (!isAdminOrManager) return;
    setAssigningSeat(cubicleId);
    setSelectedUserId('');
  };

  const confirmAssign = async () => {
    if (!assigningSeat) return;
    setAssigning(true);
    try {
      await api.patch(`/seating/${assigningSeat}`, { userId: selectedUserId || null });
      await fetchSeating();
      setAssigningSeat(null);
      setSelectedUserId('');
=======
  const assign = async (cubicleId) => {
    if (!isAdminOrManager) return;
    const userId = prompt('Enter employee userId to assign (leave empty to free):', '');
    setAssigning(true);
    try {
      await api.patch(`/seating/${cubicleId}`, { userId: userId?.trim() || null });
      await fetchSeating();
>>>>>>> 0a06ae65cf91bb6d9063e587f7198e572e340cc3
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
<<<<<<< HEAD
                  onClick={() => openAssign(id)}
=======
                  onClick={() => assign(id)}
>>>>>>> 0a06ae65cf91bb6d9063e587f7198e572e340cc3
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
<<<<<<< HEAD

      {isAdminOrManager && assigningSeat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Assign Seat {assigningSeat}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Employee</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Free (no assignment)</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} {e.department ? `(${e.department})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAssigningSeat(null);
                    setSelectedUserId('');
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmAssign}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-60"
                  disabled={assigning}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
=======
>>>>>>> 0a06ae65cf91bb6d9063e587f7198e572e340cc3
    </div>
  );
};

export default Seating;

