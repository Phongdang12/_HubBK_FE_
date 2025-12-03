import { FC, useState } from "react";
import { Discipline, deleteDiscipline } from "@/services/disciplineService";
import { StudentOption } from "@/services/studentService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/layout/ConfirmDialog";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";

export type SortConfig = {
  key: keyof Discipline | 'student_id' | null;
  direction: 'asc' | 'desc';
};

interface Props {
  disciplines: Discipline[];
  onDeleteLocal: (action_id: string) => void;
  globalQuery: string;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  selectedSeverity: string;
  setSelectedSeverity: (val: string) => void;
  sortConfig: SortConfig;
  onSort: (key: keyof Discipline | 'student_id') => void;
  studentList: StudentOption[]; 
}

const DisciplineTable: FC<Props> = ({
  disciplines,
  onDeleteLocal,
  globalQuery,
  selectedStatus,
  setSelectedStatus,
  selectedSeverity,
  setSelectedSeverity,
  sortConfig,
  onSort,
  studentList,
}) => {
  const [selected, setSelected] = useState<Discipline | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const navigate = useNavigate();

  const handleView = (d: Discipline) => {
    navigate(`/disciplines/view/${d.action_id}`);
  };

  const handleDelete = (d: Discipline) => {
    setSelected(d);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    if (!selected?.action_id) return;
    try {
      await deleteDiscipline(selected.action_id);
      onDeleteLocal(selected.action_id);
      toast.success('Discipline deleted successfully!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
    setOpenDelete(false);
  };

  // Helper tìm SSN từ StudentID (MSSV) để điều hướng
  const getSsnFromStudentId = (studentId: string) => {
    if (!studentList) return null;
    const found = studentList.find(s => s.student_id === studentId);
    return (found as any)?.sssn || (found as any)?.ssn || null;
  };

  // Xử lý click chuyển trang
  const handleViewStudent = (e: React.MouseEvent, studentId: string) => {
    e.stopPropagation();
    if (!studentId) return;
    
    const ssn = getSsnFromStudentId(studentId);
    if (ssn) {
      navigate(`/students/view/${ssn}`);
    } else {
      toast.error(`Không tìm thấy hồ sơ sinh viên: ${studentId}`);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const severityOptions = [
    { value: 'all', label: 'All' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'expulsion', label: 'Expulsion' }
  ];

  const highlightText = (text: string) => {
    if (!globalQuery || !text) return text;
    const regex = new RegExp(`(${globalQuery})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      part.toLowerCase() === globalQuery.toLowerCase() ? (
        <span key={index} style={{ backgroundColor: '#FFE066', fontWeight: 600, padding: '2px 4px', borderRadius: '4px' }}>{part}</span>
      ) : part
    );
  };

  const renderSortableHeader = (label: string, key: keyof Discipline | 'student_id') => (
    <Button
      variant="ghost"
      onClick={() => onSort(key)}
      className="w-full h-full flex items-center justify-center gap-2 font-semibold text-gray-700 hover:bg-gray-200 rounded-none"
    >
      {label}
      {sortConfig.key === key ? (
        sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
      ) : <ArrowUpDown className="h-4 w-4 opacity-50" />}
    </Button>
  );

  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="text-center font-semibold p-0 w-[140px]">{renderSortableHeader('Action ID', 'action_id')}</TableHead>
            <TableHead className="text-center font-semibold p-0 w-[140px]">{renderSortableHeader('Student ID', 'student_id')}</TableHead>
            <TableHead className="text-center font-semibold p-0 w-[140px]">{renderSortableHeader('Form', 'action_type')}</TableHead>
            
            <TableHead className="font-semibold px-2">
              <div className="flex items-center justify-center">
                <span className="mr-1">Severity</span>
                <Select value={selectedSeverity} onValueChange={(value) => setSelectedSeverity(value)}>
                  <SelectTrigger className="h-8 w-8 border-none bg-transparent shadow-none" />
                  <SelectContent>{severityOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </TableHead>

            <TableHead className="font-semibold px-2">
              <div className="flex items-center justify-center">
                <span className="mr-1">Status</span>
                <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
                  <SelectTrigger className="h-8 w-8 border-none bg-transparent shadow-none" />
                  <SelectContent>{statusOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </TableHead>

            <TableHead className="text-center font-semibold">Decision Date</TableHead>
            <TableHead className="text-center font-semibold w-[160px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {disciplines.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="py-6 text-center text-gray-500">No data</TableCell></TableRow>
          ) : (
            disciplines.map((d) => (
              <TableRow key={d.action_id} className="hover:bg-gray-50 transition">
                <TableCell className="text-center">{highlightText(d.action_id)}</TableCell>

                {/* 🔥 CỘT STUDENT ID: ĐƠN GIẢN HÓA, CHỈ CLICK LINK */}
                <TableCell className="text-center">
                  <div 
                    className="flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium group"
                    onClick={(e) => handleViewStudent(e, d.student_id)}
                    title="Bấm để xem chi tiết sinh viên"
                  >
                    {highlightText(d.student_id || '-')}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TableCell>

                <TableCell className="text-center">{highlightText(d.action_type)}</TableCell>
                <TableCell className="text-center">{highlightText(d.severity_level)}</TableCell>
                <TableCell className="text-center">{highlightText(d.status)}</TableCell>
                <TableCell className="text-center">{d.decision_date}</TableCell>

                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button size="sm" style={{ backgroundColor: '#1488DB', color: 'white' }} onClick={() => handleView(d)}>View</Button>
                    <Button size="sm" style={{ backgroundColor: '#e53935', color: 'white' }} onClick={() => handleDelete(d)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={openDelete} onOpenChange={setOpenDelete} title="Confirm deletion"
        onConfirm={confirmDelete} message={<>Delete Discipline with Action ID: <b>{selected?.action_id}</b> ?</>}
      />
    </div>
  );
};

export default DisciplineTable;