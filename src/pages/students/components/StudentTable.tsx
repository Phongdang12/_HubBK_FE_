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

interface StudentTableProps {
  students: Student[];
  onDelete: (id: string) => void;
  sorts: { field: 'student_id' | 'faculty' | 'building_id'; order: 'asc' | 'desc' }[];
  onSort: (field: 'student_id' | 'faculty' | 'building_id', e?: React.MouseEvent) => void;
}

const StudentTable: FC<StudentTableProps> = ({
  students,
  onDelete,
  sorts,
  onSort,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const navigate = useNavigate();

  // 🧭 View → chuyển trang
  const handleView = (student: Student) => {
    navigate(`/students/view/${student.ssn}`);
  };

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

  const getSortOrder = (field: 'student_id' | 'faculty' | 'building_id') => {
    const found = sorts.find((s) => s.field === field);
    return found ? found.order : null;
  };

  const renderSortIndicator = (field: 'student_id' | 'faculty' | 'building_id') => {
    const order = getSortOrder(field);
    if (!order) return null;
    return <span className='text-xs text-gray-600'>{order === 'desc' ? '▼' : '▲'}</span>;
  };

  return (
    <div>
      <Table>
        <TableHeader className='bg-gray-100'>
          <TableRow>
            <TableHead>SSN</TableHead>
            <TableHead>
              <button
                className='flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900'
                onClick={(e) => onSort('student_id', e)}
              >
                Student ID
                {renderSortIndicator('student_id') || (
                  <span className='text-xs text-gray-300'>▲</span>
                )}
              </button>
            </TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>
              <button
                className='flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900'
                onClick={(e) => onSort('faculty', e)}
              >
                Faculty
                {renderSortIndicator('faculty') || (
                  <span className='text-xs text-gray-300'>▲</span>
                )}
              </button>
            </TableHead>
            <TableHead>Room</TableHead>
            <TableHead>
              <button
                className='flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900'
                onClick={(e) => onSort('building_id', e)}
              >
                Building
                {renderSortIndicator('building_id') || (
                  <span className='text-xs text-gray-300'>▲</span>
                )}
              </button>
            </TableHead>
            <TableHead>Study Status</TableHead>
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
                <TableCell>{student.ssn}</TableCell>
                <TableCell>{student.student_id}</TableCell>
                <TableCell>{student.first_name + ' ' + student.last_name}</TableCell>
                <TableCell>{student.faculty}</TableCell>
                <TableCell>{student.room_id || 'None'}</TableCell>
                <TableCell>{student.building_id || 'None'}</TableCell>
                <TableCell>
                  {student.study_status === 'Active' ? (
                    <span
                      style={{
                        backgroundColor: '#52C41A',
                        color: 'white',
                        borderRadius: '9999px',
                        padding: '4px 16px',
                        fontWeight: 600,
                        display: 'inline-block',
                      }}
                    >
                      Active
                    </span>
                  ) : student.study_status === 'Non_Active' ? (
                    <span
                      style={{
                        backgroundColor: '#BEBEBE',
                        color: 'white',
                        borderRadius: '9999px',
                        padding: '4px 16px',
                        fontWeight: 600,
                        display: 'inline-block',
                      }}
                    >
                      Non Active
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className='flex gap-2'>
                  <Button
                    size='sm'
                    style={{ backgroundColor: '#1488DB' }}
                    onClick={() => handleView(student)}
                  >
                    View
                  </Button>
                  <Button
                    size='sm'
                    style={{ backgroundColor: '#e53935' }}
                    onClick={() => handleDelete(student)}
                  >
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
          <>
            Do you want to delete student with SSN:{' '}
            <span className='font-semibold'>{selectedStudent?.ssn}</span>?
          </>
        }
      />
    </div>
  );
};

export default StudentTable;
