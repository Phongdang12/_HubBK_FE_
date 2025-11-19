// src/pages/discipline/components/SharedDisciplineForm.tsx
import { FC, useEffect, useState } from "react";
import { Discipline, createDiscipline, updateDiscipline } from "@/services/disciplineService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface Props {
  initialData?: Discipline;
  mode: "add" | "edit" | "view";
}


const SharedDisciplineForm: FC<Props> = ({ initialData, mode }) => {
  const navigate = useNavigate();
// ... (form state, useEffect, handleChange, validateForm) ...
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

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!form.sssn) return toast.error("SSSN không được để trống");
    if (!form.action_type) return toast.error("Hình thức không được để trống");
    if (!form.reason) return toast.error("Lý do không được bỏ trống");
    if (!form.severity_level) return toast.error("Mức độ không được bỏ trống");
    if (!form.status) return toast.error("Trạng thái không được bỏ trống");
    if (!form.decision_date) return toast.error("Ngày quyết định không hợp lệ");
    if (!form.effective_from) return toast.error("Ngày bắt đầu hiệu lực không hợp lệ");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (mode === "edit") {
        await updateDiscipline(form.action_id, form);
        toast.success("Discipline updated successfully!");
      } else {
        await createDiscipline(form);
        toast.success("Discipline created successfully!");
      }

      // Vẫn điều hướng về /disciplines. 
      // Lỗi là ở trang Disciplines.tsx không tự reset về trang 1 và clear filter.
      navigate("/disciplines"); 
    } catch (error: any) {
      toast.error(`Failed to save discipline: ${error?.response?.data?.message || ''}`);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6">
      {/* ... (Phần UI không đổi) ... */}
      <h2 className="text-2xl font-bold">
        {mode === "edit" ? "Edit Discipline" : "Add New Discipline"}
      </h2>

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
        </div>
        <div>
          <Label>SSSN</Label>
          <Input name="sssn" value={form.sssn} onChange={handleChange} />
        </div>

        <div>
          <Label>Form</Label>
          <Input name="action_type" value={form.action_type} onChange={handleChange} />
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
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="expulsion">Expulsion</option>
          </select>
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
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
      </div>

      {/* 3 ngày */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Decision Date</Label>
          <Input type="date" name="decision_date" value={form.decision_date} onChange={handleChange} />
        </div>

        <div>
          <Label>Effective From</Label>
          <Input type="date" name="effective_from" value={form.effective_from} onChange={handleChange} />
        </div>

        <div>
          <Label>Effective To</Label>
          <Input type="date" name="effective_to" value={form.effective_to || ""} onChange={handleChange} />
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
        <Button style={{ backgroundColor: '#032B91', color: 'white' }} className="w-40" onClick={handleSubmit}>
          {mode === "edit" ? "Update" : "Add"}
        </Button>
        
      </div>
    </div>
  );
};

export default SharedDisciplineForm;