import React, { useMemo, useState } from 'react';
import { Room, updateRoom } from '@/services/roomsService';
import { Button } from '@/components/ui/button';
import EditField from '@/components/layout/EditField';
import SelectField from '@/components/layout/SelectField';
import { useNavigate } from 'react-router-dom';
import { DialogFooter } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';

interface Props {
  room: Room;
  mode: 'view' | 'edit';
  onSubmit?: (data: Room) => Promise<void>;
}

const STATUS_OPTIONS: Room['room_status'][] = ['Available', 'Occupied', 'Under Maintenance'];
const MIN_RENTAL_PRICE = 10_000_000;
const RENTAL_PRICE_ERROR_MESSAGE =
  'Giá phòng phải lớn hơn hoặc bằng 10 triệu VND. Vui lòng nhập lại.';

const SharedRoomForm: React.FC<Props> = ({ room, mode, onSubmit }) => {
  const navigate = useNavigate();
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const [formData, setFormData] = useState<Room>({
    ...room,
    max_num_of_students: room.max_num_of_students ?? 0,
    current_num_of_students: room.current_num_of_students ?? 0,
    occupancy_rate: Number(room.occupancy_rate ?? 0),
    rental_price: Number(room.rental_price ?? 0),
    room_status: (room.room_status as Room['room_status']) ?? 'Available',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Room, string>>>({});
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const expectedOccupancy = useMemo(() => {
    if (!formData.max_num_of_students) return 0;
    return Number(
      ((formData.current_num_of_students / formData.max_num_of_students) * 100).toFixed(2),
    );
  }, [formData.current_num_of_students, formData.max_num_of_students]);

  const updateFieldError = (field: keyof Room, message?: string) => {
    setFieldErrors((prev) => {
      if (!message && !(field in prev)) return prev;
      const updated = { ...prev };
      if (message) updated[field] = message;
      else delete updated[field];
      return updated;
    });
  };

  const recalcOccupancy = (max: number, current: number) => {
    if (!max || max <= 0) return 0;
    return Number(((current / max) * 100).toFixed(2));
  };

  const handleChange = (field: keyof Room, value: any) => {
    if (field === 'current_num_of_students') {
      return;
    }
    setFormErrorMessage(null);
    updateFieldError(field as keyof Room, undefined);
    setFormData((prev) => {
      if (field === 'max_num_of_students') {
        const maxVal = Number(value);
        return {
          ...prev,
          max_num_of_students: maxVal,
          occupancy_rate: recalcOccupancy(maxVal, prev.current_num_of_students),
        };
      }
      if (field === 'current_num_of_students') {
        const currVal = Number(value);
        return {
          ...prev,
          current_num_of_students: currVal,
          occupancy_rate: recalcOccupancy(prev.max_num_of_students, currVal),
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof Room, string>> = {};

    if (
      !Number.isInteger(formData.max_num_of_students) ||
      formData.max_num_of_students <= 0 ||
      formData.max_num_of_students < formData.current_num_of_students
    ) {
      errors.max_num_of_students =
        'Số lượng sinh viên tối đa không hợp lệ. Vui lòng nhập số lớn hơn hoặc bằng số sinh viên hiện tại.';
    }

    if (
      !Number.isInteger(formData.current_num_of_students) ||
      formData.current_num_of_students < 0 ||
      formData.current_num_of_students > formData.max_num_of_students
    ) {
      errors.current_num_of_students = 'Số lượng sinh viên hiện tại không thể vượt quá số lượng tối đa.';
    }

    if (formData.rental_price < MIN_RENTAL_PRICE) {
      errors.rental_price = RENTAL_PRICE_ERROR_MESSAGE;
    }

    if (!STATUS_OPTIONS.includes(formData.room_status)) {
      errors.room_status = 'Trạng thái phòng không hợp lệ. Vui lòng chọn một trạng thái hợp lệ.';
    }

    if (Math.abs(formData.occupancy_rate - expectedOccupancy) > 0.01) {
      errors.occupancy_rate = 'Tỷ lệ chiếm dụng không chính xác, vui lòng kiểm tra lại.';
    }

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setFormErrorMessage('Vui lòng kiểm tra lại thông tin phòng và sửa các lỗi được chỉ ra.');
      return false;
    }

    setFieldErrors({});
    setFormErrorMessage(null);
    return true;
  };

  const mapServerErrors = (errors?: Array<{ field: string; message: string }>) => {
    if (!errors?.length) return;
    const mapped: Partial<Record<keyof Room, string>> = {};
    errors.forEach(({ field, message }) => {
      mapped[field as keyof Room] = message;
    });
    setFieldErrors(mapped);
    setFormErrorMessage('Vui lòng kiểm tra lại thông tin phòng và sửa các lỗi được chỉ ra.');
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại các trường bị lỗi.');
      return;
    }

    setSaving(true);
    try {
      const payload: Room = {
        ...formData,
        occupancy_rate: expectedOccupancy,
      };

      if (onSubmit) {
        await onSubmit(payload);
      } else {
        await updateRoom(payload.building_id, payload.room_id, payload);
        toast.success('Room updated successfully!');
      }

      navigate(`/rooms/view/${payload.building_id}/${payload.room_id}`);
    } catch (error: any) {
      console.error('Update failed:', error);
      mapServerErrors(error?.response?.data?.fieldErrors);
      const message =
        error?.response?.data?.error || error?.message || 'Failed to update room.';
      setFormErrorMessage(message);
      toast.error(message);
    }
    finally {
      setSaving(false);
    }
  };

  // ================= Render =================
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

      {/* BASIC */}
      <EditField
        label="Building"
        value={formData.building_id}
        isEditing={false}
        onChange={(v) => handleChange('building_id', v)}
      />

      <EditField
        label="Room ID"
        value={formData.room_id}
        isEditing={false}
        onChange={(v) => handleChange('room_id', v)}
      />

      <EditField
        label="Max number of students"
        value={String(formData.max_num_of_students)}
        type="number"
        isEditing={isEdit}
        onChange={(v) => handleChange('max_num_of_students', Number(v))}
        error={fieldErrors.max_num_of_students}
      />

      <EditField
        label="Current number of students"
        value={String(formData.current_num_of_students)}
        type="number"
        isEditing={isEdit}
        onChange={() => undefined}
        error={fieldErrors.current_num_of_students}
        readOnly
      />

      <EditField
        label="Occupancy rate"
        value={`${expectedOccupancy}%`}
        isEditing={false}
        onChange={(v) => handleChange('occupancy_rate', v)}
        error={fieldErrors.occupancy_rate}
      />

      <EditField
        label="Rental price (VND)"
        value={String(formData.rental_price ?? 0)}
        type="number"
        isEditing={isEdit}
        onChange={(v) => handleChange('rental_price', Number(v))}
        error={fieldErrors.rental_price}
        min={MIN_RENTAL_PRICE}
      />

      <SelectField
        label="Room status"
        value={formData.room_status}
        options={STATUS_OPTIONS.map((status) => ({
          label: status,
          value: status,
        }))}
        isEditing={isEdit}
        onChange={(v) => handleChange('room_status', v)}
        error={fieldErrors.room_status}
      />

      {/* FOOTER */}
      <DialogFooter className="col-span-full mt-6 flex justify-end gap-3">
        {isView && (
          <Button
            style={{ backgroundColor: '#032B91', color: 'white' }}
            onClick={() =>
              navigate(`/rooms/edit/${formData.building_id}/${formData.room_id}`)
            }
          >
            Edit
          </Button>
        )}

        {isEdit && (
          <>
            <Button
              variant="outline"
              className="border-gray-400 text-gray-700 hover:bg-gray-100"
              onClick={() =>
                navigate(`/rooms/view/${formData.building_id}/${formData.room_id}`)
              }
            >
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: '#032B91', color: 'white' }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </>
        )}
      </DialogFooter>
    </div>
  );
};

export default SharedRoomForm;
