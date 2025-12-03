import { FC, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

interface Props {
  globalQuery: string;
  setGlobalQuery: (val: string) => void;

  form: string;
  setForm: (val: string) => void;

  severity: string;
  setSeverity: (val: string) => void;

  status: string;
  setStatus: (val: string) => void;

  onClearAll: () => void;
}

const DisciplineFilter: FC<Props> = ({
  globalQuery,
  setGlobalQuery,
  form,
  setForm,
  severity,
  setSeverity,
  status,
  setStatus,
  onClearAll,
}) => {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const hasFilter =
    form !== '' || severity !== '' || status !== '' || globalQuery !== '';

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3">

        {/* Button: Bộ lọc */}
                <div 
          className='flex items-center gap-2 rounded-full border border-red-500 px-4 py-2 text-red-500'
        >
          <SlidersHorizontal size={18} />
        </div>

        {/* FORM (Action Type) */}
        <div className="relative">
          <button
            className={`rounded-full border px-4 py-2 ${
              form
                ? 'border-red-500 text-red-500'
                : 'border-gray-300 text-gray-700'
            }`}
            onClick={() =>
              setOpenFilter(openFilter === 'form' ? null : 'form')
            }
          >
            Form {form && '▾'}
          </button>

          {openFilter === 'form' && (
            <div className="absolute z-20 mt-2 w-60 rounded-md border bg-white shadow-md max-h-60 overflow-auto">
              {[
  "Cafeteria Duty",
  "Cleaning Duty",
  "Community Service",
  "Dorm Cleaning",
  "Library Service",
  "Yard Cleaning",
  "Classroom Setup",
  "Hall Monitoring",
  "Expulsion",
              ].map((f) => (
                <div
                  key={f}
                  onClick={() => {
                    setForm(f);
                    setOpenFilter(null);
                  }}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEVERITY */}
        <div className="relative">
          <button
            className={`rounded-full border px-4 py-2 ${
              severity
                ? 'border-red-500 text-red-500'
                : 'border-gray-300 text-gray-700'
            }`}
            onClick={() =>
              setOpenFilter(openFilter === 'severity' ? null : 'severity')
            }
          >
            Severity {severity && '▾'}
          </button>

          {openFilter === 'severity' && (
            <div className="absolute z-20 mt-2 w-48 rounded-md border bg-white shadow-md">
              {['Low', 'Medium', 'High', 'Expulsion'].map((s) => (
                <div
                  key={s}
                  onClick={() => {
                    setSeverity(s.toLowerCase());
                    setOpenFilter(null);
                  }}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* STATUS */}
        <div className="relative">
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
            Status {status && '▾'}
          </button>

          {openFilter === 'status' && (
            <div className="absolute z-20 mt-2 w-48 rounded-md border bg-white shadow-md">
              {['pending', 'active', 'completed', 'cancelled'].map((s) => (
                <div
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    setOpenFilter(null);
                  }}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEARCH */}
        <input
          placeholder="Search discipline..."
          className="ml-auto w-60 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-400"
          value={globalQuery}
          onChange={(e) => setGlobalQuery(e.target.value)}
        />
      </div>

      {/* ===== TAG ĐANG LỌC ===== */}
      {hasFilter && (
        <div className="mt-4">
          <div className="mb-2 text-sm font-semibold text-gray-700">
            Đang lọc theo
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {form && (
              <FilterTag
                label={`Form: ${form}`}
                onRemove={() => setForm('')}
              />
            )}

            {severity && (
              <FilterTag
                label={`Severity: ${severity}`}
                onRemove={() => setSeverity('')}
              />
            )}

            {status && (
              <FilterTag
                label={`Status: ${status}`}
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
              className="ml-2 text-sm font-medium text-blue-600 hover:underline"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisciplineFilter;

/* ===== TAG ===== */

const FilterTag: FC<{ label: string; onRemove: () => void }> = ({
  label,
  onRemove,
}) => {
  return (
    <span className="flex items-center gap-2 rounded-full border px-4 py-1 text-sm">
      {label}
      <button onClick={onRemove}>
        <X size={14} />
      </button>
    </span>
  );
};
