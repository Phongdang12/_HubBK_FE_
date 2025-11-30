// src/pages/discipline/EditDisciplinePage.tsx

import React, { useEffect, useState } from "react";
import SharedDisciplineForm from "@/pages/discipline/components/SharedDisciplineForm";
import { getDiscipline } from "@/services/disciplineService";
import { useParams, useNavigate } from "react-router-dom";
import { Discipline } from "@/services/disciplineService";
import { toast } from "react-hot-toast";
// import { Toaster } from 'react-hot-toast'; // <-- XÓA IMPORT
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

const EditDisciplinePage: React.FC = () => {
  const { action_id } = useParams<{ action_id: string }>();
  const navigate = useNavigate();
// ... (Logic loading và useEffect không đổi) ...
  const [initialData, setInitialData] = useState<Discipline | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      if (!action_id) {
        toast.error("Không xác định action_id");
        navigate("/disciplines");
        return;
      }

      try {
        setLoading(true);
        const data = await getDiscipline(action_id);

        if (!data) {
          toast.error("Không tìm thấy kỷ luật");
          navigate("/disciplines");
          return;
        }

        setInitialData({
          action_id: data.action_id,
          student_id: data.student_id || "",
          action_type: data.action_type || "",
          reason: data.reason || "",
          severity_level: data.severity_level || "",
          status: data.status || "",
          decision_date: data.decision_date || "",
          effective_from: data.effective_from || "",
          effective_to: data.effective_to || "",
        });
      } catch {
        toast.error("Lỗi khi tải dữ liệu");
        navigate("/disciplines");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [action_id, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 bg-gray-100 p-8">Đang tải...</main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 bg-gray-100 p-8">

          {/* Form chỉnh sửa */}
          <SharedDisciplineForm initialData={initialData} mode="edit" />
          {/* <Toaster /> <-- XÓA TOASTER */}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default EditDisciplinePage;