import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import SharedRoomForm from './components/SharedRoomForm';
import { getRoomDetail, Room, getStudentsInRoom, Student } from '@/services/roomsService';

const ViewRoomPage = () => {
  const { buildingId, roomId } = useParams<{ buildingId: string; roomId: string }>();
  const navigate = useNavigate(); // <-- Thêm navigate
  const [room, setRoom] = useState<Room | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomAndStudents = async () => {
      if (!buildingId || !roomId) return;
      try {
        const detail = await getRoomDetail(buildingId, roomId);
        setRoom(detail);

        const studentList = await getStudentsInRoom(buildingId, roomId);
        setStudents(studentList);
      } catch (error) {
        console.error('Error fetching room or students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomAndStudents();
  }, [buildingId, roomId]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-100 p-8">
          {loading ? (
            <p className="text-gray-500 italic">Loading room information...</p>
          ) : room ? (
            <>
              <SharedRoomForm room={room} mode="view" />

              <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Students in this room</h2>
                {students.length === 0 ? (
                  <p className="text-gray-500 italic">No students assigned to this room.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">SSN</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">CCCD</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">First Name</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Last Name</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((s) => (
                          <tr
                            key={s.ssn}
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/students/view/${s.ssn}`)} // <-- Điều hướng khi click
                          >
                            <td className="px-4 py-2">{s.ssn}</td>
                            <td className="px-4 py-2">{s.cccd}</td>
                            <td className="px-4 py-2">{s.first_name}</td>
                            <td className="px-4 py-2">{s.last_name}</td>
                            <td className="px-4 py-2">{s.phone_numbers}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-red-500 font-medium">Room not found.</p>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ViewRoomPage;
