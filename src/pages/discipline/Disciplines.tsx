// src/pages/discipline/Disciplines.tsx
import React, { useEffect, useState, useMemo } from "react";
// Thay đổi import để chỉ dùng getAllDisciplines
import { getAllDisciplines, Discipline } from "@/services/disciplineService"; 
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import DisciplineTable from "./components/DisciplineTable";
import DisciplineFilter from "./components/DisciplineFilter";
import { Toaster } from "react-hot-toast"; 

const DisciplinesPage: React.FC = () => {
  // disciplines giờ là toàn bộ dữ liệu (không phân trang)
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // STATE PHÂN TRANG: ĐÃ XÓA
  
  // STATE CHO FILTER (giữ lại)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");

  // Hàm tải dữ liệu: Thay đổi sang getAllDisciplines
  const fetchData = async () => {
    try {
      setLoading(true);
      // Gọi API tải tất cả
      const data = await getAllDisciplines(); 
      setDisciplines(data || []);
      
    } catch (error) {
        console.error("Error fetching disciplines data:", error);
        setDisciplines([]); 
    } finally {
      setLoading(false);
    }
  };

  // Kích hoạt FETCH DATA khi component mount
  useEffect(() => {
    fetchData();
  }, []); 

  // Loại bỏ useEffect theo dõi [page] và [filter states]
  
  // LOGIC LỌC Client-side: KHÔI PHỤC useMemo
  const filteredDisciplines = useMemo(() => {
    let filtered = disciplines;

    // Lọc theo Search Query (Action ID hoặc SSSN)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        (d.action_id || '').toLowerCase().includes(query) ||
        (d.sssn || '').toLowerCase().includes(query)
      );
    }

    // Lọc theo Status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(d => d.status === selectedStatus);
    }

    // Lọc theo Severity Level
    if (selectedSeverity !== "all") {
      filtered = filtered.filter(d => d.severity_level === selectedSeverity);
    }

    return filtered;
  }, [disciplines, searchQuery, selectedStatus, selectedSeverity]);

  // Xử lý sau khi xóa thành công (chỉ cần xóa local và reload nếu cần)
  const handleDeleteLocal = (action_id: string) => {
    // Xóa khỏi danh sách disciplines gốc
    setDisciplines(prev => prev.filter(d => d.action_id !== action_id));
    // Không cần reload vì đã tải tất cả
  };
  
  // XÓA CÁC HÀM XỬ LÝ PHÂN TRANG: handlePrevPage, handleNextPage

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex flex-1 flex-col bg-gray-100 p-8">
          <div className="rounded-lg bg-white shadow-md p-6">
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Discipline List</h2>
              <Button
                style={{ backgroundColor: "#032B91" }}
                onClick={() => navigate("/disciplines/add")}
              >
                + Add Discipline
              </Button>
            </div>

            {/* COMPONENT FILTER (Chỉ còn Search) */}
            <DisciplineFilter 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              // Các props lọc Status/Severity đã được xóa trong DisciplineFilter
            />
            
            {loading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : (
              <>
                {/* TRUYỀN DỮ LIỆU ĐÃ LỌC (filteredDisciplines) VÀ HÀM SETTER CHO TABLE */}
                <DisciplineTable 
                  disciplines={filteredDisciplines} // <-- Truyền filteredDisciplines
                  onDeleteLocal={handleDeleteLocal} 
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  selectedSeverity={selectedSeverity}
                  setSelectedSeverity={setSelectedSeverity}
                />
              </>
            )}
          </div>
          <Toaster />
        </main>
      </div>
        <Footer />
    </div>
  );
};

export default DisciplinesPage;