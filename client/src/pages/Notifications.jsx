import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}`);
      await fetchNotifications();
    } catch (e) {
      console.error('Failed to mark notification as read', e);
      alert('Failed to update notification');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Bell className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">Alerts from HR/IT and workspace events.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center text-gray-400 border-2 border-dashed rounded-xl bg-gray-50">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border shadow-sm flex items-start justify-between gap-4 ${
                n.read ? 'bg-white' : 'bg-blue-50 border-blue-100'
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm text-gray-700 font-medium break-words">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                </p>
              </div>
              {!n.read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition whitespace-nowrap"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

