import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  getRoomDetail,
  Room,
  updateRoom,
} from '@/services/roomsService';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import SharedRoomForm from './components/SharedRoomForm';
import { toast } from 'react-hot-toast';

const EditRoomPage = () => {
  const { buildingId, roomId } = useParams<{ buildingId: string; roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch room detail
  useEffect(() => {
    (async () => {
      // ✅ SỬA: Kiểm tra chặt chẽ hơn (chặn cả chuỗi "undefined" do navigate sai tạo ra)
      if (!buildingId || !roomId || buildingId === 'undefined' || roomId === 'undefined') {
        console.error("Invalid Building ID or Room ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await getRoomDetail(buildingId, roomId);
        setRoom(result);
      } catch (err: any) {
        console.error('Failed to fetch room detail:', err);
        toast.error(err.message || 'Failed to load room information.');
      } finally {
        setLoading(false);
      }
    })();
  }, [buildingId, roomId]);

  // Handle form submit
  const handleSubmit = async (data: Room) => {
    // Gọi API update
    await updateRoom(data.building_id, data.room_id, data);
    toast.success("Room updated successfully");
  };

  return (
    <div className='flex min-h-screen w-full flex-col'>
      <Header />
      <div className='flex flex-1'>
        <Sidebar />
        <main className='flex-1 bg-gray-100 p-8'>
          {loading ? (
            <div>Loading...</div>
          ) : room ? (
            <SharedRoomForm room={room} mode='edit' onSubmit={handleSubmit} />
          ) : (
            <div className="text-red-500">
              Room not found or Invalid ID. <br/>
              Building: {buildingId}, Room: {roomId}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default EditRoomPage;