import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  getStudentDetail,
  Student,
  updateStudent,
} from '@/services/studentService';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import SharedStudentForm from './components/SharedStudentForm';
import { toast } from 'react-hot-toast';

const EditStudentPage = () => {
  const { ssn } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!ssn) return;
      setLoading(true);
      try {
        const result = await getStudentDetail(ssn);
        setStudent(result);
      } catch (err) {
        console.error('Failed to fetch student detail:', err);
        toast.error('Failed to load student information.');
      } finally {
        setLoading(false);
      }
    })();
  }, [ssn]);

  const handleSubmit = async (data: Student) => {
  try {
    await updateStudent(ssn!, data);
    toast.success('Student updated successfully!');

    // ✅ Re-fetch để lấy bản mới nhất
    const refreshed = await getStudentDetail(ssn!);
    setStudent(refreshed);

    // ✅ Navigate về View sau 300ms
    setTimeout(() => navigate(`/students/view/${ssn}`), 300);
  } catch (err) {
    toast.error('Failed to update student');
  }
};

  return (
    <div className='flex min-h-screen w-full flex-col'>
      <Header />
      <div className='flex flex-1'>
        <Sidebar />
        <main className='flex-1 bg-gray-100 p-8'>
          {loading ? (
            <div>Loading...</div>
          ) : student ? (
            <SharedStudentForm student={student} mode='edit' onSubmit={handleSubmit} />
          ) : (
            <div>Student not found</div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default EditStudentPage;
