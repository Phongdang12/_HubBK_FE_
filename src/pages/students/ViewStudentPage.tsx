import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {Student } from '@/services/studentService';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import SharedStudentForm from './components/SharedStudentForm';
import { toast } from 'react-hot-toast';

const ViewStudentPage = () => {
  const { ssn } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!ssn) {
        setLoading(false);
        return;
      }
      try {
        // ✅ THÊM headers để xác thực (ví dụ: token JWT)
        const token = localStorage.getItem('authToken'); // Lấy token từ nơi lưu trữ

        const response = await fetch(`/api/students/${ssn}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Truyền token xác thực:
            ...(token && { Authorization: `Bearer ${token}` }), 
          },
        });

        // Bạn đã thêm logic kiểm tra status 401/404 trước đó
        if (!response.ok) {
          console.error(`❌ Lỗi HTTP khi tải sinh viên: ${response.status}`);
          
          // Xử lý lỗi 401: Chuyển hướng người dùng đến trang đăng nhập
          if (response.status === 401) {
             // Ví dụ: navigate('/login');
             toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          }

          setStudent(null); 
          return;
        }

        const detail = await response.json();
        setStudent(detail);
      } catch (error) {
        console.error('❌ Lỗi khi tải chi tiết sinh viên:', error);
        setStudent(null); 
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
