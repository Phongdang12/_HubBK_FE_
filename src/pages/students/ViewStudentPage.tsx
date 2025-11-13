import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getStudentDetail, Student } from '@/services/studentService';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import SharedStudentForm from './components/SharedStudentForm';

const ViewStudentPage = () => {
  const { ssn } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!ssn) return;
      try {
        // ✅ Gọi đúng API chi tiết sinh viên
        const detail = await getStudentDetail(ssn);
        setStudent(detail);
      } catch (error) {
        console.error('❌ Lỗi khi tải chi tiết sinh viên:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [ssn]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-100 p-8">
          {loading ? (
            <p className="text-gray-500 italic">Loading student information...</p>
          ) : student ? (
            <SharedStudentForm student={student} mode="view" />
          ) : (
            <p className="text-red-500 font-medium">Student not found.</p>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ViewStudentPage;
