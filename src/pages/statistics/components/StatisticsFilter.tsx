import { ArrowRight } from 'lucide-react';
import CustomDatePicker from '@/components/ui/date-picker';
import { useEffect, useState } from 'react';
import { getOccupancyByBuilding } from '@/services/statisticsDashboard';

interface StatisticsFilterProps {
  startDate: string;
  endDate: string;
  buildingId: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onBuildingChange: (buildingId: string) => void;
  onDateBlur?: () => void;
  validationError?: string;
}

const StatisticsFilter = ({
  startDate,
  endDate,
  buildingId,
  onStartDateChange,
  onEndDateChange,
  onBuildingChange,
  onDateBlur,
  validationError,
}: StatisticsFilterProps) => {
  const [buildings, setBuildings] = useState<{ building: string }[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState(false);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setLoadingBuildings(true);
        const data = await getOccupancyByBuilding({});
        // Extract unique buildings from the data
        const uniqueBuildings = Array.from(
          new Set(data.map((item) => item.building)),
        ).map((building) => ({ building }));
        setBuildings(uniqueBuildings);
      } catch (error) {
        console.error('Error fetching buildings:', error);
        // Fallback to default buildings if API fails
        setBuildings([
          { building: 'BK001' },
          { building: 'BK002' },
          { building: 'BK003' },
          { building: 'BK004' },
        ]);
      } finally {
        setLoadingBuildings(false);
      }
    };
    fetchBuildings();
  }, []);

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getSubtitle = (): string => {
    let subtitle = '';
    if (!startDate && !endDate) {
      subtitle = 'Statistics for the last 30 days';
    } else if (startDate && endDate) {
      subtitle = `Statistics for ${formatDate(startDate)} – ${formatDate(endDate)}`;
    } else if (startDate) {
      subtitle = `Statistics from ${formatDate(startDate)}`;
    } else if (endDate) {
      subtitle = `Statistics until ${formatDate(endDate)}`;
    } else {
      subtitle = 'Statistics for the last 30 days';
    }

    if (buildingId) {
      subtitle += ` • Building: ${buildingId}`;
    }

    return subtitle;
  };

  return (
    <div className='mb-6 rounded-lg bg-white p-5 shadow-sm'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        {/* Left side: Title and Subtitle */}
        <div className='flex-1'>
          <h2 className='text-2xl font-bold text-gray-800'>Statistics</h2>
          <p className='mt-1 text-sm text-gray-600'>{getSubtitle()}</p>
          {validationError && (
            <p className='mt-2 text-sm text-red-600'>{validationError}</p>
          )}
        </div>

        {/* Right side: Filters - Responsive grid */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3 lg:flex lg:items-end lg:gap-3'>
          <div className='flex-1'>
            <CustomDatePicker
              id='start-date'
              label='Date From:'
              value={startDate}
              onChange={onStartDateChange}
              onBlur={onDateBlur}
              error={!!validationError}
              placeholder='dd/MM/yyyy'
            />
          </div>

          <div className='hidden items-center justify-center text-gray-400 lg:flex lg:pb-2'>
            <ArrowRight className='h-4 w-4' />
          </div>

          <div className='flex-1'>
            <CustomDatePicker
              id='end-date'
              label='Date To:'
              value={endDate}
              onChange={onEndDateChange}
              onBlur={onDateBlur}
              error={!!validationError}
              placeholder='dd/MM/yyyy'
            />
          </div>

          {/* Building Filter - Same structure as DateInput */}
          <div className='flex flex-col flex-1'>
            <label
              htmlFor='building-filter'
              className='mb-1 text-xs font-medium text-gray-600 whitespace-nowrap'
            >
              Building:
            </label>
            <select
              id='building-filter'
              value={buildingId}
              onChange={(e) => onBuildingChange(e.target.value)}
              className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
              style={{ zIndex: 10 }}
            >
              <option value=''>All Buildings</option>
              {buildings.map((b) => (
                <option key={b.building} value={b.building}>
                  {b.building}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsFilter;
