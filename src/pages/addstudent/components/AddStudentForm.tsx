import { useState } from 'react';
import { Button } from '@/components/ui/button';
import EditField from '@/components/layout/EditField';
import SelectField from '@/components/layout/SelectField';
import BooleanSelectField from '@/components/layout/BooleanSelectField';
import InputAddress from './InputAddress';
import EditForm from './EditForm';
import ConfirmDialog from '@/components/layout/ConfirmDialog';
import { DialogFooter } from '@/components/ui/dialog';
import { addStudent } from '@/services/studentService';
import { toast, Toaster } from 'react-hot-toast';
import CalendarIcon from '@/assets/calendar.svg';
import { useNavigate } from 'react-router-dom';

interface Address {
  commune: string;
  province: string;
}
interface StudentFormData {
  ssn: string;
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
const MIN_BIRTHDAY = new Date('2000-01-01');
const GUARDIAN_MIN_BIRTHDAY = new Date('1950-01-01');
const GUARDIAN_MAX_BIRTHDAY = new Date('2005-12-31');
const RELATIONSHIP_OPTIONS = ['Father', 'Mother', 'Other'];
const GENERAL_FORM_ERROR_MESSAGE =
  'Vui lòng kiểm tra lại thông tin sinh viên và sửa các lỗi được chỉ ra.';

const AddStudentForm = () => {
  const [formData, setFormData] = useState<StudentFormData>({
  ssn: '',
  cccd: '',
  student_id: '',
  fullname: '',
  birthday: '',
  sex: '',
  health_state: '',
  has_health_insurance: false,
  ethnic_group: '',
  class_name: '',
  faculty: '',
  study_status: '',
  building_id: '',
  room_id: '',
  addresses: '',
  emails: '',
  phone_numbers: '',
  guardian_cccd: '',
  guardian_name: '',
  guardian_relationship: '',
  guardian_occupation: '',
  guardian_birthday: '',
  guardian_phone_numbers: '',
  guardian_addresses: '',
});
  const navigate = useNavigate();

  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // ================== Helpers ==================
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
    setFormError(null);
  };

  const parseAddressField = (value: string): Address[] =>
    value
      ? value.split(';').map((item) => {
          const [commune = '', province = ''] = item.split(',');
          return { commune, province };
        })
      : [];

  const stringifyAddressField = (list: Address[]): string =>
    list.map((addr) => [addr.commune, addr.province].join(',')).join(';');

  const parseListField = (value: string) =>
    value ? value.split(';').map((v) => v.trim()) : [];

  const stringifyListField = (list: string[]) =>
    list.map((v) => v.trim()).join(';');

  const hasValidAddressList = (value: string) => {
    const addresses = parseAddressField(value);
    return (
      addresses.length > 0 &&
      addresses.every(
        (addr) => addr.commune.trim().length && addr.province.trim().length,
      )
    );
  };

  const isValidGuardianBirthday = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    return date >= GUARDIAN_MIN_BIRTHDAY && date <= GUARDIAN_MAX_BIRTHDAY;
  };

  // ============= Address Control =============
  const handleAddressChange = (
    index: number,
    field: keyof Address,
    value: string,
    key: keyof StudentFormData,
  ) => {
    let addresses = parseAddressField(formData[key]as string);
    while (addresses.length <= index)
      addresses.push({ commune: '', province: '' });
    addresses[index][field] = value;
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

  // ============= List Control =============
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
    const ssn = formData.ssn.trim();
    if (!/^\d{8}$/.test(ssn)) {
      errors.ssn = 'SSN không hợp lệ hoặc đã tồn tại.';
    }

    if (!/^[A-Za-z0-9]{7}$/.test(formData.student_id.trim())) {
      errors.student_id = 'Mã sinh viên không hợp lệ hoặc đã tồn tại.';
    }

    if (!formData.fullname.trim()) {
      errors.fullname = 'Họ và tên không được để trống.';
    }

    if (!formData.birthday) {
      errors.birthday = 'Ngày sinh không hợp lệ.';
    } else {
      const birthdayDate = new Date(formData.birthday);
      const today = new Date();
      if (
        Number.isNaN(birthdayDate.getTime()) ||
        birthdayDate < MIN_BIRTHDAY ||
        birthdayDate > today
      ) {
        errors.birthday = 'Ngày sinh không hợp lệ.';
      }
    }

    if (!formData.study_status) {
      errors.study_status =
        'Trường lựa chọn không hợp lệ. Vui lòng kiểm tra lại các trường đã chọn.';
    }

    if (!formData.building_id) {
      errors.building_id =
        'Trường lựa chọn không hợp lệ. Vui lòng kiểm tra lại các trường đã chọn.';
    }

    if (!formData.room_id) {
      errors.room_id =
        'Trường lựa chọn không hợp lệ. Vui lòng kiểm tra lại các trường đã chọn.';
    }

    if (!hasValidAddressList(formData.addresses)) {
      errors.addresses = 'Địa chỉ không hợp lệ.';
    }

    const emailList = parseListField(formData.emails).filter(Boolean);
    if (emailList.some((email) => !EMAIL_REGEX.test(email))) {
      errors.emails = 'Email không hợp lệ.';
    }

    const phoneList = parseListField(formData.phone_numbers).filter(Boolean);
    if (phoneList.some((phone) => !PHONE_REGEX.test(phone))) {
      errors.phone_numbers = 'Số điện thoại không hợp lệ.';
    }

    if (!/^\d{12}$/.test(formData.guardian_cccd.trim())) {
      errors.guardian_cccd = 'CCCD người thân phải gồm 12 chữ số.';
    }

    if (!formData.guardian_name.trim()) {
      errors.guardian_name = 'Tên người thân không hợp lệ.';
    }

    if (!RELATIONSHIP_OPTIONS.includes(formData.guardian_relationship)) {
      errors.guardian_relationship = 'Quan hệ với người thân không hợp lệ.';
    }

    if (
      !formData.guardian_birthday ||
      !isValidGuardianBirthday(formData.guardian_birthday)
    ) {
      errors.guardian_birthday = 'Ngày sinh người thân không hợp lệ.';
    }

    const guardianPhoneList = parseListField(
      formData.guardian_phone_numbers,
    ).filter(Boolean);
    if (guardianPhoneList.some((phone) => !PHONE_REGEX.test(phone))) {
      errors.guardian_phone_numbers = 'Số điện thoại người thân không hợp lệ.';
    }

    if (!hasValidAddressList(formData.guardian_addresses)) {
      errors.guardian_addresses = 'Địa chỉ người thân không hợp lệ.';
    }

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
      const targetField =
        field === 'first_name' || field === 'last_name' ? 'fullname' : field;
      mapped[targetField] = message;
    });
    setFieldErrors(mapped);
    if (Object.keys(mapped).length > 0) {
      setFormError(GENERAL_FORM_ERROR_MESSAGE);
    }
  };

  // ============= Save Student =============
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

      const payload = {
        ...formData,
        cccd: formData.cccd,
        first_name: firstName,
        last_name: lastName,
        has_health_insurance: !!formData.has_health_insurance,
      };

      await addStudent(payload as any);
      toast.success('Student added successfully!');
      setFormError(null);
      setTimeout(() => navigate('/students'), 800);
      setConfirmSaveOpen(false);
    } catch (err: any) {
      console.error('❌ Add student error:', err);
      mapBackendErrors(err?.response?.data?.fieldErrors);
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to add student';
      setFormError(message);
      toast.error(message);
      setConfirmSaveOpen(false);
    }
  };

  // ================== Render ==================
  return (
    <div className='grid grid-cols-1 gap-4 rounded-lg bg-white p-6 text-sm text-gray-700 shadow-md md:grid-cols-2'>
      <Toaster />
      <div className='col-span-full mb-4 text-2xl font-semibold'>
        Add new student
      </div>
      {formError && (
        <div className='col-span-full rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
          {formError}
        </div>
      )}

      {/* ========= Student Info ========= */}
      <EditField
        label='SSN (*)'
        value={formData.ssn}
        isEditing
        onChange={(v) => handleChange('ssn', v)}
        error={fieldErrors.ssn}
      />
      <EditField
        label='Student ID (*)'
        value={formData.student_id}
        isEditing
        onChange={(v) => handleChange('student_id', v)}
        error={fieldErrors.student_id}
      />
      <EditField
        label='CCCD(*)'
        value={formData.cccd}
        isEditing
        onChange={(v) => handleChange('cccd', v)}
      />
      <EditField
        label='Full name (*)'
        value={formData.fullname}
        isEditing
        onChange={(v) => handleChange('fullname', v)}
        error={fieldErrors.fullname}
      />
      <EditField
        label='Birthday (*)'
        value={formData.birthday}
        type='date'
        isEditing
        onChange={(v) => handleChange('birthday', v)}
        error={fieldErrors.birthday}
        icon={<img src={CalendarIcon} className='h-5 w-5' />}
      />
      <SelectField
        label='Sex (*)'
        value={formData.sex}
        options={[
          { label: 'Male', value: 'M' },
          { label: 'Female', value: 'F' },
        ]}
        isEditing
        onChange={(v) => handleChange('sex', v)}
      />
      <BooleanSelectField
        label='Has health insurance'
        value={formData.has_health_insurance}
        options={[
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ]}
        isEditing
        onChange={(v) => handleChange('has_health_insurance', v)}
      />
      <EditField
        label='Health State'
        value={formData.health_state}
        isEditing
        onChange={(v) => handleChange('health_state', v)}
      />
      <EditField
        label='Ethnic Group (*)'
        value={formData.ethnic_group}
        isEditing
        onChange={(v) => handleChange('ethnic_group', v)}
      />
      <EditField
        label='Faculty'
        value={formData.faculty}
        isEditing
        onChange={(v) => handleChange('faculty', v)}
      />
      <EditField
        label='Class'
        value={formData.class_name}
        isEditing
        onChange={(v) => handleChange('class_name', v)}
      />
      <SelectField
        label='Study Status (*)'
        value={formData.study_status}
        options={[
          { label: 'Active', value: 'Active' },
          { label: 'Non active', value: 'Non_Active' },
        ]}
        isEditing
        onChange={(v) => handleChange('study_status', v)}
        error={fieldErrors.study_status}
      />
      <SelectField
        label='Building'
        value={formData.building_id}
        options={[
          { label: 'BK001', value: 'BK001' },
          { label: 'BK002', value: 'BK002' },
          { label: 'BK003', value: 'BK003' },
          { label: 'BK004', value: 'BK004' },
        ]}
        isEditing
        onChange={(v) => handleChange('building_id', v)}
        error={fieldErrors.building_id}
      />
      <SelectField
        label='Room'
        value={formData.room_id}
        options={[
          { label: 'P.101', value: 'P.101' },
          { label: 'P.201', value: 'P.201' },
          { label: 'P.301', value: 'P.301' },
          { label: 'P.401', value: 'P.401' },
        ]}
        isEditing
        onChange={(v) => handleChange('room_id', v)}
        error={fieldErrors.room_id}
      />

      {/* ========= Address, Email, Phone ========= */}
      <InputAddress
        label='Addresses'
        values={parseAddressField(formData.addresses)}
        isEditing
        onChange={(i, f, v) => handleAddressChange(i, f, v, 'addresses')}
        onAdd={() => handleAddAddress('addresses')}
        onRemove={(i) => handleRemoveAddress('addresses', i)}
        error={fieldErrors.addresses}
      />
      <EditForm
        label='Emails'
        values={parseListField(formData.emails)}
        isEditing
        onChange={(i, v) => handleListChange('emails', i, v)}
        onAdd={() => handleAddToList('emails')}
        onRemove={(i) => handleRemoveFromList('emails', i)}
        error={fieldErrors.emails}
      />
      <EditForm
        label='Phone Numbers'
        values={parseListField(formData.phone_numbers)}
        isEditing
        onChange={(i, v) => handleListChange('phone_numbers', i, v)}
        onAdd={() => handleAddToList('phone_numbers')}
        onRemove={(i) => handleRemoveFromList('phone_numbers', i)}
        error={fieldErrors.phone_numbers}
      />

      {/* ========= Guardian Information ========= */}
      <div className='col-span-full mt-6 text-lg font-semibold'>
        Guardian Information:
      </div>

      <EditField
        label='CCCD (*)'
        value={formData.guardian_cccd}
        isEditing
        onChange={(v) => handleChange('guardian_cccd', v)}
        error={fieldErrors.guardian_cccd}
      />
      <EditField
        label='Full name (*)'
        value={formData.guardian_name}
        isEditing
        onChange={(v) => handleChange('guardian_name', v)}
        error={fieldErrors.guardian_name}
      />
      <SelectField
        label='Relationship (*)'
        value={formData.guardian_relationship}
        options={[
          { label: 'Father', value: 'Father' },
          { label: 'Mother', value: 'Mother' },
          { label: 'Other', value: 'Other' },
        ]}
        isEditing
        onChange={(v) => handleChange('guardian_relationship', v)}
        error={fieldErrors.guardian_relationship}
      />
      <EditField
        label='Occupation'
        value={formData.guardian_occupation}
        isEditing
        onChange={(v) => handleChange('guardian_occupation', v)}
      />
      <EditField
        label='Birthday'
        value={formData.guardian_birthday}
        type='date'
        isEditing
        onChange={(v) => handleChange('guardian_birthday', v)}
        error={fieldErrors.guardian_birthday}
        icon={<img src={CalendarIcon} className='h-5 w-5' />}
      />
      <EditForm
        label='Phone Numbers'
        values={parseListField(formData.guardian_phone_numbers)}
        isEditing
        onChange={(i, v) => handleListChange('guardian_phone_numbers', i, v)}
        onAdd={() => handleAddToList('guardian_phone_numbers')}
        onRemove={(i) => handleRemoveFromList('guardian_phone_numbers', i)}
        error={fieldErrors.guardian_phone_numbers}
      />
      <InputAddress
        label='Addresses'
        values={parseAddressField(formData.guardian_addresses)}
        isEditing
        onChange={(i, f, v) =>
          handleAddressChange(i, f, v, 'guardian_addresses')
        }
        onAdd={() => handleAddAddress('guardian_addresses')}
        onRemove={(i) => handleRemoveAddress('guardian_addresses', i)}
        error={fieldErrors.guardian_addresses}
      />

      {/* Footer */}
      <DialogFooter className='col-span-full mt-8 flex justify-end'>
        <Button
          style={{ backgroundColor: '#032B91' }}
          onClick={() => setConfirmSaveOpen(true)}
        >
          Save
        </Button>
      </DialogFooter>

      <ConfirmDialog
        open={confirmSaveOpen}
        onOpenChange={setConfirmSaveOpen}
        title='Confirm Save'
        message='Are you sure you want to save this student?'
        confirmColor='blue'
        onConfirm={handleSave}
      />
    </div>
  );
};

export default AddStudentForm;
