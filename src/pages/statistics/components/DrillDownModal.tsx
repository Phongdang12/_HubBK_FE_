import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  getStudentsForDrillDown,
  getRoomsForDrillDown,
  getDisciplinesForDrillDown,
  PaginatedResponse,
} from '@/services/statisticsDashboard';

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'students' | 'rooms' | 'disciplines';
  title: string;
  filters: {
    faculty?: string;
    severity?: string;
    status?: string;
    buildingId?: string;
    month?: string;
    from?: string;
    to?: string;
  };
}

const DrillDownModal = ({
  isOpen,
  onClose,
  type,
  title,
  filters,
}: DrillDownModalProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, page, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let response: PaginatedResponse<any>;

      switch (type) {
        case 'students':
          response = await getStudentsForDrillDown({
            ...filters,
            page,
            limit: 20,
          });
          break;
        case 'rooms':
          response = await getRoomsForDrillDown({
            ...filters,
            page,
            limit: 20,
          });
          break;
        case 'disciplines':
          response = await getDisciplinesForDrillDown({
            ...filters,
            page,
            limit: 20,
          });
          break;
        default:
          throw new Error('Unknown drill-down type');
      }

      setData(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Error fetching drill-down data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderTable = () => {
    if (type === 'students') {
      return (
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Student ID
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Name
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Faculty
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Building
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Room
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Status
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {data.map((student: any) => (
              <tr key={student.ssn || student.sssn}>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-900'>
                  {student.student_id || student.ssn || student.sssn}
                </td>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-900'>
                  {student.first_name} {student.last_name}
                </td>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                  {student.faculty || 'N/A'}
                </td>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                  {student.building_id || 'N/A'}
                </td>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                  {student.room_id || 'N/A'}
                </td>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                  {student.study_status || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (type === 'rooms') {
      return (
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Building
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Room
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Capacity
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Occupied
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Available
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Status
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {data.map((room: any, index: number) => (
              <tr key={`${room.building_id}-${room.room_id}-${index}`}>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-900'>
                  {room.building_id}
                </td>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-900'>
                  {room.room_id}
                </td>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                  {room.max_num_of_students}
                </td>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                  {room.current_num_of_students}
                </td>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                  {room.max_num_of_students - room.current_num_of_students}
                </td>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                  {room.room_status || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (type === 'disciplines') {
      return (
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Action ID
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Student SSN
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Type
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Severity
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Reason
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Decision Date
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700'>
                Status
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {data.map((discipline: any) => (
              <tr key={discipline.action_id}>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-900'>
                  {discipline.action_id}
                </td>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-900'>
                  {discipline.sssn || 'N/A'}
                </td>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                  {discipline.action_type || 'N/A'}
                </td>
                <td className='whitespace-nowrap px-4 py-3 text-sm'>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      discipline.severity_level === 'low'
                        ? 'bg-green-100 text-green-800'
                        : discipline.severity_level === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : discipline.severity_level === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {discipline.severity_level?.toUpperCase() || 'N/A'}
                  </span>
                </td>
                <td className='px-4 py-3 text-sm text-gray-600'>
                  {discipline.reason || 'N/A'}
                </td>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                  {discipline.decision_date
                    ? new Date(discipline.decision_date).toLocaleDateString()
                    : 'N/A'}
                </td>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                  {discipline.status || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return null;
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='relative w-full max-w-6xl max-h-[90vh] rounded-lg bg-white shadow-xl'>
        {/* Header */}
        <div className='sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4'>
          <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
          <button
            onClick={onClose}
            className='rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Content */}
        <div className='overflow-y-auto px-6 py-4' style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent'></div>
            </div>
          ) : error ? (
            <div className='py-12 text-center text-red-600'>{error}</div>
          ) : data.length === 0 ? (
            <div className='py-12 text-center text-gray-500'>No data found</div>
          ) : (
            <div className='overflow-x-auto'>{renderTable()}</div>
          )}
        </div>

        {/* Footer with Pagination */}
        {!loading && !error && data.length > 0 && (
          <div className='sticky bottom-0 flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4'>
            <div className='text-sm text-gray-600'>
              Showing {((page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className='rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Previous
              </button>
              <span className='text-sm text-gray-700'>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className='rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrillDownModal;

