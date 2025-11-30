import { useState, useEffect, useMemo } from 'react';
import { getAllRooms, Room } from '@/services/roomsService';
import RoomsTable from '../rooms/components/RoomsTable';
import RoomsFilter, { SmartFilterType } from '../rooms/components/RoomsFilter';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { toast } from 'react-hot-toast';

export type SortField = 'room_id' | 'gender' | 'occupancy';

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // --- State Bộ lọc ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all'); // ✅ Mới
  const [activeSmartFilter, setActiveSmartFilter] = useState<SmartFilterType>('all');

  // --- State Sort ---
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState<SortField>('room_id');

  const [page, setPage] = useState(1);
  const [limit] = useState(8);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await getAllRooms();
        setRooms(data);
      } catch (error) {
        toast.error('Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const allBuildings = useMemo(() => {
    const buildings = new Set(rooms.map((r) => r.building_id));
    return Array.from(buildings).sort();
  }, [rooms]);

  // --- LOGIC LỌC & SORT ---
  const processedRooms = useMemo(() => {
    // 1. Lọc
    let result = rooms.filter((room) => {
      // Search Text
      const matchesSearch = room.room_id.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter Building
      const matchesBuilding = selectedBuilding === 'all' || room.building_id === selectedBuilding;

      // ✅ Filter Gender (Mới)
      let matchesGender = true;
      if (selectedGender !== 'all') {
        if (selectedGender === 'empty') {
          // Phòng trống = room_gender null hoặc undefined
          matchesGender = !room.room_gender;
        } else {
          // So sánh M hoặc F
          const g = room.room_gender?.toUpperCase();
          matchesGender = !!g && g.startsWith(selectedGender);
        }
      }

      // Filter Smart
      let matchesSmartFilter = true;
      const occupancy = Number(room.occupancy_rate);
      switch (activeSmartFilter) {
        case 'empty': matchesSmartFilter = room.current_num_of_students === 0; break;
        case 'full': matchesSmartFilter = room.current_num_of_students >= room.max_num_of_students; break;
        case 'almost_full': matchesSmartFilter = occupancy > 50 && room.current_num_of_students < room.max_num_of_students; break;
        case 'wasteful': matchesSmartFilter = room.current_num_of_students > 0 && occupancy <= 50; break;
        default: matchesSmartFilter = true;
      }

      return matchesSearch && matchesBuilding && matchesSmartFilter && matchesGender;
    });

    // 2. Sort
    result.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      switch (sortBy) {
        case 'room_id':
          valA = a.room_id || '';
          valB = b.room_id || '';
          break;
        case 'gender':
          // Quy đổi gender ra số để sort: Nam(1) -> Nữ(2) -> Trống(3)
          const getWeight = (g?: string | null) => {
             if (!g) return 3;
             if (g.toUpperCase().startsWith('M')) return 1;
             if (g.toUpperCase().startsWith('F')) return 2;
             return 3;
          };
          valA = getWeight(a.room_gender);
          valB = getWeight(b.room_gender);
          break;
        case 'occupancy':
          valA = Number(a.occupancy_rate || 0);
          valB = Number(b.occupancy_rate || 0);
          break;
        default:
          return 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [rooms, searchQuery, selectedBuilding, selectedGender, activeSmartFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(processedRooms.length / limit);
  const paginatedRooms = processedRooms.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedBuilding, selectedGender, activeSmartFilter]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-100 p-8">

          <div className="bg-white rounded-xl shadow-md pb-6">
            <div className="pt-6">
              <RoomsFilter 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery}
                activeSmartFilter={activeSmartFilter}
                setActiveSmartFilter={setActiveSmartFilter}
              />
            </div>

            <div className="mx-6 overflow-hidden rounded-md border">
              {loading ? (
                <div className="text-center py-10 text-gray-500">Loading rooms...</div>
              ) : (
                <>
                  <div className="h-[500px] overflow-y-auto">
                    {/* ✅ TRUYỀN PROPS LỌC XUỐNG TABLE */}
                    <RoomsTable 
                      rooms={paginatedRooms} 
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                      selectedBuilding={selectedBuilding}
                      setSelectedBuilding={setSelectedBuilding}
                      allBuildings={allBuildings}
                      selectedGender={selectedGender}
                      setSelectedGender={setSelectedGender}
                    />
                  </div>

                  {processedRooms.length > 0 && (
                    <div className="flex justify-center items-center p-4 border-t space-x-4 bg-gray-50">
                      <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50">Previous</button>
                      <span className="text-sm font-medium text-gray-600">Page {page} of {totalPages} ({processedRooms.length} rooms)</span>
                      <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50">Next</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Rooms;