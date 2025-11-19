// src/pages/discipline/ViewDisciplinePage.tsx

import React, { useEffect, useState } from "react";
import { getDiscipline } from "@/services/disciplineService";
import { useParams, useNavigate } from "react-router-dom";
import { Discipline } from "@/services/disciplineService";
import { Button } from "@/components/ui/button";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

const ViewDisciplinePage: React.FC = () => {
  const { action_id } = useParams<{ action_id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<Discipline | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      if (!action_id) {
        navigate("/disciplines");
        return;
      }
      try {
        setLoading(true);
        const res = await getDiscipline(action_id);
        setData(res || null);
      } catch {
        navigate("/disciplines");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [action_id, navigate]);

  // LOADING UI
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

  // NO DATA
  if (!data) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 bg-gray-100 p-8">Không tìm thấy bản ghi</main>
        </div>
        <Footer />
      </div>
    );
  }

  // MAIN VIEW UI (giống Add/Edit)
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        {/* Main content giống Add/Edit */}
        <main className="flex-1 bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">
            {/* TITLE + BUTTONS (Không cần) */}
            <h2 className="text-2xl font-bold mb-6">View Discipline</h2>
            {/* CONTENT */}
            <div className="space-y-4 text-gray-800 text-[16px]">
              <div>
                <strong>Action ID:</strong> {data.action_id}
              </div>

              <div>
                <strong>SSSN:</strong> {data.sssn}
              </div>

              <div>
                <strong>Action Type:</strong> {data.action_type}
              </div>

              <div>
                <strong>Severity Level:</strong> {data.severity_level}
              </div>

              <div>
                <strong>Status:</strong> {data.status}
              </div>

              <div>
                <strong>Decision Date:</strong> {data.decision_date}
              </div>

              <div>
                <strong>Effective From:</strong> {data.effective_from}
              </div>

              <div>
                <strong>Effective To:</strong> {data.effective_to || "—"}
              </div>

              <div>
                <strong>Reason:</strong>
                <p className="mt-2 whitespace-pre-wrap">{data.reason}</p>
              </div>
            </div>

            {/* CHỈNH SỬA Ở ĐÂY: Thay đổi `div` container từ `justify-between` thành `justify-end` */}
            <div className="flex justify-end items-center mt-6"> {/* Dùng justify-end để đẩy nhóm nút sang phải và mt-6 tạo khoảng cách */}
              <div className="flex gap-2">
                <Button style={{ backgroundColor: '#032B91', color: 'white' }} onClick={() => navigate(`/disciplines/edit/${data.action_id}`)}>
                  Edit
                </Button>

                <Button variant="ghost" onClick={() => navigate("/disciplines")}>
                  Back
                </Button>
              </div>
            </div>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default ViewDisciplinePage;