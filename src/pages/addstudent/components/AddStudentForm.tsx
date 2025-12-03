import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import EditField from '@/components/layout/EditField';
import SelectField from '@/components/layout/SelectField';
import InputAddress from './InputAddress';
import EditForm from './EditForm';
import ConfirmDialog from '@/components/layout/ConfirmDialog';
import { DialogFooter } from '@/components/ui/dialog';
import { addStudent } from '@/services/studentService';
import { toast, Toaster } from 'react-hot-toast';
import CalendarIcon from '@/assets/calendar.svg';
import { useNavigate } from 'react-router-dom';

interface Address { commune: string; province: string; }
interface StudentFormData {
  // ssn: string; // Đã xóa SSN
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

  const handleChange = (field: keyof StudentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
    setFormError(null);
  };

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
      let error = '';
      const requiredFields: (keyof StudentFormData)[] = ['student_id','cccd', 'fullname', 'birthday', 'sex', 'ethnic_group', 'study_status', 'guardian_cccd', 'guardian_name', 'guardian_relationship', 'guardian_birthday'];
      const isRequired = requiredFields.includes(field);

      if (isRequired && !value && field !== 'has_health_insurance') {
        error = `${field} không được để trống.`;
      }
      
       switch (field) {
        // case 'ssn': ĐÃ XÓA VALIDATE SSN
        case 'student_id': if (!value || !/^[A-Za-z0-9]{7}$/.test(value)) error = 'Student ID bắt buộc và phải 7 ký tự.'; break;
        case 'cccd': if (value && !/^\d{12}$/.test(value)) error = 'CCCD phải gồm 12 chữ số.'; break;
        case 'birthday': { const d = new Date(value); const today = new Date(); if (!value || Number.isNaN(d.getTime()) || d < MIN_BIRTHDAY || d > today) error = 'Ngày sinh bắt buộc và không hợp lệ.'; break; }
        case 'guardian_cccd': if (!value || !/^\d{12}$/.test(value)) error = 'CCCD người thân bắt buộc và phải 12 chữ số.'; break;
        case 'guardian_birthday': if (!value || !isValidGuardianBirthday(value)) error = 'Ngày sinh người thân bắt buộc và không hợp lệ.'; break;
        case 'guardian_relationship': if (!value || !RELATIONSHIP_OPTIONS.includes(value)) error = 'Quan hệ người thân bắt buộc và không hợp lệ.'; break;
        case 'ethnic_group': if (!value) error = 'Dân tộc bắt buộc.'; break;
        case 'emails': { const list = parseListField(formData.emails).filter(Boolean); if (list.length > 0 && list.some((e) => !EMAIL_REGEX.test(e))) error = 'Email không hợp lệ.'; break; }
        case 'phone_numbers': { const list = parseListField(formData.phone_numbers).filter(Boolean); if (list.length > 0 && list.some((p) => !PHONE_REGEX.test(p))) error = 'Số điện thoại không hợp lệ.'; break; }
        case 'addresses': if (value && !hasValidAddressList(formData.addresses)) error = 'Địa chỉ không hợp lệ.'; break;
        case 'guardian_phone_numbers': { const list = parseListField(formData.guardian_phone_numbers).filter(Boolean); if (list.length > 0 && list.some((p) => !PHONE_REGEX.test(p))) error = 'SĐT người thân không hợp lệ.'; break; }
        case 'guardian_addresses': if (value && !hasValidAddressList(formData.guardian_addresses)) error = 'Địa chỉ người thân không hợp lệ.'; break;
      }
      if (error) setFieldErrors((prev) => ({ ...prev, [field]: error })); else clearFieldError(field);
  };
  
  const handleBlur = (field: keyof StudentFormData) => validateField(field);

  const handleAddressChange = (index: number, field: keyof Address, value: string, key: keyof StudentFormData) => {
    let addresses = parseAddressField(formData[key] as string);
    while (addresses.length <= index) addresses.push({ commune: '', province: '' });
    addresses[index][field] = value;
    
    if (field === 'province') {
        const selected = provinceOptions.find(p => p.value === value);
        const code = selected ? selected.code : null;
        if (key === 'addresses') {
            setSelectedProvinceCode(code);
            addresses[index].commune = ''; 
        } else if (key === 'guardian_addresses') {
            setSelectedGuardianProvinceCode(code);
            addresses[index].commune = ''; 
        }
    }
    handleChange(key, stringifyAddressField(addresses));
  };

  const handleAddAddress = (key: keyof StudentFormData) => {
    const addresses = parseAddressField(formData[key] as string);
    if (addresses.length < 3) {
      addresses.push({ commune: '', province: '' });
      handleChange(key, stringifyAddressField(addresses));
    }
  };
  const handleRemoveAddress = (key: keyof StudentFormData, index: number) => {
    const addresses = parseAddressField(formData[key] as string);
    const newAddresses = addresses.filter((_, i) => i !== index);
    handleChange(key, stringifyAddressField(newAddresses));
  };
  const handleListChange = (field: keyof StudentFormData, index: number, value: string) => {
    const list = parseListField(formData[field] as string);
    list[index] = value;
    handleChange(field, stringifyListField(list));
  };
  const handleAddToList = (field: keyof StudentFormData) => {
    const list = parseListField(formData[field] as string);
    list.push('');
    handleChange(field, stringifyListField(list));
  };
  const handleRemoveFromList = (field: keyof StudentFormData, index: number) => {
    const list = parseListField(formData[field] as string);
    const newList = list.filter((_, i) => i !== index);
    handleChange(field, stringifyListField(newList));
  };

  const validateForm = () => {
     const errors: Record<string, string> = {};
    // Đã xóa validate SSN ở đây
    if (!formData.student_id.trim() || !/^[A-Za-z0-9]{7}$/.test(formData.student_id.trim())) errors.student_id = 'Student ID bắt buộc và phải 7 ký tự.';
    if (!formData.fullname.trim()) errors.fullname = 'Họ và tên bắt buộc.';
    const birthdayDate = new Date(formData.birthday);
    const today = new Date();
    if (!formData.birthday || Number.isNaN(birthdayDate.getTime()) || birthdayDate < MIN_BIRTHDAY || birthdayDate > today) errors.birthday = 'Ngày sinh bắt buộc và không hợp lệ.';
    if (!formData.sex) errors.sex = 'Giới tính bắt buộc.';
    if (!formData.ethnic_group.trim()) errors.ethnic_group = 'Dân tộc bắt buộc.';
    if (!formData.study_status) errors.study_status = 'Residence status bắt buộc.';
    if (!formData.guardian_cccd.trim() || !/^\d{12}$/.test(formData.guardian_cccd.trim())) errors.guardian_cccd = 'CCCD người thân bắt buộc và phải 12 chữ số.';
    if (!formData.guardian_name.trim()) errors.guardian_name = 'Tên người thân bắt buộc.';
    if (!formData.guardian_relationship || !RELATIONSHIP_OPTIONS.includes(formData.guardian_relationship)) errors.guardian_relationship = 'Quan hệ người thân bắt buộc và không hợp lệ.';
    if (!formData.guardian_birthday || !isValidGuardianBirthday(formData.guardian_birthday)) errors.guardian_birthday = 'Ngày sinh người thân bắt buộc và không hợp lệ.';
    if (formData.cccd.trim() && !/^\d{12}$/.test(formData.cccd.trim())) errors.cccd = 'CCCD phải gồm 12 chữ số.';
    if (formData.addresses.trim() && !hasValidAddressList(formData.addresses)) errors.addresses = 'Địa chỉ không hợp lệ.';
    const emailList = parseListField(formData.emails).filter(Boolean);
    if (emailList.length > 0 && emailList.some((email) => !EMAIL_REGEX.test(email))) errors.emails = 'Email không hợp lệ.';
    const phoneList = parseListField(formData.phone_numbers).filter(Boolean);
    if (phoneList.length > 0 && phoneList.some((phone) => !PHONE_REGEX.test(phone))) errors.phone_numbers = 'Số điện thoại không hợp lệ.';
    const guardianPhoneList = parseListField(formData.guardian_phone_numbers).filter(Boolean);
    if (guardianPhoneList.length > 0 && guardianPhoneList.some((phone) => !PHONE_REGEX.test(phone))) errors.guardian_phone_numbers = 'Số điện thoại người thân không hợp lệ.';
    if (formData.guardian_addresses.trim() && !hasValidAddressList(formData.guardian_addresses)) errors.guardian_addresses = 'Địa chỉ người thân không hợp lệ.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError(GENERAL_FORM_ERROR_MESSAGE);
      return false;
    }
    setFieldErrors({});
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
      if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại các trường bị lỗi.');
      setConfirmSaveOpen(false);
      return;
    }
    try {
      const nameParts = formData.fullname.trim().split(/\s+/);
      const lastName = nameParts.pop() || '';
      const firstName = nameParts.join(' ') || '';
      // Không gửi SSN lên
      const payload = { 
          ...formData, 
          cccd: formData.cccd, 
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
    }
  };
  const RedStar = <span className="text-red-500">*</span>;
  
  return (
    <div className='grid grid-cols-1 gap-4 rounded-lg bg-white p-6 text-sm text-gray-700 shadow-md md:grid-cols-2'>
      <Toaster />
      <div className='col-span-full mb-4 text-2xl font-semibold'>Add new student</div>
      {formError && <div className='col-span-full rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{formError}</div>}

       {/* ĐÃ XÓA TRƯỜNG NHẬP SSN */}
      <EditField label={<span>Student ID {RedStar}</span>} value={formData.student_id} isEditing onChange={(v) => handleChange('student_id', v)} onBlur={() => handleBlur('student_id')} error={fieldErrors.student_id} />
      <EditField label={<span>CCCD {RedStar}</span>} value={formData.cccd} isEditing onChange={(v) => handleChange('cccd', v)} onBlur={() => handleBlur('cccd')} error={fieldErrors.cccd} />
      <EditField label={<span>Full name {RedStar}</span>} value={formData.fullname} isEditing onChange={(v) => handleChange('fullname', v)} onBlur={() => handleBlur('fullname')} error={fieldErrors.fullname} />
      <EditField label={<span>Birthday {RedStar}</span>} value={formData.birthday} type='date' isEditing onChange={(v) => handleChange('birthday', v)} onBlur={() => handleBlur('birthday')} error={fieldErrors.birthday} icon={<img src={CalendarIcon} className='h-5 w-5' />} />
      <SelectField label={<span>Sex {RedStar}</span>} value={formData.sex} options={[{ label: 'Male', value: 'M' }, { label: 'Female', value: 'F' }]} isEditing onChange={(v) => handleChange('sex', v)} onBlur={() => handleBlur('sex')} error={fieldErrors.sex} />
      
      <SelectField label={<span>Ethnic Group {RedStar}</span>} value={formData.ethnic_group} isEditing options={ETHNIC_GROUP_OPTIONS} onChange={(v) => handleChange('ethnic_group', v)} onBlur={() => handleBlur('ethnic_group')} error={fieldErrors.ethnic_group} />
      <SelectField label='Faculty' value={formData.faculty} isEditing options={FACULTY_OPTIONS} onChange={(v) => handleChange('faculty', v)} onBlur={() => handleBlur('faculty')} error={fieldErrors.faculty} />
      
      <SelectField label={<span>Residence status {RedStar}</span>} value={formData.study_status} options={[{ label: 'Active', value: 'Active' }, { label: 'Non active', value: 'Non_Active' }]} isEditing onChange={(v) => handleChange('study_status', v)} onBlur={() => handleBlur('study_status')} error={fieldErrors.study_status} />
      
      {/* ĐÃ ẨN Building/Room TRONG ADD (Theo code cũ cũng ko có) */}

      <InputAddress label='Addresses' values={parseAddressField(formData.addresses)} isEditing provinceOptions={provinceOptions} wardOptions={wardOptions} selectedProvinceCode={selectedProvinceCode} onChange={(i, f, v) => handleAddressChange(i, f, v, 'addresses')} onAdd={() => handleAddAddress('addresses')} onRemove={(i) => handleRemoveAddress('addresses', i)} onBlur={() => handleBlur('addresses')} error={fieldErrors.addresses} />
      <EditForm label='Emails' values={parseListField(formData.emails)} isEditing onChange={(i, v) => handleListChange('emails', i, v)} onAdd={() => handleAddToList('emails')} onRemove={(i) => handleRemoveFromList('emails', i)} onBlur={() => handleBlur('emails')} error={fieldErrors.emails} />
      <EditForm label='Phone Numbers' values={parseListField(formData.phone_numbers)} isEditing onChange={(i, v) => handleListChange('phone_numbers', i, v)} onAdd={() => handleAddToList('phone_numbers')} onRemove={(i) => handleRemoveFromList('phone_numbers', i)} onBlur={() => handleBlur('phone_numbers')} error={fieldErrors.phone_numbers} />

      <div className='col-span-full mt-6 text-lg font-semibold'>Guardian Information:</div>
      <EditField label={<span>CCCD {RedStar}</span>} value={formData.guardian_cccd} isEditing onChange={(v) => handleChange('guardian_cccd', v)} onBlur={() => handleBlur('guardian_cccd')} error={fieldErrors.guardian_cccd} />
      <EditField label={<span>Full name {RedStar}</span>} value={formData.guardian_name} isEditing onChange={(v) => handleChange('guardian_name', v)} onBlur={() => handleBlur('guardian_name')} error={fieldErrors.guardian_name} />
      <SelectField label={<span>Relationship {RedStar}</span>} value={formData.guardian_relationship} options={[{ label: 'Father', value: 'Father' }, { label: 'Mother', value: 'Mother' }, { label: 'Other', value: 'Other' }]} isEditing onChange={(v) => handleChange('guardian_relationship', v)} onBlur={() => handleBlur('guardian_relationship')} error={fieldErrors.guardian_relationship} />
      <EditField label='Occupation' value={formData.guardian_occupation} isEditing onChange={(v) => handleChange('guardian_occupation', v)} onBlur={() => handleBlur('guardian_occupation')} error={fieldErrors.guardian_occupation} />
      <EditField label={<span>Birthday {RedStar}</span>} value={formData.guardian_birthday} type='date' isEditing onChange={(v) => handleChange('guardian_birthday', v)} onBlur={() => handleBlur('guardian_birthday')} error={fieldErrors.guardian_birthday} icon={<img src={CalendarIcon} className='h-5 w-5' />} />
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