// fileName: ViewRoomPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState, useMemo } from 'react'; // Thêm useMemo
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
import { getStudentsWithoutRoom, StudentOption } from '@/services/studentService';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { ChevronsUpDown, Trash2, UserPlus, ArrowRightLeft } from 'lucide-react';
import { TransferStudentDialog } from './components/TransferStudentDialog';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Hàm tiện ích để search tiếng Việt không dấu
const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
};

const ViewRoomPage = () => {
  const { buildingId, roomId } = useParams<{ buildingId: string; roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State cho chức năng Chuyển phòng
  const [studentToTransfer, setStudentToTransfer] = useState<Student | null>(null);

  // State cho việc Xóa sinh viên
  const [sssnToRemove, setSssnToRemove] = useState('');
  
  // State cho việc Thêm sinh viên (Search)
  const [availableStudents, setAvailableStudents] = useState<StudentOption[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  
  const [studentActionLoading, setStudentActionLoading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  // --- LOGIC TÍNH GIỚI TÍNH PHÒNG ---
  const roomGender = useMemo(() => {
    if (students.length === 0) return 'mixed'; // Phòng trống
    const firstStudentSex = students[0].sex;
    // Kiểm tra các biến thể của giới tính Nam
    if (['M', 'm', 'Male', 'male'].includes(firstStudentSex)) return 'male';
    return 'female';
  }, [students]);

  const fetchRoomAndStudents = useCallback(async () => {
    if (!buildingId || !roomId) return;
    try {
      setLoading(true);
      const detail = await getRoomDetail(buildingId, roomId);
      setRoom(detail);

      const studentList = await getStudentsInRoom(buildingId, roomId);
      setStudents(studentList);

      // Load danh sách SV chưa có phòng để search
      setLoadingAvailable(true);
      const availableList = await getStudentsWithoutRoom();
      setAvailableStudents(availableList);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải thông tin phòng hoặc sinh viên.');
    } finally {
      setLoading(false);
      setLoadingAvailable(false);
    }
  }, [buildingId, roomId]);

  useEffect(() => {
    fetchRoomAndStudents();
  }, [fetchRoomAndStudents]);

  const handleAddStudent = async (sssnToAdd: string) => {
    if (!buildingId || !roomId || !sssnToAdd) return;

    try {
      setStudentActionLoading(true);
      setStudentError(null);
      await addStudentToRoom(buildingId, roomId, sssnToAdd);
      toast.success(`Đã thêm sinh viên vào phòng.`);
      setOpenCombobox(false);
      await fetchRoomAndStudents(); 
    } catch (error: any) {
      // Lấy message chi tiết từ Backend (VD: Lệch giới tính)
      const message = error?.response?.data?.message || error?.message || 'Không thể thêm sinh viên.';
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
      toast.error('Vui lòng chọn sinh viên hợp lệ để xóa.');
      return;
    }
    try {
      setStudentActionLoading(true);
      await removeStudentFromRoom(buildingId, roomId, trimmedSssn);
      toast.success('Đã xóa sinh viên khỏi phòng.');
      setSssnToRemove('');
      await fetchRoomAndStudents();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.error || 'Không thể xóa sinh viên khỏi phòng.';
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
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-semibold">Students in this room</h2>
                        
                        {/* --- HIỂN THỊ BADGE GIỚI TÍNH --- */}
                        {roomGender === 'male' && (
                            <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold uppercase border border-blue-200">
                            Male Room
                            </span>
                        )}
                        {roomGender === 'female' && (
                            <span className="px-2 py-1 rounded bg-pink-100 text-pink-700 text-xs font-bold uppercase border border-pink-200">
                            Female Room
                            </span>
                        )}
                        {roomGender === 'mixed' && (
                            <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-bold uppercase border border-gray-200">
                            Empty Room
                            </span>
                        )}
                    </div>
                    
                    <p className="text-sm text-gray-500">
                      Sĩ số: <strong>{students.length}/{room.max_num_of_students}</strong>
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-4 md:flex-row md:items-end w-full md:w-auto">
                    {/* --- ADD STUDENT --- */}
                    <div className="flex flex-col gap-1 w-full md:w-[300px]">
                      <label className="text-sm font-medium text-gray-700">Add Student</label>
                      <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className="w-full justify-between border-dashed border-gray-400 text-gray-600 hover:bg-gray-50"
                            disabled={studentActionLoading || students.length >= room.max_num_of_students}
                          >
                            {students.length >= room.max_num_of_students ? "Room is full" : "Search students..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="end">
                          <Command>
                            <CommandInput placeholder="Enter name or student ID..." />
                            <CommandList>
                              <CommandEmpty>{loadingAvailable ? "Loading..." : "No results found."}</CommandEmpty>
                              <CommandGroup heading="Students without a room">
                                {availableStudents.map((student) => (
                                  <CommandItem
                                    key={student.student_id}
                                    value={removeAccents(`${student.first_name} ${student.last_name} ${student.student_id}`)}
                                    onSelect={() => handleAddStudent(student.sssn)}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{student.first_name} {student.last_name}</span>
                                      <span className="text-xs text-gray-500">ID: {student.student_id}</span>
                                    </div>
                                    <UserPlus className="ml-auto h-4 w-4 text-blue-600" />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* --- DELETE STUDENT --- */}
                    <div className="flex flex-col gap-1 w-full md:w-[250px]">
                      <label className="text-sm font-medium text-gray-700">Remove Student</label>
                      <div className="flex gap-2">
                        <select
                          value={sssnToRemove}
                          onChange={(e) => setSssnToRemove(e.target.value)}
                          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
                        >
                          <option value="">Select to remove...</option>
                          {students.map((s) => (
                            <option key={s.ssn} value={s.ssn}>{s.student_id} - {s.first_name} {s.last_name}</option>
                          ))}
                        </select>
                        <Button style={{ backgroundColor: '#d40000ff' }} size="icon" onClick={handleRemoveStudent} disabled={studentActionLoading || !sssnToRemove}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {studentError && (
                    <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center gap-2">
                        <span className="font-bold">⚠️</span> {studentError}
                    </div>
                )}
                
                {/* --- TABLE --- */}
                <div className="overflow-x-auto rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Student ID</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Full Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">CCCD</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Gender</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {students.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 italic">Chưa có sinh viên nào.</td></tr>
                      ) : (
                        students.map((s) => (
                          <tr key={s.ssn} className="hover:bg-blue-50 transition-colors group">
                            <td className="px-4 py-3 font-medium text-blue-900 cursor-pointer" onClick={() => navigate(`/students/view/${s.ssn}`)}>
                              {s.student_id}
                            </td>
                            <td className="px-4 py-3 font-medium">{s.first_name} {s.last_name}</td>
                            <td className="px-4 py-3 text-gray-500">{s.cccd}</td>
                            <td className="px-4 py-3 text-gray-500">{s.phone_numbers}</td>
                            <td className="px-4 py-3 text-gray-500">
                              {!s.sex ? (
                                <span className="text-gray-400">---</span>
                              ) : ['M', 'm', 'Male', 'male'].includes(s.sex) ? (
                                <span className="text-blue-600 font-medium">Male</span>
                              ) : (
                                <span className="text-pink-600 font-medium">Female</span>
                              )}
                            </td>
                            
                            <td className="px-4 py-3 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:bg-blue-100 hover:text-blue-800 h-8 px-2"
                                onClick={() => setStudentToTransfer(s)}
                              >
                                <ArrowRightLeft className="h-4 w-4 mr-1" /> Transfer
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <p className="text-red-500 font-medium text-center mt-10">Room not found.</p>
          )}
        </main>
      </div>
      
      {/* Modal Transfer render ở đây */}
      <TransferStudentDialog 
        isOpen={!!studentToTransfer} 
        onClose={() => setStudentToTransfer(null)} 
        student={studentToTransfer}
        onSuccess={() => fetchRoomAndStudents()}
      />
      
      <Footer />
    </div>
  );
};

export default ViewRoomPage;