import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Discipline, getAllDisciplines } from "@/services/disciplineService";
import { getStudentOptions, StudentOption } from "@/services/studentService"; // 1. Import Service Sinh viên
import { SortConfig } from "./components/DisciplineTable";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

import DisciplineFilter from "./components/DisciplineFilter";
import DisciplineTable from "./components/DisciplineTable";
import { Toaster } from "react-hot-toast";

const LIMIT = 8;

const DisciplinesPage: React.FC = () => {
  const navigate = useNavigate();

  // ========== DATA ==========
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [studentsMap, setStudentsMap] = useState<StudentOption[]>([]); // 2. State lưu danh sách SV để map ID
  const [loading, setLoading] = useState(true);

  // ... (Các state search/filter/pagination giữ nguyên) ...
  const [globalQuery, setGlobalQuery] = useState("");
  const [formFilter, setFormFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc',
  });

  const handleSort = (key: keyof Discipline) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // ========== FETCH ALL ==========
  const fetchData = async () => {
    try {
      setLoading(true);
      // 3. Gọi song song cả API Kỷ luật và API Danh sách SV (Options)
      const [disciplineData, studentData] = await Promise.all([
        getAllDisciplines(),
        getStudentOptions()
      ]);

      setDisciplines(disciplineData || []);
      setStudentsMap(studentData || []); // Lưu map SV
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setDisciplines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ... (Logic Filter/Sort/Pagination giữ nguyên không đổi) ...
  useEffect(() => { setPage(1); }, [globalQuery, formFilter, severityFilter, statusFilter]);

  const filteredDisciplines = useMemo(() => {
    const q = globalQuery.toLowerCase();
    let result = disciplines.filter((d) => {
        const matchSearch = d.action_id?.toLowerCase().includes(q) || d.student_id?.toLowerCase().includes(q) || d.action_type?.toLowerCase().includes(q) || d.reason?.toLowerCase().includes(q) || false;
        const matchForm = !formFilter || d.action_type === formFilter;
        const matchSeverity = !severityFilter || d.severity_level === severityFilter;
        const matchStatus = !statusFilter || d.status === statusFilter;
        return matchSearch && matchForm && matchSeverity && matchStatus;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        // @ts-ignore
        const aValue = a[sortConfig.key]?.toString().toLowerCase() || '';
        // @ts-ignore
        const bValue = b[sortConfig.key]?.toString().toLowerCase() || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [disciplines, globalQuery, formFilter, severityFilter, statusFilter, sortConfig]);

  const start = (page - 1) * LIMIT;
  const end = start + LIMIT;
  const displayedDisciplines = filteredDisciplines.slice(start, end);
  const totalPages = Math.ceil(filteredDisciplines.length / LIMIT);

  const handleDeleteLocal = (action_id: string) => {
    setDisciplines((prev) => prev.filter((d) => d.action_id !== action_id));
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex flex-1 flex-col justify-between bg-gray-100">
          <div className="p-8">
            <div className="rounded-lg bg-white pb-6 shadow-md">
              
              {/* Header & Buttons */}
              <div className="sticky top-0 z-20 rounded-lg bg-white px-6 pt-6 pb-4">
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-xl font-semibold">Discipline List</h2>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate("/disciplines/forms")}>⚙️ Manage Forms</Button>
                    <Button style={{ backgroundColor: "#032B91" }} onClick={() => navigate("/disciplines/add")}>+ Add Discipline</Button>
                  </div>
                </div>

                <DisciplineFilter
                  globalQuery={globalQuery} setGlobalQuery={setGlobalQuery}
                  form={formFilter} setForm={setFormFilter}
                  severity={severityFilter} setSeverity={setSeverityFilter}
                  status={statusFilter} setStatus={setStatusFilter}
                  onClearAll={() => { setGlobalQuery(""); setFormFilter(""); setSeverityFilter(""); setStatusFilter(""); setPage(1); }}
                />
              </div>

              {/* Table */}
              <div className="mx-6 rounded-md border">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Loading disciplines...</div>
                ) : (
                  <>
                    <DisciplineTable
                      disciplines={displayedDisciplines}
                      onDeleteLocal={handleDeleteLocal}
                      globalQuery={globalQuery}
                      selectedStatus={statusFilter}
                      setSelectedStatus={setStatusFilter}
                      selectedSeverity={severityFilter}
                      setSelectedSeverity={setSeverityFilter}
                      sortConfig={sortConfig}
                      onSort={handleSort}
                      // 4. Truyền map sinh viên xuống table
                      studentList={studentsMap} 
                    />

                    {/* Pagination UI giữ nguyên */}
                    {(filteredDisciplines.length > LIMIT) && (
                      <div className="mt-4 flex items-center justify-center space-x-2">
                        <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="rounded border px-3 py-1 disabled:opacity-50">Prev</button>
                        <span>Page {page} / {totalPages}</span>
                        <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="rounded border px-3 py-1 disabled:opacity-50">Next</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <Footer />
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default DisciplinesPage;