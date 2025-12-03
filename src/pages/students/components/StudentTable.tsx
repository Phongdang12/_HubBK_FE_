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
import { ArrowUpDown, ArrowUp, ArrowDown, UserPlus, Home, Eye, Trash2 } from "lucide-react";

interface StudentTableProps {
  students: Student[];
  onDelete: (id: string) => void;
  // 🔥 Thêm prop để xử lý gán phòng
  onAssign?: (student: Student) => void;
  
  // Props sort hiện tại của bạn
  sorts: {
    field: 'student_id' | 'faculty' | 'building_id' | 'room_id' | 'last_name'; 
    order: 'asc' | 'desc';
  }[];
  
  onSort: (
    field: 'student_id' | 'faculty' | 'building_id' | 'room_id' | 'last_name',
    e?: React.MouseEvent
  ) => void;

  globalQuery: string;
}

const StudentTable: FC<StudentTableProps> = ({
  students,
  onDelete,
  onAssign,
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
          <ArrowUp className="h-4 w-4 text-blue-600" />
        ) : order === 'desc' ? (
          <ArrowDown className="h-4 w-4 text-blue-600" />
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
            <TableHead className="p-0">
              {renderHeaderButton('Student ID', 'student_id')}
            </TableHead>

            <TableHead className="p-0">
              {renderHeaderButton('Full Name', 'last_name')}
            </TableHead>

            <TableHead className="p-0 hidden md:table-cell">
              {renderHeaderButton('Faculty', 'faculty')}
            </TableHead>

            {/* CỘT ROOM QUAN TRỌNG */}
            <TableHead className="p-0">
              {renderHeaderButton('Room', 'room_id')} 
            </TableHead>

            <TableHead className="p-0 hidden lg:table-cell">
              {renderHeaderButton('Building', 'building_id')}
            </TableHead>

            <TableHead>Status</TableHead>
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
            students.map((student) => {
               // Kiểm tra sinh viên có phòng hay chưa
               const hasRoom = !!student.room_id;

               return (
                <TableRow key={student.ssn} className="hover:bg-blue-50/30 transition-colors">
                  <TableCell className="font-semibold">{highlightText(student.student_id || '-')}</TableCell>
                  <TableCell>{highlightText(`${student.first_name} ${student.last_name}`)}</TableCell>
                  <TableCell className="hidden md:table-cell text-gray-600">{highlightText(student.faculty)}</TableCell>
                  
                  {/* 🔥 CỘT ROOM LOGIC MỚI */}
                  <TableCell>
                    {hasRoom ? (
                      // Nếu có phòng: Click để xem chi tiết
                      <div 
                        className="flex items-center gap-1.5 text-blue-600 font-medium cursor-pointer hover:underline group"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (student.building_id && student.room_id) {
                             navigate(`/rooms/view/${student.building_id}/${student.room_id}`);
                          }
                        }}
                        title="Click to view room details"
                      >
                        <Home className="h-3.5 w-3.5 group-hover:text-blue-800" />
                        {highlightText(student.room_id)}
                      </div>
                    ) : (
                      // Nếu chưa có phòng: Hiện nút Assign
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:text-orange-700 shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAssign) onAssign(student);
                        }}
                      >
                        <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                        Assign
                      </Button>
                    )}
                  </TableCell>
                  
                  <TableCell className="hidden lg:table-cell text-gray-500">{highlightText(student.building_id || '-')}</TableCell>

                  <TableCell>
                    <span
                      style={{
                        backgroundColor: student.study_status === 'Active' ? '#f6ffed' : '#f5f5f5',
                        color: student.study_status === 'Active' ? '#52c41a' : '#595959',
                        border: `1px solid ${student.study_status === 'Active' ? '#b7eb8f' : '#d9d9d9'}`,
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontWeight: 500,
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

                  <TableCell className='text-center'>
                    <div className="flex items-center justify-center gap-1">
                      <Button 
                        variant="ghost" 
                        size='icon' 
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleView(student)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost"
                        size='icon' 
                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                        onClick={() => handleDelete(student)}
                        title="Delete Student"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
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
          <>Do you want to delete student: <span className='font-semibold'>{selectedStudent?.first_name} {selectedStudent?.last_name}</span> ({selectedStudent?.student_id})?</>
        }
      />
    </div>
  );
};

export default StudentTable;