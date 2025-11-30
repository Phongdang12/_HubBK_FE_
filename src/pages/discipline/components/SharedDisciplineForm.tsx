// src/pages/discipline/components/SharedDisciplineForm.tsx
import { FC, useEffect, useMemo, useState } from "react";
import { Discipline, createDiscipline, updateDiscipline } from "@/services/disciplineService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ACTION_ID_ERROR_MESSAGE,
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
import { getStudentOptions, StudentOption } from "@/services/studentService";

// 🆕 IMPORT CHO COMBOBOX
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils"; // Đảm bảo bạn có file này (mặc định của shadcn)
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList, // Import thêm CommandList
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
function removeAccents(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase();
}
const SharedDisciplineForm: FC<Props> = ({ initialData, mode }) => {
  const navigate = useNavigate();
  
  // State
  const [dynamicForms, setDynamicForms] = useState<DynamicFormType[]>([]);
  const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);
  
  // 🆕 State cho Combobox
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

  // ... (Các hàm helper: clearFieldError, mapBackendErrors, isValidDateString, validateForm giữ nguyên như cũ)
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

  // Hàm xử lý riêng cho Combobox
  const handleSelectStudent = (currentValue: string) => {
    setForm(prev => ({ ...prev, student_id: currentValue }));
    clearFieldError("student_id");
    setOpenCombobox(false);
  };

  // ... (validateForm, handleSubmit giữ nguyên code cũ)
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
    // Logic validate giữ nguyên, chỉ bỏ phần validate action_id nếu backend tự sinh
    // ...
    if (!/^\d{7}$/.test(form.student_id.trim())) errors.student_id = STUDENT_CODE_ERROR_MESSAGE;
    
    const validFormNames = dynamicForms.map(f => f.name);
    if (!validFormNames.includes(form.action_type) && form.action_type !== initialData?.action_type) {
      errors.action_type = ACTION_TYPE_ERROR_MESSAGE;
    }
    if (!SEVERITY_OPTIONS.some((opt) => opt.value === form.severity_level.toLowerCase())) errors.severity_level = SEVERITY_ERROR_MESSAGE;
    if (!STATUS_OPTIONS.some((opt) => opt.value === form.status.toLowerCase())) errors.status = STATUS_ERROR_MESSAGE;
    const reason = form.reason.trim();
    if (reason.length < 10 || reason.length > 500) errors.reason = REASON_ERROR_MESSAGE;
    if (!isValidDateString(form.decision_date) || new Date(form.decision_date) < today) errors.decision_date = DECISION_DATE_ERROR_MESSAGE;
    const fromValid = isValidDateString(form.effective_from);
    const toValid = isValidDateString(form.effective_to || "");
    if (!fromValid) errors.effective_from = EFFECTIVE_FROM_ERROR_MESSAGE;
    if (form.effective_to && !toValid) errors.effective_to = EFFECTIVE_TO_ERROR_MESSAGE;
    if (fromValid && toValid && form.effective_to) {
      const from = new Date(form.effective_from);
      const to = new Date(form.effective_to as string);
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
    try {
      const payload: Discipline = {
        ...form,
        action_id: form.action_id.toUpperCase(), // Có thể rỗng nếu là Add
        severity_level: form.severity_level.toLowerCase(),
        status: form.status.toLowerCase(),
      };
      if (mode === "edit") {
        await updateDiscipline(payload.action_id, payload);
        toast.success("Discipline updated successfully!");
      } else {
        await createDiscipline(payload);
        toast.success("Discipline created successfully!");
      }
      setFormErrorMessage(null);
      navigate("/disciplines");
    } catch (error: any) {
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

  // ================= RENDER =================
  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold">{mode === "edit" ? "Edit Discipline" : "Add New Discipline"}</h2>
      {formErrorMessage && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formErrorMessage}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STUDENT FIELD */}
        <div className="flex flex-col gap-1.5">
          <Label>Student</Label>

          {mode === "edit" ? (
            /* 🟢 EDIT MODE: Chỉ hiện thị thông tin (Input Read-only) */
            <Input
              value={
                form.student_id
                  ? studentOptions.find((s) => s.student_id === form.student_id)
                    ? `${studentOptions.find((s) => s.student_id === form.student_id)?.first_name} ${
                        studentOptions.find((s) => s.student_id === form.student_id)?.last_name
                      } (${form.student_id})`
                    : form.student_id // Fallback nếu chưa load xong list
                  : "Loading..."
              }
              disabled
              className="bg-gray-100 text-gray-800 font-medium opacity-100 border-gray-300"
            />
          ) : (
            /* 🔵 ADD MODE: Hiện Combobox tìm kiếm */
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
                          // ⚠️ Lưu ý: value phải là chữ thường không dấu để search hoạt động tốt
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
                              Student ID: {student.student_id}
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

        {/* Dynamic Form Select */}
        <div>
          <Label>Form</Label>
          <select
            name="action_type"
            value={form.action_type}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select form</option>
            {dynamicForms
              .filter(f => f.is_active || (mode === 'edit' && f.name === initialData?.action_type))
              .map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
            ))}
          </select>
          {renderError("action_type")}
        </div>

        {/* Severity */}
        <div>
          <Label>Severity Level</Label>
          <select
            name="severity_level"
            value={form.severity_level}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select severity level</option>
            {SEVERITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {renderError("severity_level")}
        </div>

        {/* Status */}
        <div>
          <Label>Status</Label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select status</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {renderError("status")}
        </div>
      </div>

      {/* Reason */}
      <div>
        <Label>Reason</Label>
        <Textarea
          name="reason"
          value={form.reason}
          onChange={handleChange}
          className="min-h-[100px]"
          placeholder="Enter specific details (Auto-filled if a default description exists)"
        />
        {renderError("reason")}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Decision Date</Label>
          <Input type="date" name="decision_date" value={form.decision_date} onChange={handleChange} />
          {renderError("decision_date")}
        </div>
        <div>
          <Label>Effective From</Label>
          <Input type="date" name="effective_from" value={form.effective_from} onChange={handleChange} />
          {renderError("effective_from")}
        </div>
        <div>
          <Label>Effective To</Label>
          <Input type="date" name="effective_to" value={form.effective_to || ""} onChange={handleChange} />
          {renderError("effective_to")}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center pt-4"> 
        {mode === "edit" && (
          <Button variant="ghost" className="text-sm text-gray-600 hover:text-gray-800 p-0 h-auto" onClick={() => navigate("/disciplines")}>
            ← Back to List
          </Button>
        )}
        <Button style={{ backgroundColor: '#032B91', color: 'white' }} className="w-40 ml-auto" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : mode === "edit" ? "Update" : "Add"}
        </Button>
      </div>
    </div>
  );
};

export default SharedDisciplineForm;