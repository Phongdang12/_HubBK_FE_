// src/pages/discipline/components/DisciplineTable.tsx
import { FC, useState } from "react";
import { Discipline, deleteDiscipline } from "@/services/disciplineService";
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
import { // Import Select components
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; 

interface Props {
  disciplines: Discipline[];
  onDeleteLocal: (action_id: string) => void;
  // THÊM PROPS CHO HÀM SETTER VÀ STATE
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  selectedSeverity: string;
  setSelectedSeverity: (val: string) => void;
}

const DisciplineTable: FC<Props> = ({ 
  disciplines, 
  onDeleteLocal,
  // Nhận các props filter từ DisciplinesPage
  selectedStatus, 
  setSelectedStatus, 
  selectedSeverity, 
  setSelectedSeverity 
}) => {
  const [selected, setSelected] = useState<Discipline | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const navigate = useNavigate();

  const handleView = (d: Discipline) => {
    navigate(`/disciplines/view/${d.action_id}`);
  };

  const handleEdit = (d: Discipline) => {
    navigate(`/disciplines/edit/${d.action_id}`);
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
      toast.error(error?.response?.data?.message || "Xóa thất bại");
    }
    setOpenDelete(false);
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

  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="text-center font-semibold">Action ID</TableHead>
            <TableHead className="text-center font-semibold">Student SSN</TableHead>
            <TableHead className="text-center font-semibold">Form</TableHead>
            
            {/* THAY ĐỔI 1/4: COLUMN SEVERITY LEVEL (Bây giờ nằm trước Status) */}
            <TableHead className="font-semibold px-2">
                <div className="flex items-center justify-center">
                    <span className="mr-1">Severity Level</span>
                    <Select
                      value={selectedSeverity}
                      onValueChange={(value) => setSelectedSeverity(value)}
                    >
                      <SelectTrigger className='flex h-8 w-8 items-center justify-center border-none bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0 focus:outline-none'>
                      </SelectTrigger>
                      <SelectContent>
                        {severityOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
            </TableHead>
            
            {/* THAY ĐỔI 2/4: COLUMN STATUS (Bây giờ nằm sau Severity Level) */}
            <TableHead className="font-semibold px-2">
                <div className="flex items-center justify-center">
                    <span className="mr-1">Status</span>
                    <Select
                      value={selectedStatus}
                      onValueChange={(value) => setSelectedStatus(value)}
                    >
                      <SelectTrigger className='flex h-8 w-8 items-center justify-center border-none bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0 focus:outline-none'>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
            </TableHead>

            <TableHead className="text-center font-semibold">Decision Date</TableHead>
            <TableHead className="text-center font-semibold w-[160px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {disciplines.length === 0 ? (
            <TableRow>
              {/* Cập nhật colspan lên 7 (5 cột thường + 2 cột lọc) */}
              <TableCell colSpan={7} className="py-6 text-center text-gray-500"> 
                Không có dữ liệu
              </TableCell>
            </TableRow>
          ) : (
            disciplines.map((d) => (
              <TableRow
                key={d.action_id}
                className="hover:bg-gray-50 transition"
              >
                <TableCell className="text-center">{d.action_id}</TableCell>
                <TableCell className="text-center">{d.sssn}</TableCell>
                <TableCell className="text-center">{d.action_type}</TableCell>
                
                {/* THAY ĐỔI 3/4: CELL SEVERITY LEVEL */}
                <TableCell className="text-center">{d.severity_level}</TableCell>
                
                {/* THAY ĐỔI 4/4: CELL STATUS */}
                <TableCell className="text-center">{d.status}</TableCell>
                
                <TableCell className="text-center">{d.decision_date}</TableCell>

                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      style={{ backgroundColor: '#032B91', color: 'white' }}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => handleView(d)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 text-white hover:bg-red-700"
                      style={{ backgroundColor: '#e53935' }}
                      onClick={() => handleDelete(d)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Xác nhận xóa"
        onConfirm={confirmDelete} 
        message={
          <>
            Delete Discipline with Action ID: <b>{selected?.action_id}</b> ?
          </>
        }
      />
    </div>
  );
};

export default DisciplineTable;