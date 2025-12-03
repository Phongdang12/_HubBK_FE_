import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Student, getPaginatedStudents, getStudentsWithoutRoom } from '@/services/studentService';
import StudentTable from './components/StudentTable';
import StudentFilter from './components/StudentFilter';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/auth/useAuth';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react'; 
import { AssignRoomDialog } from './components/AssignRoomDialog';

const StudentsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);

  // ========== GLOBAL SEARCH ==========
  const [globalQuery, setGlobalQuery] = useState('');

  // ========== FILTER STATE ==========
  const [facultyFilter, setFacultyFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ========== PAGINATION ==========
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  // ========== MISSING ROOM STATE ==========
  const [missingRoomCount, setMissingRoomCount] = useState(0);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedStudentForAssign, setSelectedStudentForAssign] = useState<{ssn: string, name: string, sex: string} | null>(null);

  // ========== SORT ==========
  type SortField =
    | 'student_id'
    | 'faculty'
    | 'building_id'
    | 'room_id'
    | 'study_status'
    | 'ssn'
    | 'first_name'
    | 'last_name';

  // 🔥 THAY ĐỔI Ở ĐÂY:
  // Mặc định sắp xếp theo room_id ASC. 
  // Trong SQL, ASC sẽ đưa NULL (chưa có phòng) lên đầu danh sách.
  const [sorts, setSorts] = useState<
    { field: SortField; order: 'asc' | 'desc' }[]
  >([
    { field: 'room_id', order: 'asc' },      // Ưu tiên 1: Người chưa có phòng lên trước
    { field: 'student_id', order: 'asc' }    // Ưu tiên 2: Xếp theo MSSV
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleSort = (field: SortField) => {
    setSorts((prev) => {
      const existing = prev.find((s) => s.field === field);
      if (existing) {
        return [{ field, order: existing.order === 'asc' ? 'desc' : 'asc' }];
      } else {
        return [{ field, order: 'asc' }];
      }
    });
    setPage(1); 
  };

  // ================= FETCH DATA =================
  const fetchStudentsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getPaginatedStudents(
        globalQuery ? 1 : page,
        globalQuery ? 100000 : limit,
        {
          sorts,
          filters: {
            faculty: facultyFilter || undefined,
            room: roomFilter || undefined,
            building: buildingFilter || undefined,
            status: statusFilter || undefined,
          },
        }
      );

      const fixedData = res.data.map((s: any) => ({
        ...s,
        ssn: s.sssn || s.ssn,
      }));

      setStudents(fixedData);

      if (globalQuery) {
        setTotalPages(Math.ceil(fixedData.length / limit));
      } else {
        setTotalPages(res.pagination.totalPages);
      }

    } catch (error: any) {
      setError(error.message || 'Failed to fetch students data');
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH MISSING ROOM COUNT =================
  const fetchMissingRoomCount = async () => {
    try {
        const data = await getStudentsWithoutRoom();
        if (Array.isArray(data)) setMissingRoomCount(data.length);
    } catch (e) {
        console.error("Failed to count students without room", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
        fetchStudentsData();
        fetchMissingRoomCount();
    }
  }, [
    isAuthenticated,
    user,
    page,
    sorts, // Khi sorts thay đổi (mặc định ban đầu), nó sẽ fetch lại theo thứ tự mới
    facultyFilter,
    roomFilter,
    buildingFilter,
    statusFilter,
    globalQuery,
  ]);

  // Khi đổi filter → reset page về 1
  useEffect(() => {
    setPage(1);
  }, [facultyFilter, roomFilter, buildingFilter, statusFilter, globalQuery]);

  const handleDelete = (id: string) => {
    setStudents((prev) => prev.filter((s) => s?.ssn !== id));
    fetchMissingRoomCount();
  };

  const handleAddStudent = () => {
    navigate('/students/add');
  };

  // Xử lý mở Modal Gán Phòng
  const handleOpenAssignModal = (student: Student) => {
    if (!student.room_id) {
        setSelectedStudentForAssign({ 
            ssn: student.ssn, 
            name: `${student.first_name} ${student.last_name}`,
            sex: student.sex // Cần lấy giới tính để lọc phòng
        });
        setAssignModalOpen(true);
    }
  };

  // ========== GLOBAL SEARCH FILTER ==========
  const filteredStudents = students.filter((s) => {
    if (!globalQuery) return true;
    const q = globalQuery.toLowerCase();
    return (
      s.ssn?.toLowerCase().includes(q) ||
      s.student_id?.toLowerCase().includes(q) ||
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
      s.faculty?.toLowerCase().includes(q) ||
      s.room_id?.toLowerCase().includes(q) ||
      s.building_id?.toLowerCase().includes(q) ||
      s.study_status?.toLowerCase().includes(q)
    );
  });

  const start = (page - 1) * limit;
  const end = start + limit;
  const displayedStudents = globalQuery
    ? filteredStudents.slice(start, end)
    : filteredStudents;

  const totalClientPages = Math.ceil(filteredStudents.length / limit);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex flex-1 flex-col justify-between bg-gray-100">
          <div className="p-8">

            {/* BANNER CẢNH BÁO */}
            {missingRoomCount > 0 && (
                <div className="mb-6 flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-orange-100 p-2">
                            <AlertCircle className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="font-bold text-orange-800">Cần chú ý!</p>
                            <p className="text-sm text-orange-700">
                                Có <span className="font-bold text-lg">{missingRoomCount}</span> sinh viên hiện chưa được xếp phòng ký túc xá.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-lg bg-white pb-6 shadow-md">
              <div className="sticky top-0 z-20 rounded-lg bg-white px-6 pt-6 pb-4">
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-xl font-semibold">
                    Students List
                  </h2>

                  <div className="flex gap-2">
                    <Button
                        style={{ backgroundColor: '#032B91' }}
                        onClick={handleAddStudent}
                    >
                        + Add Student
                    </Button>
                  </div>
                </div>

                <StudentFilter
                  globalQuery={globalQuery}
                  setGlobalQuery={setGlobalQuery}
                  faculty={facultyFilter}
                  setFaculty={setFacultyFilter}
                  room={roomFilter}
                  setRoom={setRoomFilter}
                  building={buildingFilter}
                  setBuilding={setBuildingFilter}
                  status={statusFilter}
                  setStatus={setStatusFilter}
                  onClearAll={() => {
                    setGlobalQuery('');
                    setFacultyFilter('');
                    setRoomFilter('');
                    setBuildingFilter('');
                    setStatusFilter('');
                    setPage(1);
                    // Reset sort về mặc định để đưa SV chưa có phòng lên đầu lại
                    setSorts([{ field: 'room_id', order: 'asc' }, { field: 'student_id', order: 'asc' }]);
                  }}
                />
              </div>

              <div className="mx-6 rounded-md border">
                {loading ? (
                  <div className="p-8 text-center">
                    Loading students...
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-red-600">
                    {error}
                  </div>
                ) : (
                  <>
                    <StudentTable
                      students={displayedStudents}
                      onDelete={handleDelete}
                      sorts={sorts}
                      onSort={(field) => toggleSort(field)}
                      globalQuery={globalQuery}
                      onAssign={handleOpenAssignModal}
                    />

                    {/* PAGINATION */}
                    {(globalQuery
                      ? filteredStudents.length > limit
                      : totalPages > 1) && (
                      <div className="mt-4 flex items-center justify-center space-x-2 pb-4">
                        <button
                          onClick={() => setPage((p) => Math.max(p - 1, 1))}
                          disabled={page === 1}
                          className="rounded border px-3 py-1 disabled:opacity-50 hover:bg-gray-50"
                        >
                          Prev
                        </button>

                        <span className="text-sm font-medium">
                          Page {page} / {globalQuery ? totalClientPages : totalPages}
                        </span>

                        <button
                          onClick={() =>
                            setPage((p) =>
                              Math.min(
                                p + 1,
                                globalQuery ? totalClientPages : totalPages
                              )
                            )
                          }
                          disabled={
                            page === (globalQuery ? totalClientPages : totalPages)
                          }
                          className="rounded border px-3 py-1 disabled:opacity-50 hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <Footer />
        </main>
      </div>

      {/* MODAL GÁN PHÒNG */}
      {selectedStudentForAssign && (
        <AssignRoomDialog 
            isOpen={assignModalOpen}
            onClose={() => setAssignModalOpen(false)}
            studentSsn={selectedStudentForAssign.ssn}
            studentName={selectedStudentForAssign.name}
            studentSex={selectedStudentForAssign.sex}
            onSuccess={() => {
                fetchStudentsData();
                fetchMissingRoomCount();
            }}
        />
      )}

    </div>
  );
};

export default StudentsPage;