import { useState, useEffect } from 'react';

interface DateInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
}

/**
 * Date input component that supports both typing (dd/MM/yyyy) and date picker
 */
const DateInput = ({ id, label, value, onChange, onBlur, error }: DateInputProps) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [inputError, setInputError] = useState(false);

  // Convert YYYY-MM-DD to dd/MM/yyyy for display
  const formatForDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      if (isNaN(date.getTime())) return dateStr;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // Convert dd/MM/yyyy to YYYY-MM-DD
  const parseInput = (input: string): { valid: boolean; date?: string } => {
    if (!input || input.trim() === '') {
      return { valid: true, date: '' };
    }

    // Remove all non-digit characters except /
    const cleaned = input.replace(/[^\d/]/g, '');
    
    // Try to parse dd/MM/yyyy format
    const parts = cleaned.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      
      if (day.length === 2 && month.length === 2 && year.length === 4) {
        const dateStr = `${year}-${month}-${day}`;
        const date = new Date(dateStr + 'T00:00:00');
        if (!isNaN(date.getTime())) {
          // Validate date is actually valid (e.g., not 32/13/2025)
          const d = parseInt(day, 10);
          const m = parseInt(month, 10);
          const y = parseInt(year, 10);
          if (date.getDate() === d && date.getMonth() + 1 === m && date.getFullYear() === y) {
            return { valid: true, date: dateStr };
          }
        }
      }
    }
    
    // If parsing fails, try to parse as YYYY-MM-DD
    if (cleaned.length === 8 && !cleaned.includes('/')) {
      const year = cleaned.substring(0, 4);
      const month = cleaned.substring(4, 6);
      const day = cleaned.substring(6, 8);
      const dateStr = `${year}-${month}-${day}`;
      const date = new Date(dateStr + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        return { valid: true, date: dateStr };
      }
    }
    
    return { valid: false };
  };

  useEffect(() => {
    if (!isFocused && value) {
      setDisplayValue(formatForDisplay(value));
      setInputError(false);
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    setInputError(false);
    // Show formatted date when focused for manual typing
    setDisplayValue(formatForDisplay(value) || '');
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Try to parse the input
    if (displayValue) {
      const parsed = parseInput(displayValue);
      if (parsed.valid && parsed.date !== undefined) {
        onChange(parsed.date);
        setDisplayValue(formatForDisplay(parsed.date));
        setInputError(false);
      } else {
        // If parsing fails, show error and revert
        setInputError(true);
        setDisplayValue(formatForDisplay(value));
      }
    } else {
      // Empty input is valid (clears the date)
      onChange('');
      setDisplayValue('');
      setInputError(false);
    }
    
    if (onBlur) {
      onBlur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    setInputError(false);
    
    // If it's a valid date from date picker (YYYY-MM-DD format)
    if (inputValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      onChange(inputValue);
      setDisplayValue(formatForDisplay(inputValue));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow Enter to trigger blur/validation
    if (e.key === 'Enter') {
      e.currentTarget.blur();
      return;
    }
    
    // Allow typing numbers, slashes, and navigation keys
    if (
      !/[0-9/]/.test(e.key) &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(
        e.key,
      )
    ) {
      e.preventDefault();
    }
  };

  return (
    <div className='flex flex-col'>
      <label
        htmlFor={id}
        className='mb-1 text-xs font-medium text-gray-600 whitespace-nowrap'
      >
        {label}
      </label>
      <div className='relative'>
        <input
          id={id}
          type='text'
          value={isFocused ? displayValue : (displayValue || '')}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder='dd/MM/yyyy'
          className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
            error || inputError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300'
          }`}
          style={{ zIndex: 10 }}
        />
        {inputError && (
          <p className='mt-1 text-xs text-red-600'>Invalid date format (dd/MM/yyyy)</p>
        )}
      </div>
    </div>
  );
};

export default DateInput;

