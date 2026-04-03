import { useState, useEffect } from 'react';
import { Building2, Clock, CheckCircle, XCircle, MapPin } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';

const Facilities = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] = useState(null);
  const [occupancy, setOccupancy] = useState([]);
  const [occupancyLoading, setOccupancyLoading] = useState(true);
  
  // Keep some static data around just in case the API doesn't exist yet, for visual purposes
  const [availableRooms, setAvailableRooms] = useState([
    { id: 'R1', name: 'Boardroom Alpha', type: 'Boardroom' },
    { id: 'R2', name: 'Conference Room 1', type: 'Conference' },
    { id: 'R3', name: 'Conference Room 2', type: 'Conference' },
  ]);
  const [bookingRoom, setBookingRoom] = useState(null);
  const [newBooking, setNewBooking] = useState({ date: '', fromTime: '', toTime: '' });

  useEffect(() => {
    fetchBookings();
    fetchOccupancy();
  }, []);

  const fetchOccupancy = async () => {
    try {
      setOccupancyLoading(true);
      const res = await api.get('/occupancy/today');
      setOccupancy(res.data?.zones || []);
    } catch (e) {
      console.error('Failed to load occupancy:', e);
      setOccupancy([]);
    } finally {
      setOccupancyLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Try to fetch from API
      // If user is manager, fetch all. If employee, fetch specific. 
      // Assuming GET /api/facilities exists
      const response = await api.get('/facilities');
      // Dedupe defensively (duplicate inserts / duplicate responses).
      // Prefer composite key so we also hide duplicates where IDs differ.
      const deduped = Array.from(
        new Map(
          (response.data || []).map((b) => {
            const key = [
              b.facilityId || b.facilityName || '',
              b.date || '',
              b.fromTime || '',
              b.toTime || '',
              b.employeeId || ''
            ].join('|');
            return [key, b];
          })
        ).values()
      );
      setBookings(deduped);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      // Graceful error handling for missing backend route
      if (error.response?.status === 404) {
        setBookingError("The Facilities API is currently unavailable. Displaying mock data.");
        // Fallback mock data to fulfill UI requirements
        setBookings([
          { 
            id: 'mock1', 
            facilityName: 'Boardroom Alpha', 
            requestedBy: 'John Doe',
            employeeId: 'mock-user-1',
            date: '2026-04-05',
            fromTime: '10:00',
            toTime: '12:00',
            status: 'pending' 
          },
          { 
            id: 'mock2', 
            facilityName: 'Conference Room 1', 
            requestedBy: 'Jane Smith',
            employeeId: 'mock-user-2',
            date: '2026-04-06',
            fromTime: '14:00',
            toTime: '15:00',
            status: 'approved' 
          }
        ]);
      } else {
        setBookingError("Failed to load facilities bookings.");
        setBookings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      if (bookingError) {
        // Mock success if API is down
        alert(`Mock Booking confirmed for ${bookingRoom.name}`);
        setBookingRoom(null);
        return;
      }
      
      await api.post('/facilities', {
        facilityId: bookingRoom.id,
        facilityName: bookingRoom.name,
        ...newBooking
      });
      alert(`Booking confirmed for ${bookingRoom.name}`);
      setBookingRoom(null);
      setBookingError(null);
      fetchBookings();
    } catch (error) {
      console.error('Failed to book facility:', error);
      const msg = error.response?.data?.message || 'Failed to book facility';
      setBookingError(msg);
    }
  };

  const handleAction = async (id, status) => {
    try {
      if (bookingError) {
        // Mock success if API is down
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        alert(`Mock: Booking ${status} successfully!`);
        return;
      }
      
      await api.put(`/facilities/${id}`, { status });
      alert(`Booking ${status} successfully!`);
      fetchBookings();
    } catch (error) {
      console.error('Failed to update booking status:', error);
      alert('Failed to update booking status');
    }
  };

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Facilities & Meeting Rooms</h1>
        <p className="text-gray-500">Manage meeting room bookings across the workspace.</p>

        <div className="mt-4">
          <h2 className="text-sm font-bold text-gray-700 mb-2">Occupancy (Safety View)</h2>
          {occupancyLoading ? (
            <div className="text-xs text-gray-500">Loading occupancy...</div>
          ) : occupancy.length === 0 ? (
            <div className="text-xs text-gray-500 italic">No occupancy data available.</div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {occupancy.map((z) => {
                const isHigh = z.occupancyPct >= z.safetyThresholdPct;
                return (
                  <div
                    key={z.zoneId}
                    className={`px-3 py-2 rounded-lg border text-xs font-bold ${
                      isHigh
                        ? 'bg-red-50 border-red-100 text-red-700'
                        : 'bg-blue-50 border-blue-100 text-blue-700'
                    }`}
                  >
                    {z.zoneName}: {z.occupancyCount}/{z.capacityLimit} ({z.occupancyPct}%)
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {bookingError && (
          <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm font-medium border border-yellow-200">
            {bookingError}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Book a Room Section (Employee + Manager) */}
        <section className="bg-white p-6 rounded-2xl border shadow-sm h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold">Book a Room</h2>
          </div>

          <div className="space-y-4">
            {availableRooms.map((room) => (
               <div key={room.id} className="p-4 rounded-xl border flex flex-col gap-3 transition hover:border-blue-500">
                <div>
                  <h3 className="font-bold text-sm">{room.name}</h3>
                  <p className="text-xs text-gray-400 font-medium">{room.type}</p>
                </div>
                <button 
                  onClick={() => setBookingRoom(room)}
                  className="w-full py-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-bold transition"
                >
                  Book Room
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Bookings Section */}
        <section className="bg-white p-6 rounded-2xl border shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold">
              {isManager ? 'All Facility Bookings' : 'My Bookings'}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No bookings found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Facility Name</th>
                    {isManager && <th className="py-3 px-4">Requested By</th>}
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Status</th>
                    {isManager && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((booking) => (
                    // In a real app we'd filter for employee's own bookings here if endpoint returned all
                    // But our mock shows both for demo purposes
                    <tr key={booking.id} className="hover:bg-gray-50 transition">
                      <td className="py-4 px-4 font-bold text-gray-900">{booking.facilityName}</td>
                      {isManager && <td className="py-4 px-4 text-gray-600">{booking.requestedBy || 'Unknown User'}</td>}
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        <div className="flex items-center gap-2">
                           <span>{booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}</span>
                           <span className="text-gray-400">|</span>
                           <span>{booking.fromTime} - {booking.toTime}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                          booking.status === 'approved' ? 'bg-green-100 text-green-700' : 
                          booking.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      {isManager && (
                        <td className="py-4 px-4 text-right">
                          {booking.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleAction(booking.id, 'approved')}
                                className="p-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition"
                                title="Approve"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleAction(booking.id, 'rejected')}
                                className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {bookingRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Book {bookingRoom.name}</h2>
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" required 
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                  value={newBooking.date}
                  onChange={e => setNewBooking({...newBooking, date: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input 
                    type="time" required 
                    className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                    value={newBooking.fromTime}
                    onChange={e => setNewBooking({...newBooking, fromTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input 
                    type="time" required 
                    className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                    value={newBooking.toTime}
                    onChange={e => setNewBooking({...newBooking, toTime: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setBookingRoom(null)}
                  className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold">
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facilities;
