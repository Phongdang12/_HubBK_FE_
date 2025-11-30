// fileName: InputAddress.tsx
import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import SelectField from '@/components/layout/SelectField'; 

interface Address {
  commune: string;
  province: string;
}

// 🆕 Định nghĩa Option chung
interface Option {
  label: string;
  value: string;
  code?: number;
}

interface EditAddressFieldProps {
  label: string;
  values: Address[];
  isEditing: boolean;
  onChange: (index: number, field: keyof Address, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onBlur?: () => void; 
  maxItems?: number;
  error?: string;
  // 🆕 Thêm các props để nhận dữ liệu từ API
  provinceOptions?: Option[];
  wardOptions?: Option[];
  selectedProvinceCode?: number | null;
}

const InputAddress: FC<EditAddressFieldProps> = ({
  label,
  values,
  isEditing,
  onChange,
  onAdd,
  onRemove,
  onBlur, 
  maxItems = 3,
  error,
  // 🆕 Default props
  provinceOptions = [],
  wardOptions = [],
  selectedProvinceCode = null,
}) => {
  const renderValues =
    values.length > 0 ? values : [{ commune: '', province: '' }];

  const handleRemove = (i: number) => {
    onRemove(i);
    if (onBlur) onBlur(); 
  }

  // 🆕 Wrapper để xử lý logic khi chọn
  const handleProvinceChange = (i: number, val: string) => onChange(i, 'province', val);
  const handleCommuneChange = (i: number, val: string) => onChange(i, 'commune', val);
    
  return (
    <div className='md:col-span-2'>
      <span className='font-semibold'>{label}:</span>

      {renderValues.map((address, i) => (
        <div
          key={i}
          className='relative mt-2 grid grid-cols-1 gap-2 md:grid-cols-2'
        >
          {isEditing ? (
            // --- CHẾ ĐỘ EDIT ---
            <>
              {/* --- CỘT TỈNH/THÀNH PHỐ --- */}
              <div className='w-11/12'>
                <SelectField
                  label="Province" 
                  value={address.province}
                  options={provinceOptions}
                  isEditing={isEditing}
                  onChange={(val) => handleProvinceChange(i, val)}
                  onBlur={onBlur} 
                />
              </div>

              {/* --- CỘT XÃ/PHƯỜNG (Phụ thuộc Tỉnh) --- */}
              <div className='w-11/12'>
                <SelectField
                  label="Commune" 
                  value={address.commune}
                  options={wardOptions}
                  isEditing={isEditing}
                  // Disable nếu chưa chọn Tỉnh hoặc không có code tỉnh
                  disabled={!address.province || !selectedProvinceCode}
                  onChange={(val) => handleCommuneChange(i, val)}
                  onBlur={onBlur} 
                />
              </div>
            </>
          ) : (
            // 🔄 CẬP NHẬT: CHẾ ĐỘ VIEW - Dùng SelectField để đồng nhất layout
            <>
              {/* --- CỘT TỈNH/THÀNH PHỐ --- */}
              <div className='w-11/12'>
                <SelectField
                  label="Province" 
                  value={address.province}
                  options={provinceOptions} 
                  isEditing={isEditing} // isEditing = false (Read-only mode)
                />
              </div>

              {/* --- CỘT XÃ/PHƯỜNG --- */}
              <div className='w-11/12'>
                <SelectField
                  label="Commune" 
                  value={address.commune}
                  options={wardOptions} 
                  isEditing={isEditing} // isEditing = false (Read-only mode)
                />
              </div>
            </>
          )}

          {isEditing && values.length > 1 && (
            <button
              type='button'
              className='absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700'
              onClick={() => handleRemove(i)}
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}

      {isEditing && values.length < maxItems && (
        <Button className='mt-2' variant='outline' onClick={onAdd}>
          + Add Address
        </Button>
      )}
      {error && <p className='mt-1 text-xs text-red-600'>{error}</p>}
    </div>
  );
};

export default InputAddress;