import React, { useMemo, useState, useEffect } from 'react';
import { Room, updateRoom, addStudentToRoom } from '@/services/roomsService';
import { getStudentsWithoutRoom, StudentOption } from '@/services/studentService';
import { Button } from '@/components/ui/button';
import EditField from '@/components/layout/EditField';
import SelectField from '@/components/layout/SelectField';
import { useNavigate } from 'react-router-dom';
import { DialogFooter } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { Check, ChevronsUpDown, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Props {
  room: Room;
  mode: 'view' | 'edit';
  onSubmit?: (data: Room) => Promise<void>;
}

const STATUS_OPTIONS: Room['room_status'][] = ['Available', 'Occupied', 'Under Maintenance'];
const MIN_RENTAL_PRICE = 10_000_000;
const RENTAL_PRICE_ERROR_MESSAGE = 'Giá phòng phải lớn hơn hoặc bằng 10 triệu VND. Vui lòng nhập lại.';

const removeAccents = (str: string) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
};

const SharedRoomForm: React.FC<Props> = ({ room, mode, onSubmit }) => {
  const navigate = useNavigate();
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  // Helper khởi tạo state
  const getInitialData = (data: Room): Room => ({
    ...data,
    building_id: data.building_id || '',
    room_id: data.room_id || '',
    max_num_of_students: data.max_num_of_students ?? 0,
    current_num_of_students: data.current_num_of_students ?? 0,
    occupancy_rate: Number(data.occupancy_rate ?? 0),
    rental_price: Number(data.rental_price ?? 0),
    room_status: (data.room_status as Room['room_status']) ?? 'Available',
  });

  const [formData, setFormData] = useState<Room>(getInitialData(room));

  // ✅ FIX: Reset state ngay khi prop 'room' thay đổi
  useEffect(() => {
    if (room) {
      setFormData(getInitialData(room));
    }
  }, [room]);

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Room, string>>>({});
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // --- States cho chức năng Thêm sinh viên ---
  const [openCombobox, setOpenCombobox] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<StudentOption[]>([]);
  const [selectedSssn, setSelectedSssn] = useState<string>("");
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setLoadingStudents(true);
      getStudentsWithoutRoom()
        .then((data) => {
          if (Array.isArray(data)) setAvailableStudents(data);
          else setAvailableStudents([]);
        })
        .catch((err) => console.error("Failed to load students:", err))
        .finally(() => setLoadingStudents(false));
    }
  }, [isEdit]);

  const expectedOccupancy = useMemo(() => {
    if (!formData.max_num_of_students) return 0;
    return Number(
      ((formData.current_num_of_students / formData.max_num_of_students) * 100).toFixed(2),
    );
  }, [formData.current_num_of_students, formData.max_num_of_students]);

  const handleChange = (field: keyof Room, value: any) => {
    if (field === 'current_num_of_students') return;
    setFormErrorMessage(null);
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setFormData((prev) => {
      if (field === 'max_num_of_students') {
        const maxVal = Number(value);
        return {
          ...prev,
          max_num_of_students: maxVal,
          occupancy_rate: prev.current_num_of_students && maxVal ? Number(((prev.current_num_of_students / maxVal) * 100).toFixed(2)) : 0,
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleAddStudentToRoom = async (sssn: string) => {
    if (!sssn) return;
    if (formData.current_num_of_students >= formData.max_num_of_students) {
      toast.error("Phòng đã đầy, không thể thêm sinh viên.");
      return;
    }
    try {
      // Dùng room.building_id thay vì formData để an toàn hơn
      const bId = room.building_id || formData.building_id;
      const rId = room.room_id || formData.room_id;
      
      await addStudentToRoom(bId, rId, sssn);
      toast.success(`Đã thêm sinh viên vào phòng thành công!`);
      
      const newCurrentCount = formData.current_num_of_students + 1;
      setFormData(prev => ({
        ...prev,
        current_num_of_students: newCurrentCount,
        occupancy_rate: prev.max_num_of_students ? Number(((newCurrentCount / prev.max_num_of_students) * 100).toFixed(2)) : 0
      }));
      setAvailableStudents(prev => prev.filter(s => s.sssn !== sssn));
      setSelectedSssn("");
      setOpenCombobox(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Lỗi khi thêm sinh viên.");
    }
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof Room, string>> = {};
    if (!Number.isInteger(formData.max_num_of_students) || formData.max_num_of_students <= 0 || formData.max_num_of_students < formData.current_num_of_students) {
      errors.max_num_of_students = 'Số lượng sinh viên tối đa không hợp lệ.';
    }
    if (formData.rental_price < MIN_RENTAL_PRICE) {
      errors.rental_price = RENTAL_PRICE_ERROR_MESSAGE;
    }
    if (!STATUS_OPTIONS.includes(formData.room_status)) {
      errors.room_status = 'Trạng thái phòng không hợp lệ.';
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setFormErrorMessage('Vui lòng kiểm tra lại thông tin phòng.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload: Room = { ...formData, occupancy_rate: expectedOccupancy };
      if (onSubmit) await onSubmit(payload);
      else {
        await updateRoom(payload.building_id, payload.room_id, payload);
        toast.success('Room updated successfully!');
      }
      navigate(`/rooms/view/${payload.building_id}/${payload.room_id}`);
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Failed to update room.';
      setFormErrorMessage(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg bg-white p-6 text-sm text-gray-700 shadow-md md:grid-cols-2">
      <div className="col-span-full mb-4 text-2xl font-semibold">
        {isEdit ? 'Edit Room Information' : 'Room Information'}
      </div>
      {formErrorMessage && (
        <div className="col-span-full rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formErrorMessage}
        </div>
      )}

      <EditField label="Building" value={room.building_id} isEditing={false} onChange={(v) => handleChange('building_id', v)} />
      <EditField label="Room ID" value={room.room_id} isEditing={false} onChange={(v) => handleChange('room_id', v)} />
      <EditField 
        label="Max number of students" value={String(formData.max_num_of_students)} type="number" 
        isEditing={isEdit} onChange={(v) => handleChange('max_num_of_students', Number(v))} 
        error={fieldErrors.max_num_of_students} 
      />

      <div className="col-span-full md:col-span-1">
         <EditField
          label="Current number of students" value={String(formData.current_num_of_students)} type="number"
          isEditing={false} onChange={() => undefined} error={fieldErrors.current_num_of_students}
        />
        
        {isEdit && formData.current_num_of_students < formData.max_num_of_students && (
          <div className="mt-2">
            <label className="mb-1 block text-xs font-medium text-gray-500">Add Student to Room</label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  role="combobox" 
                  aria-expanded={openCombobox} 
                  className="w-full justify-between border-dashed border-gray-400 text-gray-600 hover:bg-gray-50" 
                  disabled={loadingStudents}
                >
                  {loadingStudents ? "Loading..." : "Search by Student ID or Name..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search student ID or name..." />
                  <CommandList>
                    <CommandEmpty>No student found.</CommandEmpty>
                    <CommandGroup heading="Students without room">
                      {availableStudents.map((student) => (
                        <CommandItem 
                          key={student.sssn} 
                          value={removeAccents(`${student.first_name} ${student.last_name} ${student.student_id}`)}
                          onSelect={() => {
                            // ✅ Gọi hàm add student
                            handleAddStudentToRoom(student.sssn);
                            // ✅ Đóng popover ngay lập tức
                            setOpenCombobox(false);
                          }}
                          className="cursor-pointer pointer-events-auto" // ✅ Thêm class này để chắc chắn nhận chuột
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedSssn === student.sssn ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col">
                            <span className="font-medium">{student.first_name} {student.last_name}</span>
                            <span className="text-xs text-gray-500">ID: {student.student_id}</span>
                          </div>
                          <UserPlus className="ml-auto h-4 w-4 text-blue-600" />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <EditField label="Occupancy rate" value={`${expectedOccupancy}%`} isEditing={false} onChange={(v) => handleChange('occupancy_rate', v)} error={fieldErrors.occupancy_rate} />
      <EditField label="Rental price (VND)" value={String(formData.rental_price ?? 0)} type="number" isEditing={isEdit} onChange={(v) => handleChange('rental_price', Number(v))} error={fieldErrors.rental_price} min={MIN_RENTAL_PRICE} />
      <SelectField label="Room status" value={formData.room_status} options={STATUS_OPTIONS.map((status) => ({ label: status, value: status }))} isEditing={isEdit} onChange={(v) => handleChange('room_status', v)} error={fieldErrors.room_status} />

      <DialogFooter className="col-span-full mt-6 flex justify-end gap-3">
        {isView && (
          <Button 
            style={{ backgroundColor: '#032B91', color: 'white' }} 
            onClick={() => {
              // ✅ FIX 2: Sử dụng trực tiếp 'room' prop (source of truth) để navigate
              // Điều này tránh lỗi nếu state formData chưa kịp cập nhật
              if (room && room.building_id && room.room_id) {
                navigate(`/rooms/edit/${room.building_id}/${room.room_id}`);
              } else {
                console.error("Missing ID in room prop:", room);
                toast.error("Dữ liệu phòng bị thiếu ID, vui lòng tải lại trang.");
              }
            }}
          >
            Edit
          </Button>
        )}
        {isEdit && (
          <>
            <Button variant="outline" className="border-gray-400 text-gray-700 hover:bg-gray-100" onClick={() => navigate(`/rooms/view/${formData.building_id}/${formData.room_id}`)}>
              Cancel
            </Button>
            <Button style={{ backgroundColor: '#032B91', color: 'white' }} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </>
        )}
      </DialogFooter>
    </div>
  );
};

export default SharedRoomForm;