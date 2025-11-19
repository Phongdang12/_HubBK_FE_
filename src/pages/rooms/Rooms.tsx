import { useState, useEffect } from 'react';
<<<<<<< HEAD
import RoomHeader from './components/RoomsHeader';
=======
>>>>>>> quan0
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

<<<<<<< HEAD
  const [mode, setMode] = useState<'all' | 'underoccupied'>('all');

  const fetchRooms = async (
    currentMode: 'all' | 'underoccupied',
    currentBuilding: string,
  ) => {
    try {
      let data: Room[] = [];
      if (currentBuilding === 'all') {
        if (currentMode === 'all') {
          data = await getAllRooms();
        } else {
          data = await getUnderoccupiedRooms();
        }
      } else {
        if (currentMode === 'all') {
          data = await getRoomsByBuilding(currentBuilding);
        } else {
          data = await getUnderoccupiedRoomsByBuilding(currentBuilding);
        }
=======
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
>>>>>>> quan0
      }
      setRooms(data);
    } catch (error) {
      console.error('Fetch rooms error:', error);
      toast.error('Failed to fetch rooms');
    }
  };

<<<<<<< HEAD
=======
  // Fetch rooms khi thay đổi mode/building
>>>>>>> quan0
  useEffect(() => {
    fetchRooms(mode, selectedBuilding);
  }, [mode, selectedBuilding]);

<<<<<<< HEAD
=======
  // Lọc + sort + phân trang
>>>>>>> quan0
  useEffect(() => {
    let result = [...rooms];

    if (searchQuery) {
      result = result.filter((room) =>
<<<<<<< HEAD
        room.room_id?.toLowerCase().includes(searchQuery.toLowerCase()),
=======
        room.room_id?.toLowerCase().includes(searchQuery.toLowerCase())
>>>>>>> quan0
      );
    }

    if (sortOrder === 'asc') {
      result.sort((a, b) => (a.room_id || '').localeCompare(b.room_id || ''));
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => (b.room_id || '').localeCompare(a.room_id || ''));
    }

<<<<<<< HEAD
    setFilteredRooms(result);
  }, [rooms, searchQuery, sortOrder]);

  const handleModeToggle = () => {
    // Reset toàn bộ state về ban đầu
    setRooms([]);
    setFilteredRooms([]);
    setSearchQuery('');
    setSelectedBuilding('all');
    setSortOrder('none');
    setSelectedRoom(null);
    setOpenDialog(false);
    setMode((prev) => (prev === 'all' ? 'underoccupied' : 'all'));
  };
=======
    // ✅ Tính tổng trang
    setTotalPages(Math.ceil(result.length / limit));

    // ✅ Lấy dữ liệu trang hiện tại
    const start = (page - 1) * limit;
    const end = start + limit;
    setFilteredRooms(result.slice(start, end));
  }, [rooms, searchQuery, sortOrder, page, limit]);
>>>>>>> quan0

  return (
    <div className='flex min-h-screen w-full flex-col'>
      <Header />
      <div className='flex flex-1'>
        <Sidebar />
        <main className='flex flex-1 flex-col justify-between bg-gray-100'>
<<<<<<< HEAD
          <div className='px-8 py-6'>
            <RoomHeader />
            <div className='rounded-xl bg-white p-6 shadow-md'>
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-[20px] font-semibold'>
                  {mode === 'all'
                    ? 'All Rooms List'
                    : 'Underoccupied Rooms List'}
                </h2>
                <button
                  className='rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
                  onClick={handleModeToggle}
                >
                  {mode === 'all'
                    ? 'Show Underoccupied Rooms'
                    : 'Show All Rooms'}
                </button>
              </div>

              <RoomFilter
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedBuilding={selectedBuilding}
                setSelectedBuilding={setSelectedBuilding}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
              />
              <div className='mt-4 rounded-md border'>
=======
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
>>>>>>> quan0
                <RoomTable
                  rooms={filteredRooms}
                  onView={(room) => {
                    setSelectedRoom(room);
                    setOpenDialog(true);
                  }}
<<<<<<< HEAD
                />
=======
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
>>>>>>> quan0
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
