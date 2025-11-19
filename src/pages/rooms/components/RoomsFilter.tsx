import { FC } from 'react';
import { Input } from '@/components/ui/input';
<<<<<<< HEAD
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
=======
import { Button } from '@/components/ui/button';
>>>>>>> quan0

interface Props {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
<<<<<<< HEAD
  selectedBuilding: string;
  setSelectedBuilding: (val: string) => void;
  sortOrder: 'none' | 'asc' | 'desc';
  setSortOrder: (val: 'none' | 'asc' | 'desc') => void;
}

const RoomFilter: FC<Props> = ({
  searchQuery,
  setSearchQuery,
  selectedBuilding,
  setSelectedBuilding,
  sortOrder,
  setSortOrder,
}) => (
  <div className='mb-4 flex flex-wrap items-center gap-4'>
=======
  onSearch: () => void; // callback khi nhấn nút Search
}

const RoomFilter: FC<Props> = ({ searchQuery, setSearchQuery, onSearch }) => (
  <div className='mb-4 flex items-center gap-2'>
>>>>>>> quan0
    <Input
      placeholder='Search by Room ID'
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className='w-64'
<<<<<<< HEAD
    />

    <Select
      value={sortOrder}
      onValueChange={(value) => setSortOrder(value as 'none' | 'asc' | 'desc')}
    >
      <SelectTrigger className='w-[140px] border'>
        <SelectValue placeholder='Sort Room ID' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='none'>No Sort</SelectItem>
        <SelectItem value='asc'>Room ID ↑</SelectItem>
        <SelectItem value='desc'>Room ID ↓</SelectItem>
      </SelectContent>
    </Select>

    <Select
      value={selectedBuilding}
      onValueChange={(value) => setSelectedBuilding(value)}
    >
      <SelectTrigger className='w-[180px] border'>
        <SelectValue placeholder='All Buildings' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>All Buildings</SelectItem>
        <SelectItem value='BK001'>BK001</SelectItem>
        <SelectItem value='BK002'>BK002</SelectItem>
        <SelectItem value='BK003'>BK003</SelectItem>
        <SelectItem value='BK004'>BK004</SelectItem>
      </SelectContent>
    </Select>
=======
      onKeyDown={(e) => e.key === 'Enter' && onSearch()}
    />
    <Button variant='secondary' onClick={onSearch}>
      Search
    </Button>
>>>>>>> quan0
  </div>
);

export default RoomFilter;
