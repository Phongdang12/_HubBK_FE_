// fileName: SharedStudentForm.tsx
import React, { useState, useEffect } from 'react';
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
import { getDisciplineForms, DisciplineFormType } from "@/services/disciplineFormService";
import { Building, DoorOpen, AlertTriangle, XCircle, CheckCircle, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter as ModalFooter } from '@/components/ui/dialog';
import { getDisciplineByStudentId, Discipline } from '@/services/disciplineService';
import { cn } from '@/lib/utils';

interface Address { commune: string; province: string; }
interface Props { student: Student; mode: 'view' | 'edit'; onSubmit?: (data: Student) => Promise<void>; }
interface Option { label: string; value: string; code: number; }

const fetchApi = async (url: string, params: Record<string, any> = {}) => {
  const serverUrl = 'https://provinces.open-api.vn/api/v2'; 
  const queryString = new URLSearchParams(params).toString();
  const fullUrl = `${serverUrl}${url}${queryString ? '?' + queryString : ''}`;
  const response = await fetch(fullUrl);
  if (!response.ok) throw new Error('API Error');
  return response.json();
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+?\d{1,3})?[\s-]?\d{9,}$/;
const MIN_BIRTHDAY = new Date('2000-01-01');
const GUARDIAN_MIN_BIRTHDAY = new Date('1950-01-01');
const GUARDIAN_MAX_BIRTHDAY = new Date('2005-12-31');
const STARTING_SCORE = 100;
const EXPULSION_THRESHOLD = 70;
const GENERAL_FORM_ERROR_MESSAGE = 'Vui lòng kiểm tra lại thông tin sinh viên và sửa các lỗi được chỉ ra.';

const SharedStudentForm: React.FC<Props> = ({ student, mode, onSubmit }) => {
  const navigate = useNavigate();
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  
  const [dynamicForms, setDynamicForms] = useState<DisciplineFormType[]>([]);
  const [formData, setFormData] = useState<Student>({
    ...student,
    fullname: `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim(),
    cccd: (student as any).cccd || '',
    addresses: student.addresses || '',
    emails: student.emails || '',
    phone_numbers: student.phone_numbers || '',
    guardian_cccd: (student as any).guardian_cccd || '',
    guardian_name: (student as any).guardian_name || '',
    guardian_relationship: (student as any).guardian_relationship || '',
    guardian_occupation: (student as any).guardian_occupation || '',
    guardian_birthday: (student as any).guardian_birthday || '',
    guardian_phone_numbers: (student as any).guardian_phone_numbers || '',
    guardian_addresses: (student as any).guardian_addresses || '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [provinceOptions, setProvinceOptions] = useState<Option[]>([]);
  const [wardOptions, setWardOptions] = useState<Option[]>([]);
  const [guardianWardOptions, setGuardianWardOptions] = useState<Option[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedGuardianProvinceCode, setSelectedGuardianProvinceCode] = useState<number | null>(null);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [isDisciplineModalOpen, setIsDisciplineModalOpen] = useState(false);

  const getDeduction = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 2;
      case 'medium': return 5;
      case 'high': return 10;
      case 'expulsion': return 31; 
      default: return 0;
    }
  };
  const totalDeduction = disciplines.reduce((sum, d) => {
    if (d.status === 'cancelled') return sum; 
    return sum + getDeduction(d.severity_level);
  }, 0);
  const trainingScore = Math.max(0, STARTING_SCORE - totalDeduction);
  const isExpelled = trainingScore < EXPULSION_THRESHOLD;

  useEffect(() => {
    // Nếu bị đuổi học (điểm < 70) và trạng thái chưa chuẩn
    if (isExpelled) {
       // Chỉ update nếu state hiện tại khác mong muốn để tránh loop vô hạn
       if (formData.study_status !== 'Non_Active' || formData.building_id || formData.room_id) {
           setFormData(prev => ({ 
             ...prev, 
             study_status: 'Non_Active',
             // ✅ FIX: Dùng chuỗi rỗng '' thay vì undefined để đảm bảo field được override
             building_id: '',
             room_id: ''
           }));
           
           if (isEdit) {
             toast.error("Điểm rèn luyện dưới 70. Hệ thống buộc chuyển trạng thái Non Active và xóa khỏi phòng.", {
               duration: 5000,
               icon: '⚠️'
             });
           }
       }
    }
  }, [isExpelled, formData.study_status, formData.building_id, formData.room_id, isEdit]);

  const parseAddressField = (value: string): Address[] =>
    value ? value.split(';').map((item) => {
          const [commune = '', province = ''] = item.split(',');
          return { commune, province };
        }) : [];
  const stringifyAddressField = (list: Address[]): string =>
    list.map((addr) => [addr.commune, addr.province].join(',')).join(';');
  const parseListField = (value: string) => value ? value.split(';').map((v) => v.trim()) : [];
  const stringifyListField = (list: string[]) => list.map((v) => v.trim()).join(';');
  
  const RedStar = <span className="text-red-500">*</span>;

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const data = await getDisciplineForms();
        setDynamicForms(data);
      } catch (err) {
        toast.error("Failed to load discipline forms options");
      }
    };
    fetchForms();
  }, []);

  useEffect(() => {
    if (student.student_id) {
      getDisciplineByStudentId(student.student_id).then((data) => {
        setDisciplines(data || []);
      }).catch(() => {
         console.warn("Không thể tải lịch sử kỷ luật");
         setDisciplines([]);
      });
    }
  }, [student.student_id]);

  useEffect(() => {
    const initData = async () => {
      try {
        const data = await fetchApi('/p/', { depth: 1 });
        const options: Option[] = data.map((p: any) => ({ label: p.name, value: p.name, code: p.code }));
        setProvinceOptions(options);

        const currentAddresses = parseAddressField(student.addresses || '');
        if (currentAddresses.length > 0 && currentAddresses[0].province) {
           const found = options.find(p => p.value === currentAddresses[0].province);
           if (found) setSelectedProvinceCode(found.code);
        }

        const currentGuardianAddresses = parseAddressField((student as any).guardian_addresses || '');
        if (currentGuardianAddresses.length > 0 && currentGuardianAddresses[0].province) {
           const found = options.find(p => p.value === currentGuardianAddresses[0].province);
           if (found) setSelectedGuardianProvinceCode(found.code);
        }

      } catch (e) {
        console.error('Failed to load provinces', e);
      }
    };
    initData();
  }, [student]);

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

  const hasValidAddressList = (value: string) => {
    if (!value) return true; 
    const addresses = parseAddressField(value || '');
    return addresses.every((addr) => addr.commune.trim().length > 0 && addr.province.trim().length > 0);
  };

  const isValidGuardianBirthday = (value: string) => {
    if (!value) return false;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    return date >= GUARDIAN_MIN_BIRTHDAY && date <= GUARDIAN_MAX_BIRTHDAY;
  };

  const validateField = (field: string) => {
      const value = (formData as any)[field]; 
      const stringVal = value ? String(value).trim() : '';
      let error = '';
      const requiredFields = ['ssn', 'student_id', 'fullname', 'birthday', 'sex', 'faculty', 'study_status', 'guardian_cccd', 'guardian_name', 'guardian_relationship', 'guardian_birthday'];
      if (requiredFields.includes(field) && !stringVal) {
         error = `Trường này không được để trống.`;
      } else {
        switch (field) {
            case 'ssn': if (!/^\d{8}$/.test(stringVal)) error = 'Internal ID phải gồm 8 chữ số.'; break;
            case 'student_id': if (!/^[A-Za-z0-9]{7}$/.test(stringVal)) error = 'MSSV phải gồm 7 ký tự.'; break;
            case 'cccd': if (stringVal && !/^\d{12}$/.test(stringVal)) error = 'CCCD phải gồm 12 chữ số.'; break;
            case 'birthday': { const d = new Date(stringVal); const today = new Date(); if (Number.isNaN(d.getTime()) || d < MIN_BIRTHDAY || d > today) error = 'Ngày sinh không hợp lệ.'; break; }
            case 'guardian_cccd': if (stringVal && !/^\d{12}$/.test(stringVal)) error = 'CCCD người thân phải gồm 12 chữ số.'; break;
            case 'guardian_birthday': if (!isValidGuardianBirthday(stringVal)) error = 'Ngày sinh người thân không hợp lệ (1950-2005).'; break;
            case 'emails': { const list = parseListField(stringVal).filter(Boolean); if (list.length > 0 && list.some((e) => !EMAIL_REGEX.test(e))) error = 'Email không đúng định dạng.'; break; }
            case 'phone_numbers': { const list = parseListField(stringVal).filter(Boolean); if (list.length > 0 && list.some((p) => !PHONE_REGEX.test(p))) error = 'Số điện thoại không hợp lệ.'; break; }
            case 'addresses': if (stringVal && !hasValidAddressList(stringVal)) error = 'Vui lòng nhập đầy đủ Tỉnh/Thành và Quận/Huyện.'; break;
            case 'guardian_phone_numbers': { const list = parseListField(stringVal).filter(Boolean); if (list.length > 0 && list.some((p) => !PHONE_REGEX.test(p))) error = 'SĐT người thân không hợp lệ.'; break; }
            case 'guardian_addresses': if (stringVal && !hasValidAddressList(stringVal)) error = 'Địa chỉ người thân chưa đầy đủ.'; break;
            default: break;
        }
      }
      if (error) setFieldErrors((prev) => ({ ...prev, [field]: error })); else clearFieldError(field);
  };

  const handleBlur = (field: string) => { if (isEdit) validateField(field); };
  const handleAddressChange = (i: number, field: keyof Address, val: string, key: string) => {
    let addresses = parseAddressField((formData as any)[key] || '');
    while (addresses.length <= i) addresses.push({ commune: '', province: '' });
    addresses[i][field] = val;
    if (field === 'province') {
        const selected = provinceOptions.find(p => p.value === val);
        const code = selected ? selected.code : null;
        if (key === 'addresses') { setSelectedProvinceCode(code); addresses[i].commune = ''; }
        else if (key === 'guardian_addresses') { setSelectedGuardianProvinceCode(code); addresses[i].commune = ''; }
    }
    handleChange(key, stringifyAddressField(addresses));
  };
  const handleAddAddress = (key: string) => {
    const addr = parseAddressField((formData as any)[key] || '');
    if (addr.length < 3) handleChange(key, stringifyAddressField([...addr, { commune: '', province: '' }]));
  };
  const handleRemoveAddress = (key: string, index: number) => {
    const addr = parseAddressField((formData as any)[key] || '');
    const newAddr = addr.filter((_, i) => i !== index);
    handleChange(key, stringifyAddressField(newAddr));
  };
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
    const fieldsToCheck = ['ssn', 'student_id', 'fullname', 'birthday', 'sex', 'faculty', 'study_status', 'cccd', 'emails', 'phone_numbers', 'addresses', 'guardian_cccd', 'guardian_name', 'guardian_relationship', 'guardian_birthday', 'guardian_phone_numbers', 'guardian_addresses'];
    fieldsToCheck.forEach(field => validateField(field));
    let isValid = true;
    const stringVal = (f: string) => (formData as any)[f] ? String((formData as any)[f]).trim() : '';
    const required = ['ssn', 'student_id', 'fullname', 'birthday', 'sex', 'faculty', 'study_status', 'guardian_cccd', 'guardian_name', 'guardian_relationship', 'guardian_birthday'];
    for (const f of required) { if (!stringVal(f)) { isValid = false; break; } }
    if (!isValid) { setFormError(GENERAL_FORM_ERROR_MESSAGE); return false; }
    if (Object.values(fieldErrors).some(e => e)) return false;
    return true;
  };

  const mapBackendErrors = (errors?: Array<{ field: string; message: string }>) => {
    if (!Array.isArray(errors)) return;
    const mapped: Record<string, string> = {};
    errors.forEach(({ field, message }) => {
      const targetField = field === 'first_name' || field === 'last_name' ? 'fullname' : field;
      mapped[targetField] = message;
    });
    setFieldErrors(mapped);
    if (Object.keys(mapped).length > 0) setFormError(GENERAL_FORM_ERROR_MESSAGE);
  };

  const handleSave = async () => {
    const isValid = validateForm();
    if (!isValid) { toast.error('Vui lòng kiểm tra lại các trường bị lỗi.'); return; }
    try {
      const fullname = (formData as any).fullname || '';
      const parts = fullname.trim().split(/\s+/);
      const last_name = parts.length ? parts[parts.length - 1] : '';
      const first_name = parts.length > 1 ? parts.slice(0, -1).join(' ') : '';
      
      // ✅ FIX 2: Ép buộc ghi đè lại nếu bị đuổi (Phòng hờ trường hợp useEffect chưa kịp chạy hoặc UI bị lỗi)
      const finalBuildingId = isExpelled ? '' : (formData.building_id || '');
      const finalRoomId = isExpelled ? '' : (formData.room_id || '');
      const finalStatus = isExpelled ? 'Non_Active' : formData.study_status;

      const payload: Student = {
        ...formData, 
        first_name, 
        last_name, 
        cccd: (formData as any).cccd || '',
        birthday: formData.birthday ? new Date(formData.birthday).toISOString().split('T')[0] : '',
        emails: formData.emails || '', 
        phone_numbers: formData.phone_numbers || '',
        addresses: formData.addresses || '', 
        has_health_insurance: !!(formData as any).has_health_insurance,
        // Sử dụng giá trị đã ép buộc
        building_id: finalBuildingId,
        room_id: finalRoomId,
        study_status: finalStatus
      } as Student;

      if (onSubmit) { await onSubmit(payload); navigate(`/students/view/${payload.ssn}`); }
      else { await updateStudent(payload.ssn, payload); toast.success('Student updated successfully!'); navigate(`/students/view/${payload.ssn}`); }
      setFormError(null);
    } catch (error: any) {
      console.error('❌ Update failed:', error);
      mapBackendErrors(error?.response?.data?.fieldErrors);
      const msg = error?.response?.data?.error || error?.message || 'Failed to update student.';
      setFormError(msg);
      toast.error(msg);
    }
  };

  let alertLevel: 'safe' | 'warning' | 'danger' = 'safe';
  if (trainingScore < EXPULSION_THRESHOLD) alertLevel = 'danger'; 
  else if (trainingScore < 85) alertLevel = 'warning'; 
  else alertLevel = 'safe';

  return (
    <div className='grid grid-cols-1 gap-4 rounded-lg bg-white p-6 text-sm text-gray-700 shadow-md md:grid-cols-2'>
      <div className='col-span-full mb-4 text-2xl font-semibold'>{isEdit ? 'Edit Student Information' : 'Student Information'}</div>
      {formError && <div className='col-span-full rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{formError}</div>}

      {disciplines.length > 0 && isView && (
        <div className="col-span-full flex justify-end mb-4">
          <Button style={{ backgroundColor: '#F8F8F8', color: '#B42318' }} className="gap-2 font-semibold shadow-md animate-pulse" onClick={() => setIsDisciplineModalOpen(true)}>
            <AlertTriangle className="w-4 h-4" />This student has {disciplines.length} disciplinary violations
          </Button>
        </div>
      )}
      
      {(
        <div className={`col-span-full mb-6 rounded-lg border p-4 shadow-sm transition-all ${alertLevel === 'danger' ? 'border-red-300 bg-red-50' : alertLevel === 'warning' ? 'border-orange-300 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {alertLevel === 'danger' ? <XCircle className="h-6 w-6 text-red-600 animate-pulse" /> : alertLevel === 'warning' ? <AlertTriangle className="h-6 w-6 text-orange-500" /> : <CheckCircle className="h-6 w-6 text-green-600" />}
              <h3 className={`text-lg font-bold ${alertLevel === 'danger' ? 'text-red-800' : alertLevel === 'warning' ? 'text-orange-800' : 'text-green-800'}`}>
                {alertLevel === 'danger' ? 'WARNING: TRAINING SCORE BELOW 70 - FORCED TO LEAVE DORMITORY' : alertLevel === 'warning' ? 'Note: Low training points' : 'Good training points'}
              </h3>
            </div>
            <span className={`text-xl font-bold ${alertLevel === 'danger' ? 'text-red-700' : alertLevel === 'warning' ? 'text-orange-600' : 'text-green-700'}`}>{trainingScore}/100</span>
          </div>
          <div className="h-4 w-full rounded-full bg-gray-200 overflow-hidden">
            <div className={`h-full transition-all duration-700 ease-out ${alertLevel === 'danger' ? 'bg-red-600' : alertLevel === 'warning' ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${trainingScore}%` }}></div>
          </div>
          <p className="mt-2 text-sm text-gray-700">{alertLevel === 'danger' ? 'Student has violated serious regulations. The system has locked the Active status.' : `Student has been deducted ${totalDeduction} points due to disciplinary violations.`}</p>
        </div>
      )}

      <EditField label={<span>Internal ID {RedStar}</span>} value={formData.ssn} isEditing={false} onChange={(v) => handleChange('ssn', v)} />
      <EditField label={<span>Student ID {RedStar}</span>} value={formData.student_id || ''} isEditing={isEdit} onChange={(v) => handleChange('student_id', v)} onBlur={() => handleBlur('student_id')} error={fieldErrors.student_id} />
      <EditField label={<span>CCCD {RedStar}</span>} value={(formData as any).cccd || ''} isEditing={isEdit} onChange={(v) => handleChange('cccd', v)} onBlur={() => handleBlur('cccd')} error={fieldErrors.cccd} />
      <EditField label={<span>Full name {RedStar}</span>} value={(formData as any).fullname || ''} isEditing={isEdit} onChange={(v) => handleChange('fullname', v)} onBlur={() => handleBlur('fullname')} error={fieldErrors.fullname} />
      <EditField label={<span>Birthday {RedStar}</span>} value={formData.birthday ? new Date(formData.birthday).toISOString().slice(0, 10) : ''} type='date' isEditing={isEdit} onChange={(v) => handleChange('birthday', v)} onBlur={() => handleBlur('birthday')} error={fieldErrors.birthday} icon={<img src={CalendarIcon} className='h-5 w-5' />} />
      <SelectField label={<span>Sex {RedStar}</span>} value={formData.sex} options={[{ label: 'Male', value: 'M' }, { label: 'Female', value: 'F' }]} isEditing={isEdit} onChange={(v) => handleChange('sex', v)} onBlur={() => handleBlur('sex')} error={fieldErrors.sex} />
      <BooleanSelectField label='Has health insurance' value={(formData as any).has_health_insurance} options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]} isEditing={isEdit} onChange={(v) => handleChange('has_health_insurance' as any, v)} />
      <EditField label='Health State' value={formData.health_state || ''} isEditing={isEdit} onChange={(v) => handleChange('health_state', v)} />
      <EditField label='Ethnic Group' value={formData.ethnic_group || ''} isEditing={isEdit} onChange={(v) => handleChange('ethnic_group', v)} />
      <SelectField label='Faculty' value={formData.faculty || ''} options={[{ label: 'Information Technology', value: 'Information Technology' }, { label: 'Mechanical Engineering', value: 'Mechanical Engineering' }, { label: 'Civil Engineering', value: 'Civil Engineering' }, { label: 'Environmental Engineering', value: 'Environmental Engineering' }, { label: 'Logistics and Supply Chain Management', value: 'Logistics and Supply Chain Management' }, { label: 'Biotechnology', value: 'Biotechnology' }, { label: 'Computer Science', value: 'Computer Science' },]} isEditing={isEdit} onChange={(v) => handleChange('faculty', v)} onBlur={() => handleBlur('faculty')} error={fieldErrors.faculty} />
      
      <div className="relative">
        <SelectField 
          label={<span>Residence status {RedStar}</span>} 
          value={formData.study_status || ''} 
          options={[{ label: 'Active', value: 'Active' }, { label: 'Non Active', value: 'Non_Active' }]} 
          isEditing={isEdit && !isExpelled} 
          
          onChange={(v) => {
            setFormData(prev => ({
              ...prev,
              study_status: v,
              // ✅ Đảm bảo set thành chuỗi rỗng '' khi chọn Non_Active
              ...(v === 'Non_Active' ? { building_id: '', room_id: '' } : {})
            }));
            
            if (v === 'Non_Active' && isEdit) {
              toast('Đã chuyển sang Non Active: Sinh viên sẽ được rời khỏi phòng.', { icon: 'ℹ️' });
            }
          }} 
          
          onBlur={() => handleBlur('study_status')}
          error={fieldErrors.study_status} 
        />
        {isEdit && isExpelled && <div className="absolute -top-1 right-0 flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded"><Lock className="w-3 h-3" /> Locked (Score &lt; 70)</div>}
      </div>

      {/* --- BUILDING & ROOM SECTION --- */}
      {(isView || (formData.study_status === 'Active' && formData.building_id)) && (
  <div className="col-span-full mt-2 rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm md:col-span-2">
    <div className="grid grid-cols-2 gap-6">
      
      <div className="flex flex-col">
        <span className="mb-1 text-xs font-medium uppercase tracking-wider text-blue-500">Building</span>
        <div className="flex items-center gap-2 text-xl font-bold text-blue-900 md:text-2xl">
          <Building className="h-6 w-6 text-blue-400" />
          {formData.building_id || 'N/A'}
        </div>
      </div>

      <div 
        className={cn(
          "flex flex-col transition-all rounded-md p-1 -ml-1", 
          (isView && formData.building_id && formData.room_id) 
            ? "cursor-pointer hover:bg-blue-100 hover:shadow-sm group relative" 
            : ""
        )}
        onClick={() => {
          if (isView && formData.building_id && formData.room_id) {
             navigate(`/rooms/view/${formData.building_id}/${formData.room_id}`);
          }
        }}
        title={isView ? "Click để xem chi tiết phòng" : ""}
      >
        <span className="mb-1 text-xs font-medium uppercase tracking-wider text-blue-500 group-hover:text-blue-700">
            Room {(isView && formData.room_id) && <span className="ml-1 text-[10px] lowercase italic">(click to view)</span>}
        </span>
        <div className="flex items-center gap-2 text-xl font-bold text-blue-900 md:text-2xl group-hover:text-blue-700">
          <DoorOpen className="h-6 w-6 text-blue-400 group-hover:text-blue-600" />
          {formData.room_id || 'N/A'}
        </div>
      </div>

    </div>
  </div>
)}

      <InputAddress label='Addresses' values={parseAddressField(formData.addresses || '')} isEditing={isEdit} provinceOptions={provinceOptions} wardOptions={wardOptions} selectedProvinceCode={selectedProvinceCode} onChange={(i, f, v) => handleAddressChange(i, f, v, 'addresses')} onAdd={() => handleAddAddress('addresses')} onRemove={(i) => handleRemoveAddress('addresses', i)} onBlur={() => handleBlur('addresses')} error={fieldErrors.addresses} />
      <EditForm label='Emails' values={parseListField(formData.emails || '')} isEditing={isEdit} onChange={(i, v) => handleListChange('emails', i, v)} onAdd={() => handleAddToList('emails')} onRemove={(i) => handleRemoveFromList('emails', i)} onBlur={() => handleBlur('emails')} error={fieldErrors.emails} />
      <EditForm label='Phone Numbers' values={parseListField(formData.phone_numbers || '')} isEditing={isEdit} onChange={(i, v) => handleListChange('phone_numbers', i, v)} onAdd={() => handleAddToList('phone_numbers')} onRemove={(i) => handleRemoveFromList('phone_numbers', i)} onBlur={() => handleBlur('phone_numbers')} error={fieldErrors.phone_numbers} />

      <div className='col-span-full mt-6 text-lg font-semibold'>Guardian Information:</div>
      <EditField label={<span>CCCD {RedStar}</span>} value={(formData as any).guardian_cccd || ''} isEditing={isEdit} onChange={(v) => handleChange('guardian_cccd' as any, v)} onBlur={() => handleBlur('guardian_cccd')} error={fieldErrors.guardian_cccd} />
      <EditField label={<span>Full name {RedStar}</span>} value={(formData as any).guardian_name || ''} isEditing={isEdit} onChange={(v) => handleChange('guardian_name' as any, v)} onBlur={() => handleBlur('guardian_name')} error={fieldErrors.guardian_name} />
      <SelectField label={<span>Relationship {RedStar}</span>} value={(formData as any).guardian_relationship || ''} options={[{ label: 'Father', value: 'Father' }, { label: 'Mother', value: 'Mother' }, { label: 'Other', value: 'Other' }]} isEditing={isEdit} onChange={(v) => handleChange('guardian_relationship' as any, v)} onBlur={() => handleBlur('guardian_relationship')} error={fieldErrors.guardian_relationship} />
      <EditField label='Occupation' value={(formData as any).guardian_occupation || ''} isEditing={isEdit} onChange={(v) => handleChange('guardian_occupation' as any, v)} />
      <EditField label={<span>Birthday {RedStar}</span>} value={(formData as any).guardian_birthday ? String((formData as any).guardian_birthday).slice(0, 10) : ''} type='date' isEditing={isEdit} onChange={(v) => handleChange('guardian_birthday' as any, v)} onBlur={() => handleBlur('guardian_birthday')} error={fieldErrors.guardian_birthday} icon={<img src={CalendarIcon} className='h-5 w-5' />} />
      <EditForm label='Phone Numbers' values={parseListField((formData as any).guardian_phone_numbers || '')} isEditing={isEdit} onChange={(i, v) => handleListChange('guardian_phone_numbers' as any, i, v)} onAdd={() => handleAddToList('guardian_phone_numbers' as any)} onRemove={(i) => handleRemoveFromList('guardian_phone_numbers' as any, i)} onBlur={() => handleBlur('guardian_phone_numbers')} error={fieldErrors.guardian_phone_numbers} />
      <InputAddress label='Addresses' values={parseAddressField((formData as any).guardian_addresses || '')} isEditing={isEdit} provinceOptions={provinceOptions} wardOptions={guardianWardOptions} selectedProvinceCode={selectedGuardianProvinceCode} onChange={(i, f, v) => handleAddressChange(i, f, v, 'guardian_addresses')} onAdd={() => handleAddAddress('guardian_addresses')} onRemove={(i) => handleRemoveAddress('guardian_addresses', i)} onBlur={() => handleBlur('guardian_addresses')} error={fieldErrors.guardian_addresses} />

      <Dialog open={isDisciplineModalOpen} onOpenChange={setIsDisciplineModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2"><XCircle className="w-6 h-6" />Lịch sử Kỷ luật - {formData.fullname} ({formData.ssn})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {disciplines.map((d, index) => (
              <div key={d.action_id} className="border border-red-200 bg-red-50 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start border-b border-red-100 pb-2 mb-2">
                  <h3 className="font-bold text-red-800 text-lg">{index + 1}. {d.action_type}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase ${d.severity_level === 'high' || d.severity_level === 'expulsion' ? 'bg-red-600' : d.severity_level === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'}`}>{d.severity_level}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <p><span className="font-semibold text-gray-700">Action ID:</span> {d.action_id}</p>
                  <p><span className="font-semibold text-gray-700">Decision Date:</span> {new Date(d.decision_date).toLocaleDateString('vi-VN')}</p>
                  <p className="col-span-full"><span className="font-semibold text-gray-700">Reason:</span> {d.reason}</p>
                  <p><span className="font-semibold text-gray-700">Effective From:</span> {new Date(d.effective_from).toLocaleDateString('vi-VN')}</p>
                  <p><span className="font-semibold text-gray-700">Effective To:</span> {d.effective_to ? new Date(d.effective_to).toLocaleDateString('vi-VN') : 'Indefinite'}</p>
                  <p className="col-span-full"><span className="font-semibold text-gray-700">Status:</span><span className="ml-2 font-medium text-gray-900">{d.status}</span></p>
                </div>
              </div>
            ))}
          </div>
          <ModalFooter><Button variant="outline" onClick={() => setIsDisciplineModalOpen(false)}>Close</Button></ModalFooter>
        </DialogContent>
      </Dialog>

      <DialogFooter className='col-span-full mt-6 flex justify-end gap-3'>
        {isView && <Button style={{ backgroundColor: '#032B91', color: 'white' }} onClick={() => navigate(`/students/edit/${formData.ssn}`)}>Edit</Button>}
        {isEdit && <><Button variant='outline' className='border-gray-400 text-gray-700 hover:bg-gray-100' onClick={() => navigate('/students/view/' + formData.ssn)}>Cancel</Button><Button style={{ backgroundColor: '#032B91', color: 'white' }} onClick={() => handleSave()}>Save</Button></>}
      </DialogFooter>
    </div>
  );
};

export default SharedStudentForm;