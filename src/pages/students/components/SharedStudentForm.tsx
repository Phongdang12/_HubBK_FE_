import React, { useState } from 'react';
import { Student, updateStudent } from '@/services/studentService';
import { Button } from '@/components/ui/button';
import EditField from '@/components/layout/EditField';
import SelectField from '@/components/layout/SelectField';
import BooleanSelectField from '@/components/layout/BooleanSelectField';
import InputAddress from '@/pages/addstudent/components/InputAddress';
import EditForm from '@/pages/addstudent/components/EditForm';
import { useNavigate } from 'react-router-dom';
import { DialogFooter } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import CalendarIcon from '@/assets/calendar.svg';

interface Address {
  commune: string;
  province: string;
}

interface Props {
  student: Student;
  mode: 'view' | 'edit';
  onSubmit?: (data: Student) => Promise<void>; // trả về Promise để EditStudentPage có thể await
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+?\d{1,3})?[\s-]?\d{9,}$/;
const MIN_BIRTHDAY = new Date('2000-01-01');
const GUARDIAN_MIN_BIRTHDAY = new Date('1950-01-01');
const GUARDIAN_MAX_BIRTHDAY = new Date('2005-12-31');
const RELATIONSHIP_OPTIONS = ['Father', 'Mother', 'Other'];
const GENERAL_FORM_ERROR_MESSAGE =
  'Vui lòng kiểm tra lại thông tin sinh viên và sửa các lỗi được chỉ ra.';

const SharedStudentForm: React.FC<Props> = ({ student, mode, onSubmit }) => {
  const navigate = useNavigate();
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const [formData, setFormData] = useState<Student>({
    ...student,
    fullname: `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim(),
    cccd: (student as any).cccd || '',
    addresses: student.addresses || '',
    emails: student.emails || '',
    phone_numbers: student.phone_numbers || '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // ================= Helpers =================
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleChange = (field: keyof Student | string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field as string);
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
    const addresses = parseAddressField(value || '');
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

  // Address helpers
  const handleAddressChange = (
    i: number,
    field: keyof Address,
    val: string,
    key: string,
  ) => {
    let addresses = parseAddressField((formData as any)[key] || '');
    while (addresses.length <= i) addresses.push({ commune: '', province: '' });
    addresses[i][field] = val;
    handleChange(key, stringifyAddressField(addresses));
  };

  const handleAddAddress = (key: string) => {
    const addr = parseAddressField((formData as any)[key] || '');
    if (addr.length < 3)
      handleChange(
        key,
        stringifyAddressField([...addr, { commune: '', province: '' }]),
      );
  };

  const handleRemoveAddress = (key: string, index: number) => {
    const addr = parseAddressField((formData as any)[key] || '');
    const newAddr = addr.filter((_, i) => i !== index);
    handleChange(key, stringifyAddressField(newAddr));
  };

  // List helpers
  const handleListChange = (field: keyof Student, i: number, val: string) => {
    const list = parseListField((formData as any)[field] || '');
    list[i] = val;
    handleChange(field, stringifyListField(list));
  };

  const handleAddToList = (field: keyof Student) => {
    const list = parseListField((formData as any)[field] || '');
    list.push('');
    handleChange(field, stringifyListField(list));
  };

  const handleRemoveFromList = (field: keyof Student, i: number) => {
    const list = parseListField((formData as any)[field] || '');
    handleChange(field, stringifyListField(list.filter((_, idx) => idx !== i)));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const fullname = (formData as any).fullname || '';
    if (!fullname.trim()) {
      errors.fullname = 'Họ và tên không được để trống.';
    }

    if (!formData.student_id || !/^[A-Za-z0-9]{7}$/.test(formData.student_id)) {
      errors.student_id = 'Mã sinh viên không hợp lệ hoặc đã tồn tại.';
    }

    if (formData.birthday) {
      const birthdayDate = new Date(formData.birthday);
      const today = new Date();
      if (
        Number.isNaN(birthdayDate.getTime()) ||
        birthdayDate < MIN_BIRTHDAY ||
        birthdayDate > today
      ) {
        errors.birthday = 'Ngày sinh không hợp lệ.';
      }
    } else {
      errors.birthday = 'Ngày sinh không hợp lệ.';
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

    if (!hasValidAddressList(formData.addresses || '')) {
      errors.addresses = 'Địa chỉ không hợp lệ.';
    }

    const emailList = parseListField(formData.emails || '').filter(Boolean);
    if (emailList.some((email) => !EMAIL_REGEX.test(email))) {
      errors.emails = 'Email không hợp lệ.';
    }

    const phoneList = parseListField(formData.phone_numbers || '').filter(Boolean);
    if (phoneList.some((phone) => !PHONE_REGEX.test(phone))) {
      errors.phone_numbers = 'Số điện thoại không hợp lệ.';
    }

    const guardianCccd = ((formData as any).guardian_cccd || '').trim();
    if (!/^\d{12}$/.test(guardianCccd)) {
      errors.guardian_cccd = 'CCCD người thân phải gồm 12 chữ số.';
    }

    const guardianName = ((formData as any).guardian_name || '').trim();
    if (!guardianName) {
      errors.guardian_name = 'Tên người thân không hợp lệ.';
    }

    const relationship = (formData as any).guardian_relationship || '';
    if (!RELATIONSHIP_OPTIONS.includes(relationship)) {
      errors.guardian_relationship = 'Quan hệ với người thân không hợp lệ.';
    }

    const guardianBirthday = (formData as any).guardian_birthday;
    if (!guardianBirthday || !isValidGuardianBirthday(guardianBirthday)) {
      errors.guardian_birthday = 'Ngày sinh người thân không hợp lệ.';
    }

    const guardianPhoneList = parseListField(
      (formData as any).guardian_phone_numbers || '',
    ).filter(Boolean);
    if (
      guardianPhoneList.length === 0 ||
      guardianPhoneList.some((phone) => !PHONE_REGEX.test(phone))
    ) {
      errors.guardian_phone_numbers = 'Số điện thoại người thân không hợp lệ.';
    }

    const guardianAddresses = (formData as any).guardian_addresses || '';
    if (!hasValidAddressList(guardianAddresses)) {
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

  // ================= Save =================
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại các trường bị lỗi.');
      return;
    }

    try {
      // chuyển fullname -> first_name, last_name
      const fullname = (formData as any).fullname || '';
      const parts = fullname.trim().split(/\s+/);
      const last_name = parts.length ? parts[parts.length - 1] : '';
      const first_name = parts.length > 1 ? parts.slice(0, -1).join(' ') : '';

      const payload: Student = {
        ...formData,
        first_name,
        last_name,
        cccd: (formData as any).cccd || '',
        // đảm bảo định dạng ngày
        birthday: formData.birthday
  ? new Date(formData.birthday).toISOString().split('T')[0]
  : '',

        emails: formData.emails || '',
        phone_numbers: formData.phone_numbers || '',
        addresses: formData.addresses || '',
        has_health_insurance: !!(formData as any).has_health_insurance,
      } as Student;

      console.log('🟡 SharedStudentForm -> payload:', payload);

      if (onSubmit) {
        await onSubmit(payload);
        navigate(`/students/view/${payload.ssn}`);
      } else {
        await updateStudent(payload.ssn, payload);
        toast.success('Student updated successfully!');
        navigate(`/students/view/${payload.ssn}`);
      }
      setFormError(null);
    } catch (error: any) {
      console.error('❌ Update failed (SharedStudentForm):', error);
      mapBackendErrors(error?.response?.data?.fieldErrors);
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update student. Please try again.';
      setFormError(msg);
      toast.error(msg);
    }
  };

  // ================= Render =================
  return (
    <div className='grid grid-cols-1 gap-4 rounded-lg bg-white p-6 text-sm text-gray-700 shadow-md md:grid-cols-2'>
      <div className='col-span-full mb-4 text-2xl font-semibold'>
        {isEdit ? 'Edit Student Information' : 'Student Information'}
      </div>
      {formError && (
        <div className='col-span-full rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
          {formError}
        </div>
      )}

      {/* BASIC */}
      <EditField
        label='SSN (*)'
        value={formData.ssn}
        isEditing={false}
        onChange={(v) => handleChange('ssn', v)}
      />
      <EditField
        label='Student ID (*)'
        value={formData.student_id || ''}
        isEditing={isEdit}
        onChange={(v) => handleChange('student_id', v)}
        error={fieldErrors.student_id}
      />
      <EditField
        label='CCCD (*)'
        value={(formData as any).cccd || ''}
        isEditing={isEdit}
        onChange={(v) => handleChange('cccd', v)}
      />
      <EditField
        label='Full name (*)'
        value={(formData as any).fullname || ''}
        isEditing={isEdit}
        onChange={(v) => handleChange('fullname', v)}
        error={fieldErrors.fullname}
      />

      <EditField
        label='Birthday'
        value={
  formData.birthday
    ? new Date(formData.birthday).toISOString().slice(0, 10)
    : ''
}

        type='date'
        isEditing={isEdit}
        onChange={(v) => handleChange('birthday', v)}
        error={fieldErrors.birthday}
        icon={<img src={CalendarIcon} className='h-5 w-5' />}
      />

      <SelectField
        label='Sex'
        value={formData.sex}
        options={[
          { label: 'Male', value: 'M' },
          { label: 'Female', value: 'F' },
        ]}
        isEditing={isEdit}
        onChange={(v) => handleChange('sex', v)}
      />

      <BooleanSelectField
        label='Has health insurance'
        value={(formData as any).has_health_insurance}
        options={[
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ]}
        isEditing={isEdit}
        onChange={(v) => handleChange('has_health_insurance' as any, v)}
      />

      <EditField
        label='Health State'
        value={formData.health_state || ''}
        isEditing={isEdit}
        onChange={(v) => handleChange('health_state', v)}
      />
      <EditField
        label='Ethnic Group'
        value={formData.ethnic_group || ''}
        isEditing={isEdit}
        onChange={(v) => handleChange('ethnic_group', v)}
      />
      <EditField
        label='Faculty'
        value={formData.faculty || ''}
        isEditing={isEdit}
        onChange={(v) => handleChange('faculty', v)}
      />
      <EditField
        label='Class'
        value={formData.class_name || ''}
        isEditing={isEdit}
        onChange={(v) => handleChange('class_name', v)}
      />
      <SelectField
        label='Study Status'
        value={formData.study_status || ''}
        options={[
          { label: 'Active', value: 'Active' },
          { label: 'Non Active', value: 'Non_Active' },
        ]}
        isEditing={isEdit}
        onChange={(v) => handleChange('study_status', v)}
        error={fieldErrors.study_status}
      />
      <SelectField
        label='Building'
        value={formData.building_id || ''}
        options={[
          { label: 'BK001', value: 'BK001' },
          { label: 'BK002', value: 'BK002' },
          { label: 'BK003', value: 'BK003' },
          { label: 'BK004', value: 'BK004' },
        ]}
        isEditing={isEdit}
        onChange={(v) => handleChange('building_id', v)}
        error={fieldErrors.building_id}
      />
      <SelectField
        label='Room'
        value={formData.room_id || ''}
        options={[
          { label: 'P.101', value: 'P.101' },
          { label: 'P.201', value: 'P.201' },
          { label: 'P.301', value: 'P.301' },
          { label: 'P.401', value: 'P.401' },
        ]}
        isEditing={isEdit}
        onChange={(v) => handleChange('room_id', v)}
        error={fieldErrors.room_id}
      />

      {/* ADDRESSES */}
      <InputAddress
        label='Addresses'
        values={parseAddressField(formData.addresses || '')}
        isEditing={isEdit}
        onChange={(i, f, v) => handleAddressChange(i, f, v, 'addresses')}
        onAdd={() => handleAddAddress('addresses')}
        onRemove={(i) => handleRemoveAddress('addresses', i)}
        error={fieldErrors.addresses}
      />

      {/* EMAIL / PHONE */}
      <EditForm
        label='Emails'
        values={parseListField(formData.emails || '')}
        isEditing={isEdit}
        onChange={(i, v) => handleListChange('emails', i, v)}
        onAdd={() => handleAddToList('emails')}
        onRemove={(i) => handleRemoveFromList('emails', i)}
        error={fieldErrors.emails}
      />
      <EditForm
        label='Phone Numbers'
        values={parseListField(formData.phone_numbers || '')}
        isEditing={isEdit}
        onChange={(i, v) => handleListChange('phone_numbers', i, v)}
        onAdd={() => handleAddToList('phone_numbers')}
        onRemove={(i) => handleRemoveFromList('phone_numbers', i)}
        error={fieldErrors.phone_numbers}
      />

      {/* GUARDIAN */}
      <div className='col-span-full mt-6 text-lg font-semibold'>Guardian Information:</div>

      <EditField
        label='CCCD (*)'
        value={(formData as any).guardian_cccd || ''}
        isEditing={isEdit}
        onChange={(v) => handleChange('guardian_cccd' as any, v)}
        error={fieldErrors.guardian_cccd}
      />
      <EditField
        label='Full name (*)'
        value={(formData as any).guardian_name || ''}
        isEditing={isEdit}
        onChange={(v) => handleChange('guardian_name' as any, v)}
        error={fieldErrors.guardian_name}
      />
      <SelectField
        label='Relationship (*)'
        value={(formData as any).guardian_relationship || ''}
        options={[
          { label: 'Father', value: 'Father' },
          { label: 'Mother', value: 'Mother' },
          { label: 'Other', value: 'Other' },
        ]}
        isEditing={isEdit}
        onChange={(v) => handleChange('guardian_relationship' as any, v)}
        error={fieldErrors.guardian_relationship}
      />
      <EditField
        label='Occupation'
        value={(formData as any).guardian_occupation || ''}
        isEditing={isEdit}
        onChange={(v) => handleChange('guardian_occupation' as any, v)}
      />
      <EditField
        label='Birthday'
        value={(formData as any).guardian_birthday ? String((formData as any).guardian_birthday).slice(0, 10) : ''}
        type='date'
        isEditing={isEdit}
        onChange={(v) => handleChange('guardian_birthday' as any, v)}
        error={fieldErrors.guardian_birthday}
        icon={<img src={CalendarIcon} className='h-5 w-5' />}
      />
      <EditForm
        label='Phone Numbers'
        values={parseListField((formData as any).guardian_phone_numbers || '')}
        isEditing={isEdit}
        onChange={(i, v) => handleListChange('guardian_phone_numbers' as any, i, v)}
        onAdd={() => handleAddToList('guardian_phone_numbers' as any)}
        onRemove={(i) => handleRemoveFromList('guardian_phone_numbers' as any, i)}
        error={fieldErrors.guardian_phone_numbers}
      />
      <InputAddress
        label='Addresses'
        values={parseAddressField((formData as any).guardian_addresses || '')}
        isEditing={isEdit}
        onChange={(i, f, v) => handleAddressChange(i, f, v, 'guardian_addresses')}
        onAdd={() => handleAddAddress('guardian_addresses')}
        onRemove={(i) => handleRemoveAddress('guardian_addresses', i)}
        error={fieldErrors.guardian_addresses}
      />

      {/* FOOTER */}
      <DialogFooter className='col-span-full mt-6 flex justify-end gap-3'>
        {isView && (
          <Button style={{ backgroundColor: '#032B91', color: 'white' }} onClick={() => navigate(`/students/edit/${formData.ssn}`)}>
            Edit
          </Button>
        )}
        {isEdit && (
          <>
            <Button variant='outline' className='border-gray-400 text-gray-700 hover:bg-gray-100' onClick={() => navigate('/students/view/' + formData.ssn)}>
              Cancel
            </Button>
            <Button style={{ backgroundColor: '#032B91', color: 'white' }} onClick={() => handleSave()}>
              Save
            </Button>
          </>
        )}
      </DialogFooter>
    </div>
  );
};

export default SharedStudentForm;
