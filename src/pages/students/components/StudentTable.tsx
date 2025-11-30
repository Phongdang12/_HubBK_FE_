// fileName: StudentTable.tsx
import { FC, useState } from 'react';
import { deleteStudent, Student } from '@/services/studentService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/layout/ConfirmDialog';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
// 🆕 Import Icons
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface StudentTableProps {
  students: Student[];
  onDelete: (id: string) => void;
  
  // Props sort hiện tại của bạn (là mảng objects)
  sorts: {
    field: 'student_id' | 'faculty' | 'building_id' | 'room_id'; // Thêm room_id nếu cần
    order: 'asc' | 'desc';
  }[];
  
  onSort: (
    field: 'student_id' | 'faculty' | 'building_id' | 'room_id',
    e?: React.MouseEvent
  ) => void;

  globalQuery: string;
}

const StudentTable: FC<StudentTableProps> = ({
  students,
  onDelete,
  sorts,
  onSort,
  globalQuery,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const navigate = useNavigate();

  // ===== HELPER: Lấy hướng sort hiện tại của 1 trường =====
  const getSortOrder = (field: string) => {
    const found = sorts.find((s) => s.field === field);
    return found ? found.order : null;
  };

  // ===== HELPER: Render Header Button (Tái sử dụng) =====
  const renderHeaderButton = (label: string, field: any) => {
    const order = getSortOrder(field);
    
    return (
      <Button
        variant="ghost"
        onClick={(e) => onSort(field, e)}
        className="w-full h-full flex items-center gap-2 font-semibold text-gray-700 hover:bg-gray-200 rounded-none px-2 justify-start"
      >
        {label}
        {order === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : order === 'desc' ? (
          <ArrowDown className="h-4 w-4" />
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-50" />
        )}
      </Button>
    );
  };

  // ===== VIEW =====
  const handleView = (student: Student) => {
    navigate(`/students/view/${student.ssn}`);
  };

  // ===== DELETE =====
  const handleDelete = (student: Student) => {
    setSelectedStudent(student);
    setOpenDelete(true);
  };

  const confirmDelete = async (ssn: string) => {
    try {
      await deleteStudent(ssn);
      onDelete(ssn);
      toast.success('Student deleted successfully!');
    } catch (error: any) {
      toast.error(`Failed to delete student: ${error.message || ''}`);
    }
  };

  // ===== HIGHLIGHT =====
  const highlightText = (text: string | null | undefined) => {
    // 1. Thêm kiểm tra này để tránh lỗi .split() trên null
    if (!text) return ""; 

    if (!globalQuery) return text;
    
    const regex = new RegExp(`(${globalQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      part.toLowerCase() === globalQuery.toLowerCase() ? (
        <span
          key={index}
          style={{
            
            backgroundColor: '#FFE066',
            fontWeight: 600,
            padding: '2px 4px',
            borderRadius: '4px',
          }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };
  return (
    <div>
      <Table>
        <TableHeader className='bg-gray-100'>
          <TableRow>
            <TableHead>Internal ID</TableHead>
            
            {/* 🆕 STUDENT ID */}
            <TableHead className="p-0">
              {renderHeaderButton('Student ID', 'student_id')}
            </TableHead>

            <TableHead className="p-0">
              {renderHeaderButton('Full Name', 'last_name')}
            </TableHead>

            {/* 🆕 FACULTY */}
            <TableHead className="p-0">
              {renderHeaderButton('Faculty', 'faculty')}
            </TableHead>

            {/* 🆕 ROOM (Lưu ý: Backend cần hỗ trợ sort room_id) */}
            <TableHead className="p-0">
              {renderHeaderButton('Room', 'room_id')} 
            </TableHead>

            {/* 🆕 BUILDING */}
            <TableHead className="p-0">
              {renderHeaderButton('Building', 'building_id')}
            </TableHead>

            <TableHead>Residence Status</TableHead>
            <TableHead className='text-center'>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className='py-8 text-center'>
                <div className='text-gray-500'>No students found</div>
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.ssn}>
                <TableCell>{highlightText(student.ssn)}</TableCell>
                <TableCell>{highlightText(student.student_id || '-')}</TableCell>
                <TableCell>{highlightText(`${student.first_name} ${student.last_name}`)}</TableCell>
                <TableCell>{highlightText(student.faculty)}</TableCell>
                <TableCell>{highlightText(student.room_id || 'None')}</TableCell>
                <TableCell>{highlightText(student.building_id || 'None')}</TableCell>

                <TableCell>
                  <span
                    style={{
                      backgroundColor: student.study_status === 'Active' ? '#52C41A' : '#808080',
                      color: 'white',
                      borderRadius: '9999px',
                      padding: '4px 16px',
                      fontWeight: 600,
                      display: 'inline-block',
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {highlightText(
                      student.study_status === 'Active'
                        ? 'Active'
                        : student.study_status === 'Non_Active'
                        ? 'Non Active'
                        : '-'
                    )}
                  </span>
                </TableCell>

                <TableCell className='flex gap-2'>
                  <Button size='sm' style={{ backgroundColor: '#1488DB' }} onClick={() => handleView(student)}>
                    View
                  </Button>
                  <Button size='sm' style={{ backgroundColor: '#e53935' }} onClick={() => handleDelete(student)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Toaster />

      <ConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        onConfirm={async () => {
          if (selectedStudent?.ssn) await confirmDelete(selectedStudent.ssn);
          setOpenDelete(false);
        }}
        title='Confirm Deletion'
        message={
          <>Do you want to delete student with SSN: <span className='font-semibold'>{selectedStudent?.ssn}</span>?</>
        }
      />
    </div>
  );
};

export default StudentTable;