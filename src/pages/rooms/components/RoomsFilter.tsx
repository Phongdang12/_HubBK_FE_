// fileName: RoomsFilter.tsx
import { FC } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, BatteryWarning, BatteryFull, BatteryLow, Layers } from 'lucide-react';

export type SmartFilterType = 'all' | 'empty' | 'almost_full' | 'wasteful' | 'full';

interface Props {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeSmartFilter: SmartFilterType;
  setActiveSmartFilter: (val: SmartFilterType) => void;
  // Xóa các props không dùng nữa (selectedBuilding, selectedGender, allBuildings...)
}

const RoomsFilter: FC<Props> = ({ 
  searchQuery, setSearchQuery, 
  activeSmartFilter, setActiveSmartFilter
}) => {
  
  const FilterButton = ({ type, label, icon: Icon, colorClass }: any) => (
    <Button
      variant={activeSmartFilter === type ? 'default' : 'outline'}
      size="sm"
      onClick={() => setActiveSmartFilter(type)}
      className={`gap-2 ${activeSmartFilter === type ? `${colorClass} text-black` : 'text-gray-400 border-gray-300 hover:bg-gray-100'}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );

  return (
    <div className="space-y-4 mb-6 px-6">
      {/* Hàng 1: Chỉ còn Search Input */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder="Search Room ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 bg-white"
          />
        </div>
      </div>

      {/* Hàng 2: Smart Filters (Giữ nguyên) */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <span className="text-sm font-medium text-gray-500 mr-2 flex items-center gap-1">
          <Filter className="h-4 w-4" /> Quick Filters:
        </span>
        <FilterButton type="all" label="All" icon={Layers} colorClass="bg-gray-800 hover:bg-gray-700 text-black" />
        <FilterButton type="empty" label="Empty" icon={BatteryLow} colorClass="bg-green-600 hover:bg-green-700 text-black" />
        <FilterButton type="wasteful" label="Low Usage" icon={BatteryWarning} colorClass="bg-orange-500 hover:bg-orange-600 text-black" />
        <FilterButton type="almost_full" label="Almost Full" icon={BatteryFull} colorClass="bg-yellow-600 hover:bg-yellow-700 text-black" />
        <FilterButton type="full" label="Full" icon={BatteryFull} colorClass="bg-red-600 hover:bg-red-700 text-black" />
      </div>
    </div>
  );
};

export default RoomsFilter;