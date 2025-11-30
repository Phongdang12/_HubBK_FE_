import { FC } from 'react';
import { Room } from '@/services/roomsService';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
// ✅ Đổi sang dùng DropdownMenu (Thay vì Popover + Command)
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SortField } from '@/pages/rooms/Rooms';

interface Props {
  rooms: Room[];
  sortBy: SortField;
  sortOrder: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  
  selectedBuilding: string;
  setSelectedBuilding: (val: string) => void;
  allBuildings: string[];
  
  selectedGender: string;
  setSelectedGender: (val: string) => void;
}

const RoomsTable: FC<Props> = ({ 
  rooms, 
  sortBy, 
  sortOrder, 
  onSort,
  selectedBuilding,
  setSelectedBuilding,
  allBuildings,
  selectedGender,
  setSelectedGender
}) => {
  const navigate = useNavigate();

  const getProgressColor = (rate: number, current: number, max: number) => {
    if (current === 0) return 'bg-gray-300';
    if (current >= max) return 'bg-red-500';
    if (rate >= 80) return 'bg-yellow-500';
    if (rate <= 30) return 'bg-orange-400';
    return 'bg-green-500';
  };

  const renderGenderBadge = (gender?: string | null) => {
    const g = gender?.toUpperCase();
    if (g === 'M' || g === 'MALE') return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">Male</span>;
    if (g === 'F' || g === 'FEMALE') return <span className="px-2 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold border border-pink-200">Female</span>;
    return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">Empty</span>;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {/* --- Room ID (Sort) --- */}
          <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => onSort('room_id')}>
            <div className="flex items-center gap-1">
              Room ID {sortBy === 'room_id' && <ArrowUpDown className="h-3 w-3" />}
            </div>
          </TableHead>

          {/* --- Building (Filter - DropdownMenu) --- */}
          <TableHead>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("-ml-3 h-8 data-[state=open]:bg-accent", selectedBuilding !== 'all' && "text-blue-600")}
                >
                  <span>Building</span>
                  <Filter className={cn("ml-2 h-3 w-3", selectedBuilding !== 'all' ? "fill-blue-600" : "text-gray-400")} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuLabel>Filter by Building</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuCheckboxItem 
                  checked={selectedBuilding === 'all'}
                  onCheckedChange={() => setSelectedBuilding('all')}
                >
                  All Buildings
                </DropdownMenuCheckboxItem>
                
                {allBuildings.map((b) => (
                  <DropdownMenuCheckboxItem 
                    key={b}
                    checked={selectedBuilding === b}
                    onCheckedChange={() => setSelectedBuilding(b)}
                  >
                    {b}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableHead>

          {/* --- Gender (Filter - DropdownMenu) --- */}
          <TableHead>
            <div className="flex items-center gap-1">
              <span className="cursor-pointer hover:text-gray-900" onClick={() => onSort('gender')}>Gender</span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Filter className={cn("h-3 w-3", selectedGender !== 'all' ? "text-blue-600 fill-blue-600" : "text-gray-400")} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[180px]">
                  <DropdownMenuLabel>Filter Gender</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'M', label: 'Nam (Male)' },
                    { value: 'F', label: 'Nữ (Female)' },
                    { value: 'empty', label: 'Trống (Empty)' }
                  ].map((opt) => (
                    <DropdownMenuCheckboxItem
                      key={opt.value}
                      checked={selectedGender === opt.value}
                      onCheckedChange={() => setSelectedGender(opt.value)}
                    >
                      {opt.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TableHead>

          <TableHead>Capacity</TableHead>
          
          <TableHead className="w-[200px]" onClick={() => onSort('occupancy')}>
             <div className="flex items-center gap-1 cursor-pointer">
               Occupancy {sortBy === 'occupancy' && <ArrowUpDown className="h-3 w-3" />}
             </div>
          </TableHead>
          
          <TableHead>Status</TableHead>
          <TableHead className="text-center">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <TableRow key={`${room.building_id}-${room.room_id}`} className="hover:bg-gray-50">
              <TableCell className="font-medium">{room.room_id}</TableCell>
              <TableCell>{room.building_id}</TableCell>
              <TableCell>{renderGenderBadge(room.room_gender)}</TableCell>
              <TableCell>
                <span className="font-semibold">{room.current_num_of_students}</span>
                <span className="text-gray-400"> / {room.max_num_of_students}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 w-[180px]">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{room.occupancy_rate}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${getProgressColor(Number(room.occupancy_rate), room.current_num_of_students, room.max_num_of_students)}`} style={{ width: `${room.occupancy_rate}%` }}></div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                  room.room_status === 'Available' ? 'bg-green-500' : 
                  room.room_status === 'Occupied' ? 'bg-red-500' : 'bg-yellow-500'
                }`}>
                  {room.room_status}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <Button style={{ backgroundColor: '#1488DB' }} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8" onClick={() => navigate(`/rooms/view/${room.building_id}/${room.room_id}`)}>View</Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No rooms match your filter.</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default RoomsTable;