import { FC, useEffect, useRef, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

interface Props {
  globalQuery: string;
  setGlobalQuery: (val: string) => void;

  faculty: string;
  setFaculty: (val: string) => void;

  room: string;
  setRoom: (val: string) => void;

  building: string;
  setBuilding: (val: string) => void;

  status: string;
  setStatus: (val: string) => void;

  onClearAll: () => void;
}

const StudentFilter: FC<Props> = ({
  globalQuery,
  setGlobalQuery,
  faculty,
  setFaculty,
  room,
  setRoom,
  building,
  setBuilding,
  status,
  setStatus,
  onClearAll,
}) => {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(globalQuery);

  const filterRef = useRef<HTMLDivElement>(null);

  /* ================= DEBOUNCE SEARCH ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setGlobalQuery(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /* ================= CLOSE DROPDOWN WHEN CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasFilter =
    faculty !== '' ||
    room !== '' ||
    building !== '' ||
    status !== '' ||
    globalQuery !== '';

  return (
    <div className='mb-6' ref={filterRef}>
      <div className='flex flex-wrap items-center gap-3'>

        {/* ===== Button: Bộ lọc ===== */}
        <div 
          className='flex items-center gap-2 rounded-full border border-red-500 px-4 py-2 text-red-500'
        >
          <SlidersHorizontal size={18} />
        </div>

        {/* ===== FACULTY ===== */}
        <div className='relative'>
          <button
            className={`rounded-full border px-4 py-2 ${
              faculty
                ? 'border-red-500 text-red-500'
                : 'border-gray-300 text-gray-700'
            }`}
            onClick={() =>
              setOpenFilter(openFilter === 'faculty' ? null : 'faculty')
            }
          >
            Faculty
          </button>

          {openFilter === 'faculty' && (
            <div className='absolute z-20 mt-2 w-60 rounded-md border bg-white shadow-md max-h-60 overflow-auto'>
              {[
                'Information Technology',
                'Mechanical Engineering',
                'Computer Science',
                'Electronics and Telecommunications Engineering',
                'Civil Engineering',
                'Electrical Engineering',
                'Information Security',
                'Logistics and Supply Chain Management'
              ].map((f) => (
                <div
                  key={f}
                  onClick={() => {
                    setFaculty(f);
                    setOpenFilter(null);
                  }}
                  className='cursor-pointer px-4 py-2 hover:bg-gray-100'
                >
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== ROOM ===== */}
        <div className='relative'>
          <button
            className={`rounded-full border px-4 py-2 ${
              room
                ? 'border-red-500 text-red-500'
                : 'border-gray-300 text-gray-700'
            }`}
            onClick={() =>
              setOpenFilter(openFilter === 'room' ? null : 'room')
            }
          >
            Room
          </button>

          {openFilter === 'room' && (
            <div className='absolute z-20 mt-2 w-60 rounded-md border bg-white shadow-md max-h-60 overflow-auto'>
              {[
                'P.101','P.102','P.103','P.104',
                'P.201','P.202','P.203','P.204',
                'P.301','P.302','P.303','P.304',
                'P.401'
              ].map((r) => (
                <div
                  key={r}
                  onClick={() => {
                    setRoom(r);
                    setOpenFilter(null);
                  }}
                  className='cursor-pointer px-4 py-2 hover:bg-gray-100'
                >
                  {r}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== BUILDING ===== */}
        <div className='relative'>
          <button
            className={`rounded-full border px-4 py-2 ${
              building
                ? 'border-red-500 text-red-500'
                : 'border-gray-300 text-gray-700'
            }`}
            onClick={() =>
              setOpenFilter(openFilter === 'building' ? null : 'building')
            }
          >
            Building
          </button>

          {openFilter === 'building' && (
            <div className='absolute z-20 mt-2 w-48 rounded-md border bg-white shadow-md'>
              {['BK001', 'BK002', 'BK003', 'BK004'].map((b) => (
                <div
                  key={b}
                  onClick={() => {
                    setBuilding(b);
                    setOpenFilter(null);
                  }}
                  className='cursor-pointer px-4 py-2 hover:bg-gray-100'
                >
                  {b}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== STATUS ===== */}
        <div className='relative'>
          <button
            className={`rounded-full border px-4 py-2 ${
              status
                ? 'border-red-500 text-red-500'
                : 'border-gray-300 text-gray-700'
            }`}
            onClick={() =>
              setOpenFilter(openFilter === 'status' ? null : 'status')
            }
          >
            Status
          </button>

          {openFilter === 'status' && (
            <div className='absolute z-20 mt-2 w-48 rounded-md border bg-white shadow-md'>
              {['Active', 'Non_Active'].map((s) => (
                <div
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    setOpenFilter(null);
                  }}
                  className='cursor-pointer px-4 py-2 hover:bg-gray-100'
                >
                  {s.replace('_', ' ')}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== GLOBAL SEARCH (WITH CLEAR) ===== */}
        <div className='relative ml-auto'>
          <input
            placeholder='Search'
            className='w-64 rounded-full border border-gray-300 px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-red-400'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                setGlobalQuery('');
              }}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500'
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ===== ACTIVE FILTER TAGS ===== */}
      {hasFilter && (
        <div className='mt-4'>
          <div className='mb-2 text-sm font-semibold text-gray-700'>
            Đang lọc theo
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            {faculty && (
              <FilterTag label={`Faculty: ${faculty}`} onRemove={() => setFaculty('')} />
            )}
            {room && (
              <FilterTag label={`Room: ${room}`} onRemove={() => setRoom('')} />
            )}
            {building && (
              <FilterTag label={`Building: ${building}`} onRemove={() => setBuilding('')} />
            )}
            {status && (
              <FilterTag
                label={`Status: ${status.replace('_', ' ')}`}
                onRemove={() => setStatus('')}
              />
            )}
            {globalQuery && (
              <FilterTag
                label={`Search: ${globalQuery}`}
                onRemove={() => setGlobalQuery('')}
              />
            )}

            <button
              onClick={onClearAll}
              className='ml-2 text-sm font-medium text-blue-600 hover:underline'
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFilter;

/* ======================= TAG COMPONENT ======================= */
const FilterTag: FC<{ label: string; onRemove: () => void }> = ({
  label,
  onRemove,
}) => {
  return (
    <span className='flex items-center gap-2 rounded-full border px-4 py-1 text-sm'>
      {label}
      <button onClick={onRemove}>
        <X size={14} />
      </button>
    </span>
  );
};
