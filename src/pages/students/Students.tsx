import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Student, getPaginatedStudents } from '@/services/studentService';
import StudentTable from './components/StudentTable';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/auth/useAuth';
import { Button } from '@/components/ui/button';

const StudentsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [ssnFilter, setSsnFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 // ✅ Phân trang
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ Sort state cho faculty
  type SortField = 'student_id' | 'faculty' | 'building_id';
  const [sorts, setSorts] = useState<{ field: SortField; order: 'asc' | 'desc' }[]>([
    { field: 'student_id', order: 'asc' },
  ]);

  const navigate = useNavigate();

  const toggleSort = (field: SortField) => {
    setSorts((prev) => {
      const existing = prev.find((s) => s.field === field);
      const nextOrder = existing?.order === 'asc' ? 'desc' : 'asc';
      const remaining = prev.filter((s) => s.field !== field);
      return [{ field, order: existing ? nextOrder : 'asc' }, ...remaining];
    });
  };

  const fetchStudentsData = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPaginatedStudents(pageNum, limit);
      const fixedData = res.data.map((s: any) => ({
        ...s,
        ssn: s.sssn || s.ssn,
      }));

      setStudents(fixedData);
      setFilteredStudents(fixedData);
      setTotalPages(res.pagination.totalPages);
    } catch (error: any) {
      console.error('Error fetching students data:', error);
      setError(error.message || 'Failed to fetch students data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (isAuthenticated) fetchStudentsData(page);
}, [isAuthenticated, user, page]);


  // ✅ Filter + sort
  useEffect(() => {
    let filtered: Student[] = [];

    filtered = students.filter((student) => {
      const matchesSsn =
        !ssnFilter ||
        (student?.ssn || '')
          .toLowerCase()
          .includes(ssnFilter.toLowerCase());

      return (
        matchesSsn
      );
    });

    // 🔹 Sort faculty
    if (sorts.length > 0) {
      filtered.sort((a, b) => {
        for (const { field, order } of sorts) {
          const valA = ((a as any)[field] || '').toString().toLowerCase();
          const valB = ((b as any)[field] || '').toString().toLowerCase();
          if (valA < valB) return order === 'asc' ? -1 : 1;
          if (valA > valB) return order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredStudents(filtered);
  }, [students, ssnFilter, sorts]);

  const handleDelete = (id: string) => {
    setStudents((prev) => prev.filter((s) => s?.ssn !== id));
  };

  // 🧭 Hàm điều hướng sang trang thêm sinh viên
  const handleAddStudent = () => {
    navigate('/students/add');
  };

  return (
    <div className='flex min-h-screen w-full flex-col'>
      <Header />
      <div className='flex flex-1'>
        <Sidebar />
        <main className='flex flex-1 flex-col justify-between bg-gray-100'>
          <div className='p-8'>
            <div className='rounded-lg bg-white pb-6 shadow-md'>
              <div className='sticky top-0 z-20 rounded-lg bg-white px-6 pt-6 pb-2'>
                {/* 🔹 Header có tiêu đề + nút Add Student */}
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4'>
                  <h2 className='text-xl font-semibold'>Students List</h2>
                  <div className='flex flex-1 items-center gap-3 md:justify-end'>
                    <input
                      placeholder='Search by SSN'
                      className='w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none md:w-64'
                      value={ssnFilter}
                      onChange={(e) => setSsnFilter(e.target.value)}
                    />
                    <Button
                      style={{ backgroundColor: '#032B91' }}
                      onClick={handleAddStudent}
                    >
                      + Add Student
                    </Button>
                  </div>
                </div>
              </div>

              <div className='mx-6 rounded-md border'>
                {loading ? (
                  <div className='p-8 text-center'>Loading students...</div>
                ) : error ? (
                  <div className='p-8 text-center text-red-600'>
                    <div>Error: {error}</div>
                    <button
                      onClick={() => fetchStudentsData(page)}
                      className='mt-3 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
  <>
    <StudentTable
      students={filteredStudents}
      onDelete={handleDelete}
      sorts={sorts}
      onSort={(field) => toggleSort(field)}
    />

    <div className='flex justify-center items-center mt-4 space-x-2'>
      <button
        onClick={() => setPage((p) => Math.max(p - 1, 1))}
        disabled={page === 1}
        className='px-3 py-1 border rounded disabled:opacity-50'
      >
        Prev
      </button>
      <span>
        Page {page} / {totalPages}
      </span>
      <button
        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        disabled={page === totalPages}
        className='px-3 py-1 border rounded disabled:opacity-50'
      >
        Next
      </button>
    </div>
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
