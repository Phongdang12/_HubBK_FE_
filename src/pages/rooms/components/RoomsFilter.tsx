import { FC } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onSearch: () => void; // callback khi nhấn nút Search
}

const RoomFilter: FC<Props> = ({ searchQuery, setSearchQuery, onSearch }) => (
  <div className='mb-4 flex items-center gap-2'>
    <Input
      placeholder='Search by Room ID'
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className='w-64'
      onKeyDown={(e) => e.key === 'Enter' && onSearch()}
    />
    <Button variant='secondary' onClick={onSearch}>
      Search
    </Button>
  </div>
);

export default RoomFilter;
