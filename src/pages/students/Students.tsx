import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Student, getPaginatedStudents } from '@/services/studentService';
import StudentTable from './components/StudentTable';
import StudentFilter from './components/StudentFilter';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/auth/useAuth';
import { Button } from '@/components/ui/button';

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

  const [sorts, setSorts] = useState<
    { field: SortField; order: 'asc' | 'desc' }[]
  >([{ field: 'student_id', order: 'asc' }]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleSort = (field: SortField) => {
    setSorts((prev) => {
      // 1. Tìm xem cột này đã được sort chưa
      const existing = prev.find((s) => s.field === field);

      if (existing) {
        // 🟢 Nếu ĐANG sort cột này -> Đảo chiều (ASC <-> DESC)
        // ⚠️ Quan trọng: Trả về mảng chỉ chứa 1 phần tử này (loại bỏ các cột khác)
        return [{ field, order: existing.order === 'asc' ? 'desc' : 'asc' }];
      } else {
        // 🔵 Nếu CHƯA sort cột này -> Reset toàn bộ, chỉ sort cột mới (Mặc định ASC)
        return [{ field, order: 'asc' }];
      }
    });

    setPage(1); // Reset về trang 1 khi sort
  };

  // ================= FETCH DATA =================
  const fetchStudentsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Khi có search → lấy toàn bộ dữ liệu
      const res = await getPaginatedStudents(
  // Nếu đang search global thì lấy trang 1 (để tải hết), ngược lại dùng state 'page' hiện tại
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

  // Khi đổi filter → reset page về 1
  useEffect(() => {
    setPage(1);
  }, [facultyFilter, roomFilter, buildingFilter, statusFilter, globalQuery]);

  useEffect(() => {
    if (isAuthenticated) fetchStudentsData();
  }, [
    isAuthenticated,
    user,
    page,
    sorts,
    facultyFilter,
    roomFilter,
    buildingFilter,
    statusFilter,
    globalQuery,
  ]);

  const handleDelete = (id: string) => {
    setStudents((prev) => prev.filter((s) => s?.ssn !== id));
  };

  const handleAddStudent = () => {
    navigate('/students/add');
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

  // ========== CLIENT PAGINATION WHEN SEARCH ==========
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
            <div className="rounded-lg bg-white pb-6 shadow-md">
              <div className="sticky top-0 z-20 rounded-lg bg-white px-6 pt-6 pb-4">
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-xl font-semibold">
                    Students List
                  </h2>

                  <Button
                    style={{ backgroundColor: '#032B91' }}
                    onClick={handleAddStudent}
                  >
                    + Add Student
                  </Button>
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
/>

                    {/* PAGINATION LOGIC MỚI */}
                    {(globalQuery
                      ? filteredStudents.length > limit
                      : totalPages > 1) && (
                      <div className="mt-4 flex items-center justify-center space-x-2">
                        <button
                          onClick={() =>
                            setPage((p) => Math.max(p - 1, 1))
                          }
                          disabled={page === 1}
                          className="rounded border px-3 py-1 disabled:opacity-50"
                        >
                          Prev
                        </button>

                        <span>
                          Page {page} /{' '}
                          {globalQuery ? totalClientPages : totalPages}
                        </span>

                        <button
                          onClick={() =>
                            setPage((p) =>
                              Math.min(
                                p + 1,
                                globalQuery
                                  ? totalClientPages
                                  : totalPages
                              )
                            )
                          }
                          disabled={
                            page ===
                            (globalQuery
                              ? totalClientPages
                              : totalPages)
                          }
                          className="rounded border px-3 py-1 disabled:opacity-50"
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
    </div>
  );
};

export default StudentsPage;
