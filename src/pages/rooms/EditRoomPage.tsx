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
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch room detail
  useEffect(() => {
    (async () => {
      if (!buildingId || !roomId) return;
      setLoading(true);
      try {
        const result = await getRoomDetail(buildingId, roomId);
        setRoom(result);
      } catch (err) {
        console.error('Failed to fetch room detail:', err);
        toast.error('Failed to load room information.');
      } finally {
        setLoading(false);
      }
    })();
  }, [buildingId, roomId]);

  // Handle form submit
const handleSubmit = async (data: Partial<Room>) => {
  try {
    await updateRoom(buildingId!, roomId!, data);
    toast.success("Room updated successfully");

    setTimeout(() => {
      navigate(`/rooms/view/${buildingId}/${roomId}`);
    }, 300);
  } catch {
    toast.error("Update failed");
  }
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
            <div>Room not found</div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default EditRoomPage;
