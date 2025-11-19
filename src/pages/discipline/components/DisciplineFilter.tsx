// src/pages/discipline/components/DisciplineFilter.tsx

import { FC } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// Xóa imports Select không cần thiết
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  // Tìm kiếm theo Action ID hoặc SSSN
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

const DisciplineFilter: FC<Props> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className='mb-4 flex items-center justify-between'>
      
      {/* 🔍 Search Input & Button */}
      <div className='flex items-center gap-2'>
        <Input
          placeholder='Search by Action ID, SSSN...'
          className='w-64'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} 
        />
      </div>
      
      {/* ⚙️ Filters: CHỈ GIỮ LẠI FLEX CONTAINER (NHƯNG KHÔNG CÓ NỘI DUNG) */}
      <div className='flex items-center gap-2'>
        {/* Nội dung lọc đã chuyển sang DisciplineTable */}
      </div>
    </div>
  );
};

export default DisciplineFilter;