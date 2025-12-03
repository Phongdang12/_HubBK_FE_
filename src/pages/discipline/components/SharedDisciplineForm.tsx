import { FC, useEffect, useMemo, useState } from "react";
import { 
  Discipline, 
  createDiscipline, 
  updateDiscipline, 
  getDisciplineByStudentId 
} from "@/services/disciplineService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ACTION_TYPE_ERROR_MESSAGE,
  DECISION_DATE_ERROR_MESSAGE,
  EFFECTIVE_FROM_ERROR_MESSAGE,
  EFFECTIVE_TO_ERROR_MESSAGE,
  GENERAL_FORM_ERROR_MESSAGE,
  REASON_ERROR_MESSAGE,
  SEVERITY_ERROR_MESSAGE,
  SEVERITY_OPTIONS,
  STATUS_ERROR_MESSAGE,
  STATUS_OPTIONS,
  STUDENT_CODE_ERROR_MESSAGE,
} from "@/pages/discipline/constants";
import { getStudentOptions, StudentOption, getStudentDetail, updateStudent, Student } from "@/services/studentService";

// IMPORT ICONS
import { Check, ChevronsUpDown, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  initialData?: Discipline;
  mode: "add" | "edit" | "view";
}

interface DynamicFormType {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

const POINTS_MAP: Record<string, number> = {
  low: 2,
  medium: 5,
  high: 10,
  expulsion: 31,
};

function removeAccents(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase();
}

const SharedDisciplineForm: FC<Props> = ({ initialData, mode }) => {
  const navigate = useNavigate();
  
  const [dynamicForms, setDynamicForms] = useState<DynamicFormType[]>([]);
  const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);

  const [form, setForm] = useState<Discipline>({
    action_id: "",
    student_id: "",
    action_type: "",
    reason: "",
    severity_level: "",
    status: "",
    decision_date: "",
    effective_from: "",
    effective_to: ""
  });
  
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Discipline | "form", string>>>({});
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [currentScore, setCurrentScore] = useState<number>(100);
  const [projectedScore, setProjectedScore] = useState<number | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Fetch Data
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await axios.get<DynamicFormType[]>('/api/discipline-forms');
        setDynamicForms(res.data); 
      } catch (error) {
        toast.error("Failed to load discipline form options");
      }
    };
    fetchForms();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getStudentOptions();
        setStudentOptions(data);
      } catch (error) {
        toast.error("Failed to load students list");
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        action_id: initialData.action_id?.toUpperCase() || "",
        student_id: initialData.student_id || "",
        action_type: initialData.action_type || "",
        reason: initialData.reason || "",
        severity_level: initialData.severity_level?.toLowerCase() || "",
        status: initialData.status?.toLowerCase() || "",
        decision_date: (initialData.decision_date || "").slice(0, 10),
        effective_from: (initialData.effective_from || "").slice(0, 10),
        effective_to: (initialData.effective_to || "")?.slice(0, 10) || "",
      });
    }
  }, [initialData]);

  // Logic tính điểm
  useEffect(() => {
    const fetchCurrentScore = async () => {
      if (!form.student_id || form.student_id.length !== 7) return;
      setLoadingScore(true);
      try {
        const history = await getDisciplineByStudentId(form.student_id);
        const totalDeduction = (history || []).reduce((sum, d) => {
          if (mode === 'edit' && d.action_id === form.action_id) return sum;
          if (d.status === 'cancelled') return sum; 
          return sum + (POINTS_MAP[d.severity_level?.toLowerCase()] || 0);
        }, 0);
        setCurrentScore(Math.max(0, 100 - totalDeduction));
      } catch (err) {
        // Silent
      } finally {
        setLoadingScore(false);
      }
    };
    fetchCurrentScore();
  }, [form.student_id, mode, form.action_id]);

  useEffect(() => {
    if (!form.severity_level) {
      setProjectedScore(null);
      return;
    }
    const deduction = POINTS_MAP[form.severity_level.toLowerCase()] || 0;
    const newScore = Math.max(0, currentScore - deduction);
    setProjectedScore(newScore);
  }, [form.severity_level, currentScore]);

  // Handlers
  const clearFieldError = (name: keyof Discipline) => {
    setFormErrors((prev) => {
      if (!prev[name]) return prev;
      const updated = { ...prev };
      delete updated[name];
      if (Object.keys(updated).length === 0) setFormErrorMessage(null);
      return updated;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'action_type') {
        const selectedFormObj = dynamicForms.find(f => f.name === value);
        if (selectedFormObj && selectedFormObj.description && !prev.reason) {
          updated.reason = selectedFormObj.description;
        }
      }
      return updated;
    });
    clearFieldError(name as keyof Discipline);
  };

  const handleSelectStudent = (currentValue: string) => {
    setForm(prev => ({ ...prev, student_id: currentValue }));
    clearFieldError("student_id");
    setOpenCombobox(false);
  };

  const mapBackendErrors = (errors: Array<{ field: string; message: string }> = []) => {
    const mapped: Partial<Record<keyof Discipline | "form", string>> = {};
    errors.forEach(({ field, message }) => {
      mapped[field as keyof Discipline] = message;
    });
    setFormErrors(mapped);
    if (Object.keys(mapped).length > 0) setFormErrorMessage(GENERAL_FORM_ERROR_MESSAGE);
  };

  const isValidDateString = (value: string) => !!value && !Number.isNaN(Date.parse(value));

  const validateForm = () => {
    const errors: Partial<Record<keyof Discipline | "form", string>> = {};
    if (!/^\d{7}$/.test(form.student_id.trim())) errors.student_id = STUDENT_CODE_ERROR_MESSAGE;
    
    const validFormNames = dynamicForms.map(f => f.name);
    if (!validFormNames.includes(form.action_type) && form.action_type !== initialData?.action_type) {
      errors.action_type = ACTION_TYPE_ERROR_MESSAGE;
    }
    if (!SEVERITY_OPTIONS.some((opt) => opt.value === form.severity_level.toLowerCase())) errors.severity_level = SEVERITY_ERROR_MESSAGE;
    if (!STATUS_OPTIONS.some((opt) => opt.value === form.status.toLowerCase())) errors.status = STATUS_ERROR_MESSAGE;
    const reason = form.reason.trim();
    if (reason.length < 10 || reason.length > 500) errors.reason = REASON_ERROR_MESSAGE;
    
    // Logic check ngày: Chỉ chặn ngày tương lai
    const parseLocalDate = (s: string): Date => {
      const [y, m, d] = s.split("-");
      return new Date(Number(y), Number(m) - 1, Number(d));
    };

    const decisionDate = parseLocalDate(form.decision_date);
    // Check ngày tương lai: dùng mốc 23:59:59 hôm nay
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    if (!isValidDateString(form.decision_date) || decisionDate > endOfToday) {
      errors.decision_date = DECISION_DATE_ERROR_MESSAGE;
    }
    if (isValidDateString(form.decision_date) && isValidDateString(form.effective_from)) {
        const decision = parseLocalDate(form.decision_date);
        const effective = parseLocalDate(form.effective_from);
        if (decision > effective) {
             errors.effective_from = "Ngày bắt đầu hiệu lực phải sau hoặc bằng ngày ra quyết định.";
        }
    }
    const fromValid = isValidDateString(form.effective_from);
    const toValid = isValidDateString(form.effective_to || "");
    if (!fromValid) errors.effective_from = EFFECTIVE_FROM_ERROR_MESSAGE;
    if (form.effective_to && !toValid) errors.effective_to = EFFECTIVE_TO_ERROR_MESSAGE;
    if (fromValid && toValid && form.effective_to) {
      const from = parseLocalDate(form.effective_from);
      const to = parseLocalDate(form.effective_to as string);
      if (from >= to) {
        errors.effective_from = EFFECTIVE_FROM_ERROR_MESSAGE;
        errors.effective_to = EFFECTIVE_TO_ERROR_MESSAGE;
      }
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setFormErrorMessage(GENERAL_FORM_ERROR_MESSAGE);
      return false;
    }
    setFormErrors({});
    setFormErrorMessage(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    
    const payload: Discipline = {
        ...form,
        action_id: form.action_id.toUpperCase(),
        severity_level: form.severity_level.toLowerCase(),
        status: form.status.toLowerCase(),
        effective_to: form.effective_to ? form.effective_to : null, 
    };

    try {
      if (mode === "edit") {
        await updateDiscipline(payload.action_id, payload);
        toast.success("Cập nhật kỷ luật thành công!");
      } else {
        await createDiscipline(payload);
        toast.success("Thêm kỷ luật thành công!");
      }

      // 🔥 AUTO-UPDATE LOGIC
      const isExpelled = payload.severity_level === 'expulsion';
      const isLowScore = projectedScore !== null && projectedScore < 70;

      if (isExpelled || isLowScore) {
        const currentStudentOpt = studentOptions.find(s => s.student_id === form.student_id);
        const targetSsn = (currentStudentOpt as any)?.sssn || (currentStudentOpt as any)?.ssn;

        if (targetSsn) {
            try {
                const studentDetail = await getStudentDetail(targetSsn);
                
                if (studentDetail && studentDetail.study_status === 'Active') {
                    
                    // 🔥 FIX CHÍNH: Format date & điền đủ dữ liệu
                    const safeDate = (d: any, fallback: string = '2000-01-01') => {
                        if (!d) return fallback;
                        try {
                            const dateObj = new Date(d);
                            if (isNaN(dateObj.getTime())) return fallback;
                            return dateObj.toISOString().split('T')[0];
                        } catch {
                            return fallback;
                        }
                    }

                    // Điền đầy đủ tất cả các trường bắt buộc để qua validation của Zod
                    const updatedStudent: Student = {
                        ...studentDetail,
                        study_status: 'Non_Active',
                        building_id: '', 
                        room_id: '',
                        
                        birthday: safeDate(studentDetail.birthday),
                        cccd: studentDetail.cccd || '000000000000', // Fallback nếu thiếu
                        first_name: studentDetail.first_name || '',
                        last_name: studentDetail.last_name || '',
                        sex: studentDetail.sex || 'M',
                        ethnic_group: studentDetail.ethnic_group || 'Kinh',
                        student_id: studentDetail.student_id || '',
                        class_name: studentDetail.class_name || '',
                        faculty: studentDetail.faculty || '',
                        emails: studentDetail.emails || '',
                        phone_numbers: studentDetail.phone_numbers || '',
                        addresses: studentDetail.addresses || '',
                        
                        // Thông tin người thân (cũng phải đầy đủ)
                        guardian_cccd: (studentDetail as any).guardian_cccd || '000000000000',
                        guardian_name: (studentDetail as any).guardian_name || 'N/A',
                        guardian_relationship: (studentDetail as any).guardian_relationship || 'Other',
                        guardian_birthday: safeDate((studentDetail as any).guardian_birthday, '1970-01-01'),
                        guardian_occupation: (studentDetail as any).guardian_occupation || '',
                        guardian_phone_numbers: (studentDetail as any).guardian_phone_numbers || '',
                        guardian_addresses: (studentDetail as any).guardian_addresses || '',
                    };
                    
                    await updateStudent(targetSsn, updatedStudent);
                    
                    toast.custom((t) => (
                      <div className="max-w-md w-full bg-red-50 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-red-500 p-4">
                        <div className="flex items-start">
                          <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                          <div>
                            <p className="text-sm font-bold text-red-900">ĐÃ THỰC THI QUY CHẾ</p>
                            <p className="mt-1 text-sm text-red-700">
                              Sinh viên đã bị chuyển trạng thái sang <b>Non_Active</b> và xóa khỏi phòng do vi phạm.
                            </p>
                          </div>
                        </div>
                      </div>
                    ), { duration: 6000 });
                }
            } catch (err: any) {
                console.error("Auto-update failed", err);
                const msg = err.message || "Lỗi không xác định";
                toast.error(`Lỗi tự động thi hành: ${msg}`);
            }
        }
      }

      setFormErrorMessage(null);
      navigate("/disciplines");
    } catch (error: any) {
      console.error(error);
      const serverErrors = error?.response?.data?.fieldErrors;
      if (Array.isArray(serverErrors) && serverErrors.length) mapBackendErrors(serverErrors);
      const serverMessage = error?.response?.data?.error || GENERAL_FORM_ERROR_MESSAGE;
      setFormErrorMessage(serverMessage);
      toast.error(serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderError = (field: keyof Discipline) =>
    formErrors[field] ? <p className="mt-1 text-sm text-red-600">{formErrors[field]}</p> : null;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold">{mode === "edit" ? "Edit Discipline" : "Add New Discipline"}</h2>
      {formErrorMessage && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formErrorMessage}</div>
      )}

      {/* BANNER CẢNH BÁO */}
      {projectedScore !== null && projectedScore < 70 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-800">CẢNH BÁO NGUY HIỂM</h4>
              <p className="text-sm text-red-700 mt-1">
                Điểm rèn luyện hiện tại: <strong>{currentScore}</strong>. <br/>
                Sau khi áp dụng lỗi này, điểm sẽ tụt xuống <strong>{projectedScore}</strong>.
              </p>
              <p className="text-sm font-semibold text-red-800 mt-1">
                ⚠️ Sinh viên sẽ thuộc diện BUỘC THÔI HỌC và bị xóa khỏi phòng KTX.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* INFO BANNER */}
      {projectedScore !== null && projectedScore >= 70 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 flex items-center gap-3">
           <Info className="h-5 w-5 text-blue-600" />
           <p className="text-sm text-blue-800">
             Điểm hiện tại: <strong>{currentScore}</strong>. 
             Dự kiến sau phạt: <strong>{projectedScore}/100</strong>.
           </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STUDENT COMBOBOX */}
        <div className="flex flex-col gap-1.5">
          <Label>Student</Label>
          {mode === "edit" ? (
            <Input
              value={form.student_id}
              disabled
              className="bg-gray-100 text-gray-800 font-medium opacity-100 border-gray-300"
            />
          ) : (
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between font-normal"
                >
                  {form.student_id
                    ? studentOptions.find((s) => s.student_id === form.student_id)
                      ? `${studentOptions.find((s) => s.student_id === form.student_id)?.first_name} ${
                          studentOptions.find((s) => s.student_id === form.student_id)?.last_name
                        } (${studentOptions.find((s) => s.student_id === form.student_id)?.student_id})`
                      : form.student_id
                    : "Select student..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0">
                <Command>
                  <CommandInput placeholder="Search student ID or name..." />
                  <CommandList>
                    <CommandEmpty>No student found.</CommandEmpty>
                    <CommandGroup>
                      {studentOptions.map((student) => (
                        <CommandItem
                          key={student.student_id}
                          value={removeAccents(
                            `${student.first_name} ${student.last_name} ${student.student_id}`
                          )}
                          onSelect={() => handleSelectStudent(student.student_id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              form.student_id === student.student_id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {student.first_name} {student.last_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ID: {student.student_id}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
          {renderError("student_id")}
        </div>

        <div>
          <Label>Form</Label>
          <select name="action_type" value={form.action_type} onChange={handleChange} className="border px-3 py-2 rounded w-full focus:border-blue-500 focus:outline-none">
            <option value="">Select form</option>
            {dynamicForms.filter(f => f.is_active || (mode === 'edit' && f.name === initialData?.action_type)).map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
            ))}
          </select>
          {renderError("action_type")}
        </div>

        <div>
          <Label>Severity Level</Label>
          <select name="severity_level" value={form.severity_level} onChange={handleChange} className="border px-3 py-2 rounded w-full focus:border-blue-500 focus:outline-none">
            <option value="">Select severity level</option>
            {SEVERITY_OPTIONS.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
          </select>
          {renderError("severity_level")}
        </div>

        <div>
          <Label>Status</Label>
          <select name="status" value={form.status} onChange={handleChange} className="border px-3 py-2 rounded w-full focus:border-blue-500 focus:outline-none">
            <option value="">Select status</option>
            {STATUS_OPTIONS.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
          </select>
          {renderError("status")}
        </div>
      </div>

      <div>
        <Label>Reason</Label>
        <Textarea name="reason" value={form.reason} onChange={handleChange} className="min-h-[100px]" placeholder="Enter details..." />
        {renderError("reason")}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><Label>Decision Date</Label><Input type="date" name="decision_date" value={form.decision_date} onChange={handleChange} />{renderError("decision_date")}</div>
        <div><Label>Effective From</Label><Input type="date" name="effective_from" value={form.effective_from} onChange={handleChange} />{renderError("effective_from")}</div>
        <div><Label>Effective To</Label><Input type="date" name="effective_to" value={form.effective_to || ""} onChange={handleChange} />{renderError("effective_to")}</div>
      </div>

      <div className="flex justify-between items-center pt-4"> 
        {mode === "edit" && <Button variant="ghost" className="text-sm text-gray-600 hover:text-gray-800 p-0 h-auto" onClick={() => navigate("/disciplines")}>← Back to List</Button>}
        <Button style={{ backgroundColor: '#032B91', color: 'white' }} className="w-40 ml-auto" onClick={handleSubmit} disabled={submitting}>{submitting ? "Saving..." : mode === "edit" ? "Update" : "Add"}</Button>
      </div>
    </div>
  );
};

export default SharedDisciplineForm;