import { useParams, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import SharedRoomForm from './components/SharedRoomForm';
import {
  getRoomDetail,
  Room,
  getStudentsInRoom,
  Student,
  addStudentToRoom,
  removeStudentFromRoom,
} from '@/services/roomsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { getStudentDetail } from '@/services/studentService';

const ViewRoomPage = () => {
  const { buildingId, roomId } = useParams<{ buildingId: string; roomId: string }>();
  const navigate = useNavigate(); // <-- Thêm navigate
  const [room, setRoom] = useState<Room | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [sssnToAdd, setSssnToAdd] = useState('');
  const [sssnToRemove, setSssnToRemove] = useState('');
  const [studentActionLoading, setStudentActionLoading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  const fetchRoomAndStudents = useCallback(async () => {
    if (!buildingId || !roomId) return;
    try {
      setLoading(true);
      const detail = await getRoomDetail(buildingId, roomId);
      setRoom(detail);

      const studentList = await getStudentsInRoom(buildingId, roomId);
      setStudents(studentList);
    } catch (error) {
      console.error('Error fetching room or students:', error);
      toast.error('Không thể tải thông tin phòng.');
    } finally {
      setLoading(false);
    }
  }, [buildingId, roomId]);

  useEffect(() => {
    fetchRoomAndStudents();
  }, [fetchRoomAndStudents]);

  const handleAddStudent = async () => {
    if (!buildingId || !roomId) return;
    const trimmedSssn = sssnToAdd.trim();
    if (!/^\d{8}$/.test(trimmedSssn)) {
      const message = 'Mã sinh viên không hợp lệ. Vui lòng nhập đủ 8 chữ số.';
      setStudentError(message);
      toast.error(message);
      return;
    }
    try {
      setStudentActionLoading(true);
      setStudentError(null);

      const studentInfo = await getStudentDetail(trimmedSssn);
      if (
        studentInfo.building_id &&
        studentInfo.room_id &&
        (studentInfo.building_id !== buildingId || studentInfo.room_id !== roomId)
      ) {
        const message = 'Sinh viên đang thuộc phòng khác. Vui lòng chuyển sinh viên ra trước.';
        setStudentError(message);
        toast.error(message);
        setStudentActionLoading(false);
        return;
      }
      if (
        studentInfo.building_id === buildingId &&
        studentInfo.room_id === roomId
      ) {
        const message = 'Sinh viên đã thuộc phòng này.';
        setStudentError(message);
        toast.error(message);
        setStudentActionLoading(false);
        return;
      }

      await addStudentToRoom(buildingId, roomId, trimmedSssn);
      toast.success('Đã thêm sinh viên vào phòng.');
      setSssnToAdd('');
      setStudentError(null);
      await fetchRoomAndStudents();
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Không thể thêm sinh viên.';
      setStudentError(message);
      toast.error(message);
    } finally {
      setStudentActionLoading(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!buildingId || !roomId) return;
    const trimmedSssn = sssnToRemove.trim();
    if (!/^\d{8}$/.test(trimmedSssn)) {
      const message = 'Vui lòng chọn sinh viên hợp lệ để xóa.';
      setStudentError(message);
      toast.error(message);
      return;
    }
    try {
      setStudentActionLoading(true);
      setStudentError(null);
      await removeStudentFromRoom(buildingId, roomId, trimmedSssn);
      toast.success('Đã xóa sinh viên khỏi phòng.');
      setSssnToRemove('');
      await fetchRoomAndStudents();
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Không thể xóa sinh viên khỏi phòng.';
      setStudentError(message);
      toast.error(message);
    } finally {
      setStudentActionLoading(false);
    }
  };

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

              <div className="mt-6 bg-white p-6 rounded-lg shadow-md space-y-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">Students in this room</h2>
                    <p className="text-sm text-gray-500">
                      Quản lý sinh viên trong phòng. Mỗi thao tác sẽ tự động cập nhật số lượng và tỷ lệ chiếm dụng.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center min-w-[300px]">
                    <div className="flex flex-col gap-1 w-full">
                      <label className="text-sm font-medium text-gray-700">Thêm sinh viên (SSSN)</label>
                      <div className="flex gap-2">
                        <Input
                          value={sssnToAdd}
                          maxLength={8}
                          placeholder="Nhập SSSN"
                          onChange={(e) => setSssnToAdd(e.target.value)}
                        />
                        <Button
                          style={{ backgroundColor: '#032B91', color: 'white' }}
                          onClick={handleAddStudent}
                          disabled={studentActionLoading}
                        >
                          Thêm
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <label className="text-sm font-medium text-gray-700">Xóa sinh viên khỏi phòng</label>
                      <div className="flex gap-2">
                        <select
                          value={sssnToRemove}
                          onChange={(e) => setSssnToRemove(e.target.value)}
                          className="flex-1 rounded border border-gray-300 px-3 py-2"
                        >
                          <option value="">Chọn sinh viên</option>
                          {students.map((s) => (
                            <option key={s.ssn} value={s.ssn}>
                              {s.ssn} - {s.first_name} {s.last_name}
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          onClick={handleRemoveStudent}
                          disabled={studentActionLoading || !students.length}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                {studentError && (
                  <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {studentError}
                  </div>
                )}
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
