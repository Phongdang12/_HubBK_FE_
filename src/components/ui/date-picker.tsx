import { useState, useRef, useEffect } from 'react';
import ReactDatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  placeholder?: string;
}

/**
 * DatePicker component with dd/MM/yyyy format
 * Supports manual typing and calendar picker
 * Fixed: No focus loss when typing - input is completely independent
 */
const CustomDatePicker = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder = 'dd/MM/yyyy',
}: DatePickerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFocusedRef = useRef(false);
  const lastSyncedValueRef = useRef<string>('');

  // Convert YYYY-MM-DD to dd/MM/yyyy
  const formatForDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      if (isNaN(date.getTime())) return '';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  };

  // Convert dd/MM/yyyy to Date
  const parseInput = (input: string): Date | null => {
    if (!input || input.trim() === '') return null;

    // Remove all non-digit characters
    const cleaned = input.replace(/\D/g, '');

    // Auto-format: "26092025" -> "26/09/2025"
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    }
    if (cleaned.length >= 4) {
      formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4) + '/' + cleaned.substring(4);
    }

    // Parse dd/MM/yyyy
    const parts = formatted.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);

      if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900 && year <= 2100) {
        const date = new Date(year, month, day);
        // Validate date is actually valid (e.g., not 32/13/2025)
        if (
          date.getDate() === day &&
          date.getMonth() === month &&
          date.getFullYear() === year
        ) {
          return date;
        }
      }
    }

    return null;
  };

  // Convert Date to YYYY-MM-DD
  const dateToValue = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Sync from value prop - only when NOT focused and value actually changed externally
  useEffect(() => {
    // Don't update if user is currently focused on input
    if (isFocusedRef.current) {
      return;
    }

    // Don't update if this is the value we just set (avoid loop)
    if (value === lastSyncedValueRef.current) {
      return;
    }

    // Value changed externally - sync it
    lastSyncedValueRef.current = value;

    if (value) {
      const date = new Date(value + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        const formatted = formatForDisplay(value);
        setSelectedDate(date);
        setInputValue(formatted);
        setInputError(false);
      }
    } else {
      setSelectedDate(null);
      setInputValue('');
      setInputError(false);
    }
  }, [value]);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setInputError(false);
    if (date) {
      const formatted = formatForDisplay(dateToValue(date));
      setInputValue(formatted);
      const dateValue = dateToValue(date);
      onChange(dateValue);
      lastSyncedValueRef.current = dateValue;
      setIsOpen(false); // Close calendar after selection
    } else {
      setInputValue('');
      onChange('');
      lastSyncedValueRef.current = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputError(false);

    // Auto-format while typing
    const cleaned = input.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    }
    if (cleaned.length > 4) {
      formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4) + '/' + cleaned.substring(4, 8);
    }

    // Limit to 10 characters (dd/MM/yyyy)
    if (formatted.length > 10) {
      formatted = formatted.substring(0, 10);
    }

    // Update input value immediately - NO parent onChange call while typing
    // This prevents re-render and focus loss
    setInputValue(formatted);
  };

  const handleInputBlur = () => {
    isFocusedRef.current = false;

    if (inputValue) {
      const parsed = parseInput(inputValue);
      if (parsed) {
        setSelectedDate(parsed);
        const formatted = formatForDisplay(dateToValue(parsed));
        setInputValue(formatted);
        const dateValue = dateToValue(parsed);
        onChange(dateValue);
        lastSyncedValueRef.current = dateValue;
        setInputError(false);
      } else {
        // Invalid date
        setInputError(true);
        // Revert to current value if exists
        if (value) {
          setInputValue(formatForDisplay(value));
        } else {
          setInputValue('');
        }
      }
    } else {
      // Empty is valid
      setSelectedDate(null);
      onChange('');
      lastSyncedValueRef.current = '';
      setInputError(false);
    }

    if (onBlur) {
      onBlur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleInputFocus = () => {
    // Mark as focused to prevent value prop from updating input while typing
    isFocusedRef.current = true;
  };

  const handleCalendarIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Close calendar when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        inputRef.current &&
        !inputRef.current.contains(target) &&
        !target.closest('.react-datepicker')
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className='flex flex-col'>
      <label
        htmlFor={id}
        className='mb-1 text-xs font-medium text-gray-600 whitespace-nowrap'
      >
        {label}
      </label>
      <div className='relative'>
        {/* Standalone input - completely independent, no ReactDatePicker interference */}
        <div className='relative'>
          <input
            ref={inputRef}
            id={id}
            type='text'
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            readOnly={false}
            autoComplete='off'
            className={`w-full rounded-md border px-3 py-2 pr-10 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
              error || inputError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300'
            }`}
            style={{ zIndex: 10 }}
          />
          <button
            type='button'
            onClick={handleCalendarIconClick}
            className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
            style={{ zIndex: 11 }}
            tabIndex={-1}
          >
            <Calendar className='h-4 w-4' />
          </button>
        </div>

        {/* Calendar popup - shown when isOpen is true */}
        {isOpen && (
          <div
            className='absolute top-full left-0 mt-1 z-[9999]'
            onClick={(e) => e.stopPropagation()}
          >
            <ReactDatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat='dd/MM/yyyy'
              inline
              onClickOutside={() => setIsOpen(false)}
            />
          </div>
        )}

        {inputError && (
          <p className='mt-1 text-xs text-red-600'>Invalid date format (dd/MM/yyyy)</p>
        )}
      </div>
      <style jsx global>{`
        .react-datepicker {
          font-family: inherit;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          z-index: 9999;
        }
        .react-datepicker__header {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
        }
        .react-datepicker__current-month {
          font-weight: 600;
          color: #111827;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #0d6efd;
          color: white;
        }
        .react-datepicker__day:hover {
          background-color: #e5e7eb;
        }
        .react-datepicker__day--today {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default CustomDatePicker;
