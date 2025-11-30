// fileName: SelectField.tsx
import { FC } from 'react';
import { ReactNode } from 'react';
interface Option {
  label: string | ReactNode;
  value: string;
}

interface SelectFieldProps {
  label: string | ReactNode;
  value: string;
  options: Option[];
  isEditing: boolean;
  
  // 🔄 SỬA LỖI: Đặt onChange và onBlur là optional (?)
  onChange?: (value: string) => void;
  onBlur?: () => void;
  
  error?: string;
  disabled?: boolean;
}

const SelectField: FC<SelectFieldProps> = ({
  label,
  value,
  options,
  isEditing,
  onChange, // Vẫn cần nhận prop này để dùng trong chế độ Edit
  onBlur,
  error,
  disabled = false,
}) => {
  return (
    <div className='flex flex-col gap-1'>
      <label className='text-sm font-medium text-gray-700'>
        {label}
      </label>

      {isEditing ? (
        <select
          className='rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed'
          value={value}
          // ⚠️ CHỈ GỌI KHI CÓ TRUYỀN PROP VÀ KHÔNG PHẢI LÀ CHẾ ĐỘ VIEW
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          onBlur={onBlur}
          disabled={disabled}
        >
          <option value=''>Select {label}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-2 text-gray-600'>
          {/* Giữ nguyên logic hiển thị giá trị */}
          {value
            ? value === 'F'
              ? 'Female'
              : value === 'M'
                ? 'Male'
                : value
            : '-'}
        </div>
      )}

      {error && (
        <p className='text-xs text-red-600'>
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectField;