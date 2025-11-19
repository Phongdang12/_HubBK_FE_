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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
interface Props {
  rooms: Room[];
  onView: (room: Room) => void;
  sortOrder?: 'none' | 'asc' | 'desc';
  onSort?: () => void;
  selectedBuilding?: string;
  setSelectedBuilding?: (val: string) => void;
  allBuildings?: string[];
}

const RoomTable: FC<Props> = ({
  rooms,
  onView,
  selectedBuilding,
  setSelectedBuilding,
  allBuildings
}) => {
  const navigate = useNavigate();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Room ID</TableHead>
<TableHead>
  <div className="flex items-center gap-2">
    <span>Building</span>

    <Select
      value={selectedBuilding}
      onValueChange={(value) => setSelectedBuilding?.(value)}
    >
      <SelectTrigger className="h-8 w-8 p-0 border rounded-md flex items-center justify-center"/>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {allBuildings?.map((b) => (
          <SelectItem key={b} value={b}>
            {b}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
</TableHead>


          <TableHead>Max Students</TableHead>
          <TableHead>Current Students</TableHead>
          <TableHead>Occupancy Rate</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {rooms.length > 0 ? (
          rooms.map((room, index) => (
            <TableRow key={index}>
              <TableCell>{room.room_id}</TableCell>
              <TableCell>{room.building_id}</TableCell>
              <TableCell>{room.max_num_of_students}</TableCell>
              <TableCell>{room.current_num_of_students}</TableCell>
              <TableCell>{room.occupancy_rate}</TableCell>

              {/* Status */}
              <TableCell>
                {room.room_status === 'Available' ? (
                  <span
                    style={{
                      backgroundColor: '#52C41A',
                      color: 'white',
                      borderRadius: '9999px',
                      padding: '4px 16px',
                      fontWeight: 600,
                      display: 'inline-block',
                    }}
                  >
                    Available
                  </span>
                ) : room.room_status === 'Occupied' ? (
                  <span
                    style={{
                      backgroundColor: '#e53935',
                      color: 'white',
                      borderRadius: '9999px',
                      padding: '4px 16px',
                      fontWeight: 600,
                      display: 'inline-block',
                    }}
                  >
                    Occupied
                  </span>
                ) : (
                  <span
                    style={{
                      backgroundColor: '#f5a623',
                      color: 'white',
                      borderRadius: '9999px',
                      padding: '4px 16px',
                      fontWeight: 600,
                      display: 'inline-block',
                    }}
                  >
                    Under Maintenance
                  </span>
                )}
              </TableCell>


              <TableCell className="text-center">
                <Button
                  size="sm"
                  variant="default"
                  className="!bg-blue-500 !text-white "
                  onClick={() => navigate(`/rooms/view/${room.building_id}/${room.room_id}`)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow key="no-data">
            <TableCell colSpan={7} className="text-center">
              No rooms found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default RoomTable;
