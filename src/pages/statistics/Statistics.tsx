import { useEffect, useState } from 'react';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Toaster } from 'react-hot-toast';
import StatisticsFilter from './components/StatisticsFilter';
import KPICard from './components/KPICard';
import ChartCard from './components/ChartCard';
import StudentsByFacultyChart from './components/StudentsByFacultyChart';
import OccupancyByBuildingChart from './components/OccupancyByBuildingChart';
import DisciplineSummaryChart from './components/DisciplineSummaryChart';
import ViolationsOverTimeChart from './components/ViolationsOverTimeChart';
import DrillDownModal from './components/DrillDownModal';
import {
  getStatisticsOverview,
  getFacultyDistribution,
  getOccupancyByBuilding,
  getDisciplineSeverity,
  getViolationsTrend,
} from '@/services/statisticsDashboard';
import {
  Users,
  Home,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Statistics = () => {
  // Initialize with last 365 days (1 year) to cover all data
  const getDefaultDateRange = () => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    return {
      start: oneYearAgo.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    };
  };

  const defaultDates = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [buildingId, setBuildingId] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [violationPeriod, setViolationPeriod] = useState<string>('all');

  const handleViolationPeriodChange = (value: string) => {
    setViolationPeriod(value);

    // Không tự chỉnh date nếu chọn all/custom
    if (value === 'all' || value === 'custom') return;

    const now = new Date();
    const toStr = now.toISOString().split('T')[0];
    let fromDate = new Date(now);

    switch (value) {
      case '1week':
        fromDate.setDate(now.getDate() - 7);
        break;
      case '3weeks':
        fromDate.setDate(now.getDate() - 21);
        break;
      case '1month':
        fromDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3months':
        fromDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6months':
        fromDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1year':
        fromDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        return;
    }

    const fromStr = fromDate.toISOString().split('T')[0];
    setStartDate(fromStr);
    setEndDate(toStr);
  };

  // Statistics data
  const [overview, setOverview] = useState<any>(null);
  const [facultyDistribution, setFacultyDistribution] = useState<any[]>([]);
  const [occupancyByBuilding, setOccupancyByBuilding] = useState<any[]>([]);
  const [disciplineSeverity, setDisciplineSeverity] = useState<any[]>([]);
  const [violationsTrend, setViolationsTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Drill-down modal state
  const [drillDownModal, setDrillDownModal] = useState<{
    isOpen: boolean;
    type: 'students' | 'rooms' | 'disciplines';
    title: string;
    filters: any;
  }>({
    isOpen: false,
    type: 'students',
    title: '',
    filters: {},
  });

  // Validate date range
  const validateDateRange = (start: string, end: string): boolean => {
    if (!start || !end) {
      // If both empty, use default (last 30 days)
      if (!start && !end) {
        const defaultRange = getDefaultDateRange();
        setStartDate(defaultRange.start);
        setEndDate(defaultRange.end);
        return true;
      }
      // If only one is set, set the other
      if (start && !end) {
        setEndDate(new Date().toISOString().split('T')[0]);
        return true;
      }
      if (!start && end) {
        const endDateObj = new Date(end);
        const startDateObj = new Date(endDateObj);
        startDateObj.setFullYear(endDateObj.getFullYear() - 1);
        setStartDate(startDateObj.toISOString().split('T')[0]);
        return true;
      }
    }

    const startDateObj = new Date(start);
    const endDateObj = new Date(end);

    if (startDateObj > endDateObj) {
      setValidationError('Start date must be earlier than end date');
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    // Trigger refresh on date change
    if (date) {
      setTimeout(() => {
        loadStatistics();
      }, 300);
    }
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    // Trigger refresh on date change
    if (date) {
      setTimeout(() => {
        loadStatistics();
      }, 300);
    }
  };


  // Load statistics data
  const loadStatistics = async () => {
    if (!validateDateRange(startDate, endDate)) {
      return;
    }

    try {
      setLoading(true);

      // Determine actual dates to use
      let from = startDate;
      let to = endDate;

      if (!from && !to) {
        const defaultRange = getDefaultDateRange();
        from = defaultRange.start;
        to = defaultRange.end;
      } else if (from && !to) {
        to = new Date().toISOString().split('T')[0];
      } else if (!from && to) {
        const toDate = new Date(to);
        const fromDate = new Date(toDate);
        fromDate.setFullYear(toDate.getFullYear() - 1);
        from = fromDate.toISOString().split('T')[0];
      }

      // Build base query params with building filter
      const baseParams: { from?: string; to?: string; buildingId?: string } = {
        from,
        to,
      };
      if (buildingId) baseParams.buildingId = buildingId;

      const trendParams = {
        ...baseParams,
        period: violationPeriod,
      };

      // Fetch all statistics in parallel
      const [
        overviewData,
        facultyData,
        occupancyData,
        severityData,
        trendData,
      ] = await Promise.all([
        getStatisticsOverview(baseParams),
        getFacultyDistribution(baseParams),
        getOccupancyByBuilding(baseParams),
        getDisciplineSeverity(baseParams),
        getViolationsTrend(trendParams),
      ]);

      setOverview(overviewData);
      setFacultyDistribution(facultyData);
      setOccupancyByBuilding(occupancyData);
      setDisciplineSeverity(severityData || []);
      setViolationsTrend(trendData || []);
    } catch (error: any) {
      console.error('Error loading statistics:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to load statistics data';
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce API calls
    const timer = setTimeout(() => {
      loadStatistics();
    }, 300);

    return () => clearTimeout(timer);
  }, [startDate, endDate, buildingId, violationPeriod]);

  // Drill-down handlers
  const handleFacultyClick = (faculty: string) => {
    setDrillDownModal({
      isOpen: true,
      type: 'students',
      title: `Students in Faculty: ${faculty}`,
      filters: {
        faculty,
        from: startDate,
        to: endDate,
        buildingId,
        status: 'Active',
      },
    });
  };

  const handleBuildingClick = (building: string) => {
    setDrillDownModal({
      isOpen: true,
      type: 'rooms',
      title: `Rooms in Building: ${building}`,
      filters: {
        buildingId: building,
        from: startDate,
        to: endDate,
      },
    });
  };

  const handleSeverityClick = (severity: string) => {
    setDrillDownModal({
      isOpen: true,
      type: 'disciplines',
      title: `Disciplines with Severity: ${severity.toUpperCase()}`,
      filters: {
        severity,
        from: startDate,
        to: endDate,
        buildingId: buildingId || undefined, // Don't send empty string
      },
    });
  };

  const handleMonthClick = (month: string, year: string) => {
    // Convert month name to number (e.g., "Mar" -> "03")
    const monthMap: { [key: string]: string } = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    const monthNum = monthMap[month] || '01';
    const monthStr = `${year}-${monthNum}`;
    
    // Calculate first and last day of the month
    const firstDay = `${year}-${monthNum}-01`;
    // Get last day of the month: 
    // monthNum is 01-12 (string), Date constructor uses 0-11 (0-indexed)
    // To get last day of current month, use next month (parseInt(monthNum)) with day 0
    // Example: For March (monthNum="03"), use new Date(year, 3, 0) = last day of March
    const lastDayObj = new Date(parseInt(year), parseInt(monthNum), 0);
    // Format date as YYYY-MM-DD, avoiding timezone issues
    const lastDay = `${lastDayObj.getFullYear()}-${String(lastDayObj.getMonth() + 1).padStart(2, '0')}-${String(lastDayObj.getDate()).padStart(2, '0')}`;
    
    setDrillDownModal({
      isOpen: true,
      type: 'disciplines',
      title: `Violations in ${month} ${year}`,
      filters: {
        month: monthStr,
        buildingId: buildingId || undefined, // Don't send empty string
        from: firstDay,
        to: lastDay,
      },
    });
  };


  const handleKPIClick = (type: string) => {
    switch (type) {
      case 'students':
        setDrillDownModal({
          isOpen: true,
          type: 'students',
          title: 'All Active Students',
          filters: {
            from: startDate,
            to: endDate,
            buildingId,
            status: 'Active',
          },
        });
        break;
      case 'rooms':
        setDrillDownModal({
          isOpen: true,
          type: 'rooms',
          title: 'All Rooms',
          filters: {
            from: startDate,
            to: endDate,
            buildingId,
          },
        });
        break;
      case 'discipline':
        setDrillDownModal({
          isOpen: true,
          type: 'disciplines',
          title: 'Pending Disciplines',
          filters: {
            status: 'pending',
            from: startDate,
            to: endDate,
            buildingId,
          },
        });
        break;
      default:
        break;
    }
  };

  if (loading && !validationError) {
    return (
      <div className='flex min-h-screen w-full flex-col'>
        <Header />
        <div className='flex flex-1'>
          <Sidebar />
          <main className='flex flex-1 flex-col justify-between bg-gray-100'>
            <div className='flex items-center justify-center p-8'>
              <div className='text-center'>
                <div className='mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent'></div>
                <p className='text-gray-600'>Loading statistics...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!overview && !validationError) {
    return (
      <div className='flex min-h-screen w-full flex-col'>
        <Header />
        <div className='flex flex-1'>
          <Sidebar />
          <main className='flex flex-1 flex-col justify-between bg-gray-100'>
            <div className='flex items-center justify-center p-8'>
              <p className='text-red-600'>Failed to load statistics data</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen w-full flex-col'>
      <Toaster />
      <Header />
      <div className='flex flex-1'>
        <Sidebar />
        <main className='flex flex-1 flex-col justify-between bg-gray-100'>
          <div className='p-6 md:p-8'>
            {/* Filter Bar */}
            <StatisticsFilter
              startDate={startDate}
              endDate={endDate}
              buildingId={buildingId}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
              onBuildingChange={setBuildingId}
              onDateBlur={() => {
                // Refresh statistics when date input loses focus
                if (validateDateRange(startDate, endDate)) {
                  loadStatistics();
                }
              }}
              validationError={validationError}
            />

            {/* Show content only if no validation error and data loaded */}
            {!validationError && overview && (
              <>
                {/* Row 1: KPI Cards */}
                <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                  <div
                    onClick={() => handleKPIClick('occupancy')}
                    className='h-full cursor-pointer transition-transform hover:scale-105'
                  >
                    <KPICard
                      title='Occupancy Rate'
                      value={`${overview.occupancyRate.toFixed(1)}%`}
                      subtext={`Total Capacity: ${overview.totalCapacity}`}
                      icon={TrendingUp}
                      iconColor='bg-blue-600'
                      progress={{
                        value: overview.currentResidents,
                        max: overview.totalCapacity,
                      }}
                    />
                  </div>
                  <div
                    onClick={() => handleKPIClick('students')}
                    className='h-full cursor-pointer transition-transform hover:scale-105'
                  >
                    <KPICard
                      title='Total Students'
                      value={overview.totalStudents}
                      subtext='Currently enrolled'
                      icon={Users}
                      iconColor='bg-green-600'
                    />
                  </div>
                  <div
                    onClick={() => handleKPIClick('rooms')}
                    className='h-full cursor-pointer transition-transform hover:scale-105'
                  >
                    <KPICard
                      title='Available Rooms'
                      value={overview.availableRooms}
                      subtext='Rooms with available space'
                      icon={Home}
                      iconColor='bg-green-600'
                    />
                  </div>
                  <div
                    onClick={() => handleKPIClick('discipline')}
                    className='h-full cursor-pointer transition-transform hover:scale-105'
                  >
                    <KPICard
                      title='Pending Discipline'
                      value={overview.pendingDiscipline}
                      subtext='Need attention'
                      icon={AlertTriangle}
                      iconColor='bg-orange-600'
                    />
                  </div>
                </div>

                {/* Row 2: Students & Occupancy Charts */}
                <div className='mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2'>
                  <ChartCard
                    title='Student Distribution by Faculty'
                    subtext='Overview of student demographics by faculty'
                  >
                    <StudentsByFacultyChart
                      data={facultyDistribution}
                      onFacultyClick={handleFacultyClick}
                    />
                  </ChartCard>
                  <ChartCard
                    title='Occupancy by Building'
                    subtext='Current usage vs capacity for each building'
                  >
                    <OccupancyByBuildingChart
                      data={occupancyByBuilding}
                      onBuildingClick={handleBuildingClick}
                    />
                  </ChartCard>
                </div>

                {/* Row 3: Discipline Charts */}
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                  <ChartCard
                    title='Discipline Severity'
                    subtext='Distribution of violations by severity level'
                  >
                    <DisciplineSummaryChart
                      data={disciplineSeverity}
                      onSeverityClick={handleSeverityClick}
                    />
                  </ChartCard>
                  <ChartCard
                    title='Monthly Violation Trend'
                    subtext='Check if violations spike during exam periods or specific months'
                  >
                    <div className='mb-3 flex justify-end'>
                      <select
                        value={violationPeriod}
                        onChange={(e) => handleViolationPeriodChange(e.target.value)}
                        className='rounded-md border border-gray-300 bg-white px-3 py-1 text-xs md:text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40'
                      >
                        <option value='1week'>1 tuần gần nhất</option>
                        <option value='3weeks'>3 tuần gần nhất</option>
                        <option value='1month'>1 tháng gần nhất</option>
                        <option value='3months'>3 tháng gần nhất</option>
                        <option value='6months'>6 tháng gần nhất</option>
                        <option value='1year'>1 năm gần nhất</option>
                        <option value='all'>Tất cả thời gian</option>
                      </select>
                    </div>

                    <ViolationsOverTimeChart
                      data={violationsTrend}
                      onMonthClick={handleMonthClick}
                    />
                  </ChartCard>
                </div>
              </>
            )}
          </div>
          <Footer />
        </main>
      </div>

      {/* Drill-down Modal */}
      <DrillDownModal
        isOpen={drillDownModal.isOpen}
        onClose={() =>
          setDrillDownModal({ ...drillDownModal, isOpen: false })
        }
        type={drillDownModal.type}
        title={drillDownModal.title}
        filters={drillDownModal.filters}
      />
    </div>
  );
};

export default Statistics;
