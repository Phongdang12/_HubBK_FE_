import { FC, ReactNode } from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react'; // Đảm bảo đã cài: npm i lucide-react

interface EditFieldProps {
  label: ReactNode;
  value: string | number;
  isEditing: boolean;
  type?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  icon?: ReactNode; // Icon tùy chỉnh (ví dụ Calendar)
  isLoading?: boolean; // Prop mới để hiện loading
  placeholder?: string;
  disabled?: boolean;
}

const EditField: FC<EditFieldProps> = ({
  label,
  value,
  isEditing,
  type = 'text',
  onChange,
  onBlur,
  error,
  icon,
  isLoading = false, // Mặc định false
  placeholder,
  disabled
}) => {
  // Xác định trạng thái
  const hasError = !!error;
  const hasValue = value !== '' && value !== null && value !== undefined;
  const isSuccess = isEditing && hasValue && !hasError && !isLoading;

  // Class động cho border và ring
  const borderColor = hasError
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
    : isSuccess
    ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20';

  const iconColor = hasError
    ? 'text-red-500'
    : isSuccess
    ? 'text-green-500'
    : 'text-gray-400';

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-semibold text-gray-700">{label}:</span>
      
      {isEditing ? (
        <div className="relative">
          <input
            type={type}
            className={`w-full rounded-lg border px-3 py-2 pr-10 outline-none transition-all focus:ring-4 ${borderColor} ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
            }`}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
          />

          {/* Icon Trạng thái (Phải) */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center bg-white pl-1">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            ) : hasError ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : isSuccess ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              // Nếu có icon tùy chỉnh (ví dụ Calendar) thì hiện khi ko có trạng thái đặc biệt
              icon && <span className="text-gray-400">{icon}</span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 min-h-[40px] px-3 py-2 rounded-lg border border-transparent hover:border-gray-200 transition-colors">
          {icon && <span className="text-gray-500">{icon}</span>}
          <p className="text-gray-800 font-medium">{value || <span className="text-gray-400 italic">Empty</span>}</p>
        </div>
      )}

      {/* Thông báo lỗi có hiệu ứng hiện dần */}
      {hasError && (
        <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default EditField;