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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

interface StudentTableProps {
  students: Student[];
  onDelete: (id: string) => void;
  handleUpdate: (student: Student) => void;
  sorts: { field: 'faculty'; order: 'asc' | 'desc' }[];
  onSort: (field: 'faculty', e: React.MouseEvent) => void;
  selectedBuilding: string;
  setSelectedBuilding: (val: string) => void;
  allBuildings: string[];
}

const StudentTable: FC<StudentTableProps> = ({
  students,
  onDelete,
  sorts,
  onSort,
  selectedBuilding,
  setSelectedBuilding,
  allBuildings,
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

  const getSortOrder = (field: 'faculty') => {
    const found = sorts.find((s) => s.field === field);
    return found ? found.order : null;
  };

  return (
    <div>
      <Table>
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead>SSN</TableHead>
            <TableHead>Student ID</TableHead>
            <TableHead>Full Name</TableHead>

            {/* Sort Faculty */}
            <TableHead
              className='cursor-pointer select-none'
              onClick={(e) => onSort('faculty', e)}
            >
              <div className='flex items-center gap-1'>
                Faculty
                <span
                  className={`text-xs ${
                    getSortOrder('faculty') ? 'text-gray-600' : 'text-gray-300'
                  }`}
                >
                  {getSortOrder('faculty') === 'desc' ? '▼' : '▲'}
                </span>
              </div>
            </TableHead>

            <TableHead>Room</TableHead>

            {/* 🔹 Filter Building */}
            <TableHead>
              <div className='flex items-center gap-2'>
                <span>Building</span>
                <Select
                  value={selectedBuilding}
                  onValueChange={(value) => setSelectedBuilding(value)}
                >
                  <SelectTrigger className='flex h-8 w-8 items-center justify-center border-none bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0 focus:outline-none' />
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    {allBuildings.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                <TableCell>
                  {(student.first_name || '') + ' ' + (student.last_name || '')}
                </TableCell>
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

      {/* ❌ Đã loại bỏ StudentDetailDialog */}

      {/* ✅ Giữ ConfirmDialog */}
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
