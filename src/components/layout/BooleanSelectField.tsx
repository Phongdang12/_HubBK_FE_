// fileName: BooleanSelectField.tsx
import { FC } from 'react';

interface Option {
  label: string;
  value: boolean | string; // Giá trị có thể là boolean hoặc string
}

interface BooleanSelectFieldProps {
  label: string;
  value: boolean;
  options: Option[];
  isEditing: boolean;
  onChange: (value: boolean) => void;
  onBlur?: () => void; // ✅ Đã thêm onBlur
  error?: string;
}

const BooleanSelectField: FC<BooleanSelectFieldProps> = ({
  label,
  value,
  options,
  isEditing,
  onChange,
  onBlur, // ✅ Đã nhận onBlur
  error,
}) => {
  return (
    <div className='flex flex-col gap-1'>
      <label className='text-sm font-medium text-gray-700'>{label}</label>
      {isEditing ? (
        <select
          className='rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none'
          value={value ? 'true' : 'false'} // Chuyển giá trị boolean thành 'true' hoặc 'false' cho select
          onChange={(e) => onChange(e.target.value === 'true')} // Chuyển lại thành boolean
          onBlur={onBlur} // ✅ Đã gắn onBlur
        >
          <option value=''>Select {label}</option>
          {options.map((option) => (
            <option
              key={option.value.toString()}
              value={option.value === true ? 'true' : 'false'}
            >
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div>
          {/* Hiển thị 'Yes' hoặc 'No' nếu là boolean */}
          {value ? 'Yes' : 'No'}
        </div>
      )}
      {error && <p className='text-xs text-red-600'>{error}</p>}
    </div>
  );
};

export default BooleanSelectField;