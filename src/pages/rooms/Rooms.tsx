import { useState, useEffect } from 'react';
import RoomFilter from './components/RoomsFilter';
import RoomTable from './components/RoomsTable';
import RoomDetailDialog from './components/RoomsDetailDialog';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import {
  Room,
  getAllRooms,
  getRoomsByBuilding,
  getUnderoccupiedRooms,
  getUnderoccupiedRoomsByBuilding,
} from '@/services/roomsService';
import { toast } from 'react-hot-toast';

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [mode] = useState<'all' | 'underoccupied'>('all');

  // ✅ Phân trang
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const handleSort = () => {
    const next = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(next);
  };

  const fetchRooms = async (currentMode: 'all' | 'underoccupied', currentBuilding: string) => {
    try {
      let data: Room[] = [];
      if (currentBuilding === 'all') {
        data = currentMode === 'all' ? await getAllRooms() : await getUnderoccupiedRooms();
      } else {
        data = currentMode === 'all' ? await getRoomsByBuilding(currentBuilding) : await getUnderoccupiedRoomsByBuilding(currentBuilding);
      }
      setRooms(data);
    } catch (error) {
      console.error('Fetch rooms error:', error);
      toast.error('Failed to fetch rooms');
    }
  };

  // Fetch rooms khi thay đổi mode/building
  useEffect(() => {
    fetchRooms(mode, selectedBuilding);
  }, [mode, selectedBuilding]);

  // Lọc + sort + phân trang
  useEffect(() => {
    let result = [...rooms];

    if (searchQuery) {
      result = result.filter((room) =>
        room.room_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortOrder === 'asc') {
      result.sort((a, b) => (a.room_id || '').localeCompare(b.room_id || ''));
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => (b.room_id || '').localeCompare(a.room_id || ''));
    }

    // ✅ Tính tổng trang
    setTotalPages(Math.ceil(result.length / limit));

    // ✅ Lấy dữ liệu trang hiện tại
    const start = (page - 1) * limit;
    const end = start + limit;
    setFilteredRooms(result.slice(start, end));
  }, [rooms, searchQuery, sortOrder, page, limit]);

  return (
    <div className='flex min-h-screen w-full flex-col'>
      <Header />
      <div className='flex flex-1'>
        <Sidebar />
        <main className='flex flex-1 flex-col justify-between bg-gray-100'>
          <div className='p-8'>
            <div className='rounded-xl bg-white pb-6 shadow-md'>
              <div className='sticky top-0 z-20 rounded-xl bg-white px-6 pt-7 pb-2'>
                <div className='flex items-center justify-between mb-5'>
                  <h2 className='text-xl font-semibold'>Room List</h2>
                </div>

                <RoomFilter
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onSearch={() => setPage(1)}
                />
              </div>

              <div className='mt-0 mx-6 h-[500px] overflow-y-auto rounded-md border'>
                <RoomTable
                  rooms={filteredRooms}
                  onView={(room) => {
                    setSelectedRoom(room);
                    setOpenDialog(true);
                  }}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  selectedBuilding={selectedBuilding}
                  setSelectedBuilding={setSelectedBuilding}
                  allBuildings={['BK001', 'BK002', 'BK003', 'BK004']}
                />

                {/* ✅ Pagination */}
                <div className='flex justify-center items-center mt-4 space-x-2'>
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className='px-3 py-1 border rounded disabled:opacity-50'
                  >
                    Prev
                  </button>
                  <span>
                    Page {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className='px-3 py-1 border rounded disabled:opacity-50'
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </main>
      </div>

      {selectedRoom && (
        <RoomDetailDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          room={selectedRoom}
        />
      )}
    </div>
  );
};

export default Rooms;
