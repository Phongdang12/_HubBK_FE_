import React, { useState } from 'react';
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

const SharedRoomForm: React.FC<Props> = ({ room, mode, onSubmit }) => {
  const navigate = useNavigate();
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  // ================= Form State =================
  const [formData, setFormData] = useState<Room>({
    ...room,
    max_num_of_students: room.max_num_of_students ?? 0,
    current_num_of_students: room.current_num_of_students ?? 0,
    occupancy_rate: room.occupancy_rate ?? '',
    rental_price: room.rental_price ?? 0,
    room_status: room.room_status ?? 'Available',
  });

  const handleChange = (field: keyof Room, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ================= Save =================
  const handleSave = async () => {
    try {
      const payload: Room = {
        ...formData,
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
      toast.error(error.message || 'Failed to update room.');
    }
  };

  // ================= Render =================
  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg bg-white p-6 text-sm text-gray-700 shadow-md md:grid-cols-2">
      <div className="col-span-full mb-4 text-2xl font-semibold">
        {isEdit ? 'Edit Room Information' : 'Room Information'}
      </div>

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
      />

      <EditField
        label="Current number of students"
        value={String(formData.current_num_of_students)}
        type="number"
        isEditing={isEdit}
        onChange={(v) => handleChange('current_num_of_students', Number(v))}
      />

      <EditField
        label="Occupancy rate"
        value={String(formData.occupancy_rate)}
        isEditing={false} // thường là auto-calc
        onChange={(v) => handleChange('occupancy_rate', v)}
      />

      <EditField
        label="Rental price (VND)"
        value={String(formData.rental_price)}
        type="number"
        isEditing={isEdit}
        onChange={(v) => handleChange('rental_price', Number(v))}
      />

      <SelectField
        label="Room status"
        value={formData.room_status}
        options={[
          { label: 'Available', value: 'Available' },
          { label: 'Occupied', value: 'Occupied' },
          { label: 'Under Maintenance', value: 'Under Maintenance' },
        ]}
        isEditing={isEdit}
        onChange={(v) => handleChange('room_status', v)}
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
            >
              Save
            </Button>
          </>
        )}
      </DialogFooter>
    </div>
  );
};

export default SharedRoomForm;
