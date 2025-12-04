import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import EditField from '@/components/layout/EditField';
import SelectField from '@/components/layout/SelectField';
import InputAddress from './InputAddress';
import EditForm from './EditForm';
import ConfirmDialog from '@/components/layout/ConfirmDialog';
import { DialogFooter } from '@/components/ui/dialog';
import { addStudent, checkStudentExistence } from '@/services/studentService';
import { toast, Toaster } from 'react-hot-toast';
import CalendarIcon from '@/assets/calendar.svg';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { Copy } from 'lucide-react'; // Icon cho nút Copy

interface Address { commune: string; province: string; }
interface StudentFormData {
  cccd: string;
  student_id: string;
  fullname: string;
  birthday: string;
  sex: string;
  health_state: string;
  has_health_insurance: boolean;
  ethnic_group: string;
  class_name: string;
  faculty: string;
  study_status: string;
  building_id: string;
  room_id: string;
  addresses: string;
  emails: string;
  phone_numbers: string;
  guardian_cccd: string;
  guardian_name: string;
  guardian_relationship: string;
  guardian_occupation: string;
  guardian_birthday: string;
  guardian_phone_numbers: string;
  guardian_addresses: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+?\d{1,3})?[\s-]?\d{9,}$/;
const MIN_BIRTHDAY = new Date('1980-01-01');
const GUARDIAN_MIN_BIRTHDAY = new Date('1950-01-01');
const GUARDIAN_MAX_BIRTHDAY = new Date('2005-12-31');
const RELATIONSHIP_OPTIONS = ['Father', 'Mother', 'Other'];
const GENERAL_FORM_ERROR_MESSAGE = 'Vui lòng kiểm tra lại thông tin sinh viên và sửa các lỗi được chỉ ra.';

const ETHNIC_GROUP_OPTIONS = [
  { label: 'Kinh', value: 'Kinh' },
  { label: 'Tày', value: 'Tay' },
  { label: 'Thái', value: 'Thai' },
  { label: 'Hoa', value: 'Hoa' },
  { label: 'Khác', value: 'Other' },
];
const FACULTY_OPTIONS = [
  { label: 'Applied Sciences', value: 'Applied Sciences' },
  { label: 'Chemical Engineering', value: 'Chemical Engineering' },
  { label: 'Civil Engineering', value: 'Civil Engineering' },
  { label: 'Computer Science and Engineering', value: 'Computer Science and Engineering' },
  { label: 'Electrical and Electronic Engineering', value: 'Electrical and Electronic Engineering' },
  { label: 'Environment and Natural Resources', value: 'Environment and Natural Resources' },
  { label: 'Geological and Petroleum Engineering', value: 'Geological and Petroleum Engineering' },
  { label: 'Industrial Management', value: 'Industrial Management' },
  { label: 'Materials Technology', value: 'Materials Technology' },
  { label: 'Mechanical Engineering', value: 'Mechanical Engineering' },
  { label: 'Transportation Engineering', value: 'Transportation Engineering' },
];

interface Option { label: string; value: string; code: number; }

const fetchApi = async (url: string, params: Record<string, any> = {}) => {
  const serverUrl = 'https://provinces.open-api.vn/api/v2'; 
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${serverUrl}${url}?${queryString}`);
  if (!response.ok) throw new Error('API Error');
  return response.json();
};

// --- [FEATURE 4] Helper Format ---
const formatNumberWithSpaces = (value: string) => {
  // Chỉ giữ lại số
  const numbers = value.replace(/\D/g, '');
  // Nhóm 3 số: 123 456 789...
  return numbers.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
};

// Helper để lấy giá trị sạch (không space) dùng cho validation/submit
const cleanValue = (value: string) => value.replace(/\s/g, '');


const AddStudentForm = () => {
  const [formData, setFormData] = useState<StudentFormData>({
    cccd: '', student_id: '', fullname: '', birthday: '', sex: '',
    health_state: '', has_health_insurance: false, ethnic_group: '', class_name: '',
    faculty: '', study_status: '', building_id: '', room_id: '', addresses: '',
    emails: '', phone_numbers: '', guardian_cccd: '', guardian_name: '',
    guardian_relationship: '', guardian_occupation: '', guardian_birthday: '',
    guardian_phone_numbers: '', guardian_addresses: '',
  });
  const navigate = useNavigate();
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [checkingField, setCheckingField] = useState<string | null>(null);

  const [provinceOptions, setProvinceOptions] = useState<Option[]>([]);
  const [wardOptions, setWardOptions] = useState<Option[]>([]);
  const [guardianWardOptions, setGuardianWardOptions] = useState<Option[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedGuardianProvinceCode, setSelectedGuardianProvinceCode] = useState<number | null>(null);

  useEffect(() => {
    fetchApi('/p/', { depth: 1 }).then(data => {
      setProvinceOptions(data.map((p: any) => ({ label: p.name, value: p.name, code: p.code })));
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedProvinceCode) { setWardOptions([]); return; }
    fetchApi('/w/', { province: selectedProvinceCode }).then(data => {
      setWardOptions(data.map((w: any) => ({ label: w.name, value: w.name, code: w.code })));
    }).catch(console.error);
  }, [selectedProvinceCode]);

  useEffect(() => {
    if (!selectedGuardianProvinceCode) { setGuardianWardOptions([]); return; }
    fetchApi('/w/', { province: selectedGuardianProvinceCode }).then(data => {
      setGuardianWardOptions(data.map((w: any) => ({ label: w.name, value: w.name, code: w.code })));
    }).catch(console.error);
  }, [selectedGuardianProvinceCode]);

  const clearFieldError = (field: keyof StudentFormData) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  // -------------------------------------------------------
  // [FEATURE 1] Auto-Scroll to Error Helper
  // -------------------------------------------------------
  const scrollToFirstError = () => {
    setTimeout(() => {
      // Tìm phần tử đầu tiên có class border-red-500 (Class lỗi trong EditField)
      const firstErrorElement = document.querySelector('.border-red-500');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Focus vào input nếu có thể
        if (firstErrorElement instanceof HTMLElement) {
           firstErrorElement.focus();
        }
      }
    }, 100);
  };

  // -------------------------------------------------------
  // [FEATURE 2] Copy Address Handler
  // -------------------------------------------------------
  const handleCopyAddress = () => {
    if (!formData.addresses) {
      toast.error('Vui lòng nhập địa chỉ sinh viên trước.');
      return;
    }

    // 1. Copy chuỗi địa chỉ
    setFormData((prev) => ({
      ...prev,
      guardian_addresses: prev.addresses
    }));

    // 2. Cập nhật selected code để dropdown Xã/Phường hoạt động
    const addresses = parseAddressField(formData.addresses);
    if (addresses.length > 0 && addresses[0].province) {
      const selectedProvince = provinceOptions.find(p => p.value === addresses[0].province);
      if (selectedProvince) {
        setSelectedGuardianProvinceCode(selectedProvince.code);
      }
    }
    
    // Clear lỗi nếu có
    clearFieldError('guardian_addresses');
    toast.success('Đã sao chép địa chỉ!');
  };

  // -------------------------------------------------------
  // CHECK SERVER SIDE
  // -------------------------------------------------------
  const checkServerSide = async (field: 'student_id' | 'cccd' | 'guardian_cccd', value: string) => {
    if (!value) return;
    
    // [FEATURE 4] Clean value before checking
    const rawValue = cleanValue(value);

    if (field === 'student_id' && !/^[A-Za-z0-9]{7}$/.test(rawValue)) return;
    if ((field === 'cccd' || field === 'guardian_cccd') && !/^\d{12}$/.test(rawValue)) return;

    setCheckingField(field);
    try {
      // Gửi rawValue (không space) lên server
      const exists = await checkStudentExistence(field, rawValue);
      
      if (exists) {
        let msg = '';
        if (field === 'student_id') msg = 'Mã sinh viên này đã tồn tại.';
        else if (field === 'cccd') msg = 'CCCD này đã tồn tại.';
        else if (field === 'guardian_cccd') msg = 'CCCD này đã tồn tại ở hồ sơ khác.';
        
        setFieldErrors((prev) => ({ ...prev, [field]: msg }));
      } else {
        setFieldErrors((prev) => {
          const currentError = prev[field];
          if (currentError && currentError.includes('tồn tại')) {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCheckingField(null);
    }
  };

  const debouncedCheck = useCallback(
    debounce((field: 'student_id' | 'cccd' | 'guardian_cccd', value: string) => {
      checkServerSide(field, value);
    }, 500), 
    []
  );

  const handleChange = (field: keyof StudentFormData, value: any) => {
    let finalValue = value;

    // [FEATURE 4] Auto-Format Input
    if (field === 'cccd' || field === 'guardian_cccd' || field === 'phone_numbers' || field === 'guardian_phone_numbers') {
       // Nếu là trường số, format lại hiển thị
       finalValue = formatNumberWithSpaces(value);
    }

    setFormData((prev) => ({ ...prev, [field]: finalValue }));
    clearFieldError(field); 
    setFormError(null);

    // Trigger Live Check (Gửi value đã format, bên trong hàm check sẽ clean lại)
    if (field === 'student_id' || field === 'cccd' || field === 'guardian_cccd') {
      debouncedCheck(field, finalValue as string);
    }
  };

  // -------------------------------------------------------
  // HELPERS & VALIDATION
  // -------------------------------------------------------

  const parseAddressField = (value: string): Address[] =>
    value ? value.split(';').map((item) => {
          const [commune = '', province = ''] = item.split(',');
          return { commune, province };
        }) : [];

  const stringifyAddressField = (list: Address[]): string =>
    list.map((addr) => [addr.commune, addr.province].join(',')).join(';');

  const parseListField = (value: string) => value ? value.split(';').map((v) => v.trim()) : [];
  const stringifyListField = (list: string[]) => list.map((v) => v.trim()).join(';');

  const hasValidAddressList = (value: string) => {
    if (!value) return true;
    const addresses = parseAddressField(value);
    return addresses.every((addr) => addr.commune.trim().length > 0 && addr.province.trim().length > 0);
  };

  const isValidGuardianBirthday = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    return date >= GUARDIAN_MIN_BIRTHDAY && date <= GUARDIAN_MAX_BIRTHDAY;
  };

  const validateField = (field: keyof StudentFormData) => {
      const value = formData[field]?.toString().trim();
      // [FEATURE 4] Clean value để validate regex
      const rawValue = cleanValue(value); 

      let error = '';
      const requiredFields: (keyof StudentFormData)[] = ['student_id','cccd', 'fullname', 'birthday', 'sex', 'ethnic_group', 'study_status', 'guardian_cccd', 'guardian_name', 'guardian_relationship', 'guardian_birthday'];
      
      if (requiredFields.includes(field) && !value && field !== 'has_health_insurance') {
        setFieldErrors((prev) => ({ ...prev, [field]: `${field} không được để trống.` }));
        return;
      }
      
       switch (field) {
        case 'student_id': 
          if (!value || !/^[A-Za-z0-9]{7}$/.test(value)) error = 'Student ID bắt buộc và phải 7 ký tự.'; 
          break;
        case 'cccd': 
          if (value && !/^\d{12}$/.test(rawValue)) error = 'CCCD phải gồm 12 chữ số.'; 
          else if (rawValue === cleanValue(formData.guardian_cccd)) error = 'CCCD sinh viên không được trùng với người thân.';
          break;
        case 'birthday': { const d = new Date(value); const today = new Date(); if (!value || Number.isNaN(d.getTime()) || d < MIN_BIRTHDAY || d > today) error = 'Ngày sinh bắt buộc và không hợp lệ.'; break; }
        
        case 'guardian_cccd': 
            if (!value || !/^\d{12}$/.test(rawValue)) error = 'CCCD người thân bắt buộc và phải 12 chữ số.'; 
            else if (rawValue === cleanValue(formData.cccd)) error = 'CCCD người thân không được trùng với sinh viên.';
            break;

        case 'guardian_birthday': if (!value || !isValidGuardianBirthday(value)) error = 'Ngày sinh người thân bắt buộc và không hợp lệ.'; break;
        case 'guardian_relationship': if (!value || !RELATIONSHIP_OPTIONS.includes(value)) error = 'Quan hệ người thân bắt buộc và không hợp lệ.'; break;
        case 'ethnic_group': if (!value) error = 'Dân tộc bắt buộc.'; break;
        
        case 'emails': { 
            const list = parseListField(formData.emails).filter(Boolean); 
            if (list.length > 0 && list.some((e) => !EMAIL_REGEX.test(e))) error = 'Email không hợp lệ.'; 
            break; 
        }
        case 'phone_numbers': { 
            // Cần clean space trong từng số điện thoại trước khi check regex
            const list = parseListField(formData.phone_numbers).filter(Boolean); 
            if (list.length > 0 && list.some((p) => !PHONE_REGEX.test(cleanValue(p)))) error = 'Số điện thoại không hợp lệ.'; 
            break; 
        }
        case 'guardian_phone_numbers': { 
            const list = parseListField(formData.guardian_phone_numbers).filter(Boolean); 
            if (list.length > 0 && list.some((p) => !PHONE_REGEX.test(cleanValue(p)))) error = 'SĐT người thân không hợp lệ.'; 
            break; 
        }

        case 'addresses': if (value && !hasValidAddressList(formData.addresses)) error = 'Địa chỉ không hợp lệ.'; break;
        case 'guardian_addresses': if (value && !hasValidAddressList(formData.guardian_addresses)) error = 'Địa chỉ người thân không hợp lệ.'; break;
      }
      
      if (error) {
        setFieldErrors((prev) => ({ ...prev, [field]: error }));
      } else {
        setFieldErrors((prev) => {
            if (prev[field] && prev[field].includes('tồn tại')) return prev;
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
      }
  };
  
  const handleBlur = (field: keyof StudentFormData) => validateField(field);

  // ... (Address handlers giữ nguyên)
  const handleAddressChange = (index: number, field: keyof Address, value: string, key: keyof StudentFormData) => {
    let addresses = parseAddressField(formData[key] as string);
    while (addresses.length <= index) addresses.push({ commune: '', province: '' });
    addresses[index][field] = value;
    
    if (field === 'province') {
        const selected = provinceOptions.find(p => p.value === value);
        const code = selected ? selected.code : null;
        if (key === 'addresses') { setSelectedProvinceCode(code); addresses[index].commune = ''; } 
        else if (key === 'guardian_addresses') { setSelectedGuardianProvinceCode(code); addresses[index].commune = ''; }
    }
    handleChange(key, stringifyAddressField(addresses));
  };
  const handleAddAddress = (key: keyof StudentFormData) => {
    const addresses = parseAddressField(formData[key] as string);
    if (addresses.length < 3) handleChange(key, stringifyAddressField([...addresses, { commune: '', province: '' }]));
  };
  const handleRemoveAddress = (key: keyof StudentFormData, index: number) => {
    const addresses = parseAddressField(formData[key] as string);
    handleChange(key, stringifyAddressField(addresses.filter((_, i) => i !== index)));
  };
  
  // ... (List handlers giữ nguyên)
  const handleListChange = (field: keyof StudentFormData, index: number, value: string) => {
    const list = parseListField(formData[field] as string);
    // Feature 4: Format số điện thoại trong list
    if (field === 'phone_numbers' || field === 'guardian_phone_numbers') {
        list[index] = formatNumberWithSpaces(value);
    } else {
        list[index] = value;
    }
    handleChange(field, stringifyListField(list));
  };
  const handleAddToList = (field: keyof StudentFormData) => {
    const list = parseListField(formData[field] as string);
    list.push('');
    handleChange(field, stringifyListField(list));
  };
  const handleRemoveFromList = (field: keyof StudentFormData, index: number) => {
    const list = parseListField(formData[field] as string);
    handleChange(field, stringifyListField(list.filter((_, i) => i !== index)));
  };

  const validateForm = () => {
    const fieldsToCheck: (keyof StudentFormData)[] = ['student_id', 'fullname', 'birthday', 'sex', 'faculty', 'study_status', 'cccd', 'emails', 'phone_numbers', 'addresses', 'guardian_cccd', 'guardian_name', 'guardian_relationship', 'guardian_birthday', 'guardian_phone_numbers', 'guardian_addresses'];
    fieldsToCheck.forEach(field => validateField(field));
    
    // Check trùng nhau lần cuối
    if (formData.cccd && formData.guardian_cccd && cleanValue(formData.cccd) === cleanValue(formData.guardian_cccd)) {
        setFieldErrors(prev => ({ ...prev, guardian_cccd: 'CCCD người thân không được trùng với sinh viên.' }));
    }

    // Kiểm tra xem có bất kỳ lỗi nào trong state không
    // (Lưu ý: validateField là async về mặt state update, nên ở đây check logic thuần túy là an toàn nhất)
    const hasError = Object.keys(fieldErrors).some(k => fieldErrors[k]) || 
                     (cleanValue(formData.cccd) === cleanValue(formData.guardian_cccd) && formData.cccd);

    if (hasError) {
      setFormError(GENERAL_FORM_ERROR_MESSAGE);
      return false;
    }
    // Check required fields manual (để chắc chắn)
    const required = ['student_id', 'fullname', 'birthday', 'sex', 'faculty', 'study_status', 'cccd', 'guardian_cccd', 'guardian_name', 'guardian_relationship', 'guardian_birthday'];
    for (const f of required) {
        if (!(formData as any)[f]) {
             setFormError(GENERAL_FORM_ERROR_MESSAGE);
             return false;
        }
    }
    
    setFormError(null);
    return true;
  };

  const mapBackendErrors = (errors?: Array<{ field: string; message: string }>) => {
    if (!Array.isArray(errors)) return;
    const mapped: Record<string, string> = {};
    errors.forEach(({ field, message }) => {
      const targetField = field === 'first_name' || field === 'last_name' ? 'fullname' : (field as keyof StudentFormData);
      mapped[targetField] = message;
    });
    setFieldErrors(mapped);
    if (Object.keys(mapped).length > 0) setFormError(GENERAL_FORM_ERROR_MESSAGE);
  };

  const handleSave = async () => {
      // Vì validateForm set state, ta cần chờ 1 tick hoặc check kết quả trả về
      // Ở đây ta gọi validateForm và tin tưởng vào return value của nó (tương đối)
      // Nhưng để chắc chắn UX scroll hoạt động, ta check fieldErrors ngay sau đó
      if (validateForm() === false || Object.keys(fieldErrors).length > 0) {
        toast.error('Vui lòng kiểm tra lại các trường bị lỗi.');
        setConfirmSaveOpen(false);
        // [FEATURE 1] SCROLL TO ERROR
        scrollToFirstError();
        return;
      }
      
    try {
      const nameParts = formData.fullname.trim().split(/\s+/);
      const lastName = nameParts.pop() || '';
      const firstName = nameParts.join(' ') || '';
      
      // [FEATURE 4] Clean data trước khi gửi
      const payload = { 
          ...formData, 
          cccd: cleanValue(formData.cccd), 
          guardian_cccd: cleanValue(formData.guardian_cccd),
          phone_numbers: stringifyListField(parseListField(formData.phone_numbers).map(cleanValue)),
          guardian_phone_numbers: stringifyListField(parseListField(formData.guardian_phone_numbers).map(cleanValue)),
          
          first_name: firstName, 
          last_name: lastName, 
          has_health_insurance: !!formData.has_health_insurance 
      };
      await addStudent(payload as any);
      toast.success('Student added successfully!');
      setFormError(null);
      setTimeout(() => navigate('/students'), 800);
      setConfirmSaveOpen(false);
    } catch (err: any) {
      console.error('❌ Add student error:', err);
      mapBackendErrors(err?.response?.data?.fieldErrors);
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to add student';
      setFormError(message);
      toast.error(message);
      setConfirmSaveOpen(false);
      // Scroll lên nếu có lỗi backend trả về
      scrollToFirstError();
    }
  };
  const RedStar = <span className="text-red-500">*</span>;
  
  return (
    <div className='grid grid-cols-1 gap-4 rounded-lg bg-white p-6 text-sm text-gray-700 shadow-md md:grid-cols-2'>
      <Toaster />
      <div className='col-span-full mb-4 text-2xl font-semibold'>Add new student</div>
      {formError && <div className='col-span-full rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{formError}</div>}

      <EditField 
          label="Student ID *" 
          value={formData.student_id} 
          isEditing 
          onChange={(v) => handleChange('student_id', v)} 
          onBlur={() => handleBlur('student_id')} 
          error={fieldErrors.student_id} 
          isLoading={checkingField === 'student_id'}
      />

      <EditField 
          label="CCCD *" 
          value={formData.cccd} 
          isEditing 
          onChange={(v) => handleChange('cccd', v)} 
          onBlur={() => handleBlur('cccd')} 
          error={fieldErrors.cccd} 
          isLoading={checkingField === 'cccd'}
          placeholder="000 000 000 000" // Placeholder định dạng
      />

      <EditField label="Full name *" value={formData.fullname} isEditing onChange={(v) => handleChange('fullname', v)} onBlur={() => handleBlur('fullname')} error={fieldErrors.fullname} />
      <EditField label="Birthday *" value={formData.birthday} type='date' isEditing onChange={(v) => handleChange('birthday', v)} onBlur={() => handleBlur('birthday')} error={fieldErrors.birthday} icon={<img src={CalendarIcon} className='h-5 w-5' />} />
      <SelectField label="Sex *" value={formData.sex} options={[{ label: 'Male', value: 'M' }, { label: 'Female', value: 'F' }]} isEditing onChange={(v) => handleChange('sex', v)} onBlur={() => handleBlur('sex')} error={fieldErrors.sex} />
      <SelectField label="Ethnic Group *" value={formData.ethnic_group} isEditing options={ETHNIC_GROUP_OPTIONS} onChange={(v) => handleChange('ethnic_group', v)} onBlur={() => handleBlur('ethnic_group')} error={fieldErrors.ethnic_group} />
      <SelectField label='Faculty' value={formData.faculty} isEditing options={FACULTY_OPTIONS} onChange={(v) => handleChange('faculty', v)} onBlur={() => handleBlur('faculty')} error={fieldErrors.faculty} />
      <SelectField label="Residence status *" value={formData.study_status} options={[{ label: 'Active', value: 'Active' }, { label: 'Non active', value: 'Non_Active' }]} isEditing onChange={(v) => handleChange('study_status', v)} onBlur={() => handleBlur('study_status')} error={fieldErrors.study_status} />
      <InputAddress label='Addresses' values={parseAddressField(formData.addresses)} isEditing provinceOptions={provinceOptions} wardOptions={wardOptions} selectedProvinceCode={selectedProvinceCode} onChange={(i, f, v) => handleAddressChange(i, f, v, 'addresses')} onAdd={() => handleAddAddress('addresses')} onRemove={(i) => handleRemoveAddress('addresses', i)} onBlur={() => handleBlur('addresses')} error={fieldErrors.addresses} />
      <EditForm label='Emails' values={parseListField(formData.emails)} isEditing onChange={(i, v) => handleListChange('emails', i, v)} onAdd={() => handleAddToList('emails')} onRemove={(i) => handleRemoveFromList('emails', i)} onBlur={() => handleBlur('emails')} error={fieldErrors.emails} />
      <EditForm label='Phone Numbers' values={parseListField(formData.phone_numbers)} isEditing onChange={(i, v) => handleListChange('phone_numbers', i, v)} onAdd={() => handleAddToList('phone_numbers')} onRemove={(i) => handleRemoveFromList('phone_numbers', i)} onBlur={() => handleBlur('phone_numbers')} error={fieldErrors.phone_numbers} />

      <div className='col-span-full mt-6 flex justify-between items-center text-lg font-semibold'>
          <span>Guardian Information:</span>
          {/* [FEATURE 2] COPY ADDRESS BUTTON */}
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 text-xs gap-1"
            onClick={handleCopyAddress}
          >
            <Copy className="w-3 h-3" /> Copy from Student Address
          </Button>
      </div>
      
      <EditField 
          label="CCCD *" 
          value={formData.guardian_cccd} 
          isEditing 
          onChange={(v) => handleChange('guardian_cccd', v)} 
          onBlur={() => handleBlur('guardian_cccd')} 
          error={fieldErrors.guardian_cccd} 
          isLoading={checkingField === 'guardian_cccd'}
          placeholder="000 000 000 000"
      />
      
      <EditField label="Full name *" value={formData.guardian_name} isEditing onChange={(v) => handleChange('guardian_name', v)} onBlur={() => handleBlur('guardian_name')} error={fieldErrors.guardian_name} />
      <SelectField label="Relationship *" value={formData.guardian_relationship} options={[{ label: 'Father', value: 'Father' }, { label: 'Mother', value: 'Mother' }, { label: 'Other', value: 'Other' }]} isEditing onChange={(v) => handleChange('guardian_relationship', v)} onBlur={() => handleBlur('guardian_relationship')} error={fieldErrors.guardian_relationship} />
      <EditField label='Occupation' value={formData.guardian_occupation} isEditing onChange={(v) => handleChange('guardian_occupation', v)} onBlur={() => handleBlur('guardian_occupation')} error={fieldErrors.guardian_occupation} />
      <EditField label="Birthday *" value={formData.guardian_birthday} type='date' isEditing onChange={(v) => handleChange('guardian_birthday', v)} onBlur={() => handleBlur('guardian_birthday')} error={fieldErrors.guardian_birthday} icon={<img src={CalendarIcon} className='h-5 w-5' />} />
      <EditForm label='Phone Numbers' values={parseListField(formData.guardian_phone_numbers)} isEditing onChange={(i, v) => handleListChange('guardian_phone_numbers', i, v)} onAdd={() => handleAddToList('guardian_phone_numbers')} onRemove={(i) => handleRemoveFromList('guardian_phone_numbers', i)} onBlur={() => handleBlur('guardian_phone_numbers')} error={fieldErrors.guardian_phone_numbers} />
      <InputAddress label='Addresses' values={parseAddressField(formData.guardian_addresses)} isEditing provinceOptions={provinceOptions} wardOptions={guardianWardOptions} selectedProvinceCode={selectedGuardianProvinceCode} onChange={(i, f, v) => handleAddressChange(i, f, v, 'guardian_addresses')} onAdd={() => handleAddAddress('guardian_addresses')} onRemove={(i) => handleRemoveAddress('guardian_addresses', i)} onBlur={() => handleBlur('guardian_addresses')} error={fieldErrors.guardian_addresses} />

      <DialogFooter className='col-span-full mt-8 flex justify-end'>
        <Button style={{ backgroundColor: '#032B91' }} onClick={() => setConfirmSaveOpen(true)}>Save</Button>
      </DialogFooter>
      <ConfirmDialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen} title='Confirm Save' message='Are you sure you want to save this student?' confirmColor='blue' onConfirm={handleSave} />
    </div>
  );
};
export default AddStudentForm;