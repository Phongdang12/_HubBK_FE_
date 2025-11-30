// src/pages/discipline/DisciplineFormsManager.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast, Toaster } from 'react-hot-toast';
import { Trash2, Plus, RefreshCw, ChevronLeft, ChevronRight, FilePlus, List } from 'lucide-react';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

interface FormType {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

const ITEMS_PER_PAGE = 5;

const DisciplineFormsManager = () => {
  const [forms, setForms] = useState<FormType[]>([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [loading, setLoading] = useState(true);
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);

  const API = '/api/discipline-forms';

  const loadForms = async () => {
    try {
      const res = await axios.get<FormType[]>(API);
      setForms(res.data);
    } catch (error) {
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadForms(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error('Please enter a form name');
      return;
    }
    try {
      await axios.post(API, { name: newName.trim(), description: newDesc.trim() });
      toast.success('Form added successfully');
      setNewName('');
      setNewDesc('');
      loadForms();
      setCurrentPage(1);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to add');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await axios.delete<{ message: string }>(`${API}/${id}`);
      toast.success(res.data.message);
      loadForms();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      await axios.put(`${API}/${id}/toggle`, { is_active: !currentStatus });
      toast.success('Status updated successfully');
      loadForms();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // LOGIC PHÂN TRANG
  const totalPages = Math.ceil(forms.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentForms = forms.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-100 p-6">
          <div className="mx-auto max-w-7xl"> {/* Mở rộng container */}
            
            <h2 className="mb-6 text-2xl font-bold text-blue-900">Manage Discipline Forms</h2>
            
            {/* 🌟 GRID LAYOUT: Chia 2 Cột (1 bên trái, 2 bên phải) */}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
              
              {/* --- CỘT TRÁI: FORM ADD NEW (Chiếm 1 phần) --- */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 rounded-lg border bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-semibold text-gray-700">
                    <FilePlus className="h-5 w-5 text-blue-600" />
                    Add New Form
                  </div>
                  
                  <div className="grid gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Form Name <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        placeholder="E.g., Library Service" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Default Description
                      </label>
                      <Textarea 
                        placeholder="Description auto-fill when selected..." 
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="h-24 bg-gray-50 resize-none"
                      />
                    </div>
                    <Button 
                      onClick={handleAdd} 
                      style={{ backgroundColor: '#032B91' }}
                      className="w-full mt-2"
                    >
                      <Plus size={18} className="mr-2" /> Create Form
                    </Button>
                  </div>
                </div>
              </div>

              {/* --- CỘT PHẢI: DANH SÁCH (Chiếm 2 phần) --- */}
              <div className="lg:col-span-2">
                <div className="rounded-lg border bg-white shadow-sm">
                  <div className="flex items-center gap-2 border-b px-5 py-4 text-lg font-semibold text-gray-700">
                    <List className="h-5 w-5 text-blue-600" />
                    Existing Forms
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="p-4 w-14 text-center font-semibold text-gray-600 text-sm">#</th>
                          <th className="p-4 font-semibold text-gray-600 text-sm">Form Name</th>
                          <th className="p-4 font-semibold text-gray-600 text-sm">Description</th>
                          <th className="p-4 w-24 text-center font-semibold text-gray-600 text-sm">Status</th>
                          <th className="p-4 w-28 text-center font-semibold text-gray-600 text-sm">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {loading ? (
                          <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading data...</td></tr>
                        ) : currentForms.length === 0 ? (
                          <tr><td colSpan={5} className="p-8 text-center text-gray-500">No forms found.</td></tr>
                        ) : currentForms.map((item, index) => (
                          <tr key={item.id} className={`hover:bg-blue-50/50 transition-colors ${!item.is_active ? 'bg-gray-50' : ''}`}>
                            <td className="p-4 text-center text-gray-500 text-sm">{startIndex + index + 1}</td>
                            <td className={`p-4 font-medium text-sm ${!item.is_active ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                              {item.name}
                            </td>
                            <td className="p-4 text-sm text-gray-600 truncate max-w-[200px]" title={item.description}>
                                {item.description || '-'}
                            </td>
                            <td className="p-4 text-center">
                                <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${item.is_active ? 'bg-[#52C41A] text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {item.is_active ? 'Active' : 'Hidden'}
                                </span>
                            </td>
                            <td className="p-4 text-center flex justify-center gap-2">
                              {!item.is_active ? (
                                <button 
                                  onClick={() => handleToggle(item.id, item.is_active)}
                                  className="text-blue-600 hover:bg-blue-100 p-2 rounded-full transition-all"
                                  title="Reactivate"
                                >
                                  <RefreshCw size={16} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleDelete(item.id)}
                                  className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-all"
                                  title="Delete / Hide"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* THANH PHÂN TRANG */}
                  {!loading && forms.length > 0 && totalPages > 1 && (
                    <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-3">
                      <span className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={`h-8 min-w-[2rem] px-2 border transition-all ${
                              currentPage === page
                                ? 'bg-[#032B91] text-black border-[#032B91] hover:bg-[#022270] hover:text-black'
                                : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </Button>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default DisciplineFormsManager;