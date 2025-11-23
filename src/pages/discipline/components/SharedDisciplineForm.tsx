// src/pages/discipline/components/SharedDisciplineForm.tsx
import { FC, useEffect, useMemo, useState } from "react";
import { Discipline, createDiscipline, updateDiscipline } from "@/services/disciplineService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import CustomDatePicker from "@/components/ui/date-picker";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  ACTION_ID_ERROR_MESSAGE,
  ACTION_TYPE_ERROR_MESSAGE,
  DECISION_DATE_ERROR_MESSAGE,
  DISCIPLINE_FORMS,
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

interface Props {
  initialData?: Discipline;
  mode: "add" | "edit" | "view";
}

const SharedDisciplineForm: FC<Props> = ({ initialData, mode }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState<Discipline>({
    action_id: "",
    sssn: "",
    action_type: "",
    reason: "",
    severity_level: "",
    status: "",
    decision_date: "",
    effective_from: "",
    effective_to: ""
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Discipline | "form", string>>>(
    {}
  );
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        action_id: initialData.action_id?.toUpperCase() || "",
        sssn: initialData.sssn || "",
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

  const clearFieldError = (name: keyof Discipline) => {
    setFormErrors((prev) => {
      if (!prev[name]) return prev;
      const updated = { ...prev };
      delete updated[name];
      if (Object.keys(updated).length === 0) {
        setFormErrorMessage(null);
      }
      return updated;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name as keyof Discipline);
  };

  const mapBackendErrors = (errors: Array<{ field: string; message: string }> = []) => {
    const mapped: Partial<Record<keyof Discipline | "form", string>> = {};
    errors.forEach(({ field, message }) => {
      mapped[field as keyof Discipline] = message;
    });
    setFormErrors(mapped);
    if (Object.keys(mapped).length > 0) {
      setFormErrorMessage(GENERAL_FORM_ERROR_MESSAGE);
    }
  };

  const isValidDateString = (value: string) => !!value && !Number.isNaN(Date.parse(value));

  const validateForm = () => {
    const errors: Partial<Record<keyof Discipline | "form", string>> = {};

    const actionId = form.action_id?.trim().toUpperCase();
    if (!actionId || !/^DA\d{3,}$/.test(actionId)) {
      errors.action_id = ACTION_ID_ERROR_MESSAGE;
    }

    if (!/^\d{8}$/.test(form.sssn.trim())) {
      errors.sssn = STUDENT_CODE_ERROR_MESSAGE;
    }

    if (!DISCIPLINE_FORMS.includes(form.action_type as (typeof DISCIPLINE_FORMS)[number])) {
      errors.action_type = ACTION_TYPE_ERROR_MESSAGE;
    }

    if (!SEVERITY_OPTIONS.some((opt) => opt.value === form.severity_level.toLowerCase())) {
      errors.severity_level = SEVERITY_ERROR_MESSAGE;
    }

    if (!STATUS_OPTIONS.some((opt) => opt.value === form.status.toLowerCase())) {
      errors.status = STATUS_ERROR_MESSAGE;
    }

    const reason = form.reason.trim();
    if (reason.length < 10 || reason.length > 500) {
      errors.reason = REASON_ERROR_MESSAGE;
    }

    if (!isValidDateString(form.decision_date) || new Date(form.decision_date) < today) {
      errors.decision_date = DECISION_DATE_ERROR_MESSAGE;
    }

    const fromValid = isValidDateString(form.effective_from);
    const toValid = isValidDateString(form.effective_to || "");
    if (!fromValid) {
      errors.effective_from = EFFECTIVE_FROM_ERROR_MESSAGE;
    }
    if (!toValid) {
      errors.effective_to = EFFECTIVE_TO_ERROR_MESSAGE;
    }

    if (fromValid && toValid) {
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
        action_id: form.action_id.toUpperCase(),
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
      if (Array.isArray(serverErrors) && serverErrors.length) {
        mapBackendErrors(serverErrors);
      }
      const serverMessage = error?.response?.data?.error || GENERAL_FORM_ERROR_MESSAGE;
      setFormErrorMessage(serverMessage);
      toast.error(serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderError = (field: keyof Discipline) =>
    formErrors[field] ? (
      <p className="mt-1 text-sm text-red-600">{formErrors[field]}</p>
    ) : null;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold">
        {mode === "edit" ? "Edit Discipline" : "Add New Discipline"}
      </h2>
      {formErrorMessage && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formErrorMessage}
        </div>
      )}

      {/* Grid 2 cột */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Action ID</Label>
          <Input
            name="action_id"
            value={form.action_id}
            onChange={handleChange}
            disabled={mode === "edit"}
          />
          {renderError("action_id")}
        </div>
        <div>
          <Label>SSSN</Label>
          <Input name="sssn" value={form.sssn} onChange={handleChange} />
          {renderError("sssn")}
        </div>

        <div>
          <Label>Form</Label>
          <select
            name="action_type"
            value={form.action_type}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">Select form</option>
            {DISCIPLINE_FORMS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {renderError("action_type")}
        </div>

        <div>
          <Label>Severity Level</Label>
          <select
            name="severity_level"
            value={form.severity_level}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">Select severity level</option>
            {SEVERITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {renderError("severity_level")}
        </div>

        <div>
          <Label>Status</Label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">Select status</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
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
        />
        {renderError("reason")}
      </div>

      {/* 3 ngày */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <CustomDatePicker
            id="decision_date"
            label="Decision Date"
            value={form.decision_date}
            onChange={(value) => {
              setForm((prev) => ({ ...prev, decision_date: value }));
              clearFieldError("decision_date");
            }}
            error={!!formErrors.decision_date}
            placeholder="dd/MM/yyyy"
          />
          {renderError("decision_date")}
        </div>

        <div>
          <CustomDatePicker
            id="effective_from"
            label="Effective From"
            value={form.effective_from}
            onChange={(value) => {
              setForm((prev) => ({ ...prev, effective_from: value }));
              clearFieldError("effective_from");
            }}
            error={!!formErrors.effective_from}
            placeholder="dd/MM/yyyy"
          />
          {renderError("effective_from")}
        </div>

        <div>
          <CustomDatePicker
            id="effective_to"
            label="Effective To"
            value={form.effective_to || ""}
            onChange={(value) => {
              setForm((prev) => ({ ...prev, effective_to: value }));
              clearFieldError("effective_to");
            }}
            error={!!formErrors.effective_to}
            placeholder="dd/MM/yyyy"
          />
          {renderError("effective_to")}
        </div>
      </div>

      {/* CÁC NÚT: Sử dụng flex và justify-between */}
      <div className="flex justify-between items-center pt-4"> 
        {/* Nút Quay lại (ở bên trái) */}
        {mode === "edit" && (
          <Button variant="ghost" className="text-sm text-gray-600 hover:text-gray-800 p-0 h-auto" onClick={() => navigate("/disciplines")}>
            ← Back to List
          </Button>
        )}
        {/* Nút Update/Add (ở bên phải) */}
        <Button
          style={{ backgroundColor: '#032B91', color: 'white' }}
          className="w-40"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Saving..." : mode === "edit" ? "Update" : "Add"}
        </Button>
        
      </div>
    </div>
  );
};

export default SharedDisciplineForm;