// disciplineService.ts

import axios from "axios";

export interface Discipline {
  action_id: string;
  sssn: string;
  action_type: string;
  reason: string;
  severity_level: string;
  status: string;
  decision_date: string;
  effective_from: string;
  effective_to?: string | null;
}

// Interface cho dữ liệu phản hồi có phân trang
export interface DisciplinePaginationResponse {
    data: Discipline[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}

const API = "/api/discipline";

// GET ALL — luôn trả về Discipline[]
export const getAllDisciplines = async (): Promise<Discipline[]> => {
  const res = await axios.get(API);
  return res.data as Discipline[];
};

/**
 * GET PAGINATED - Lấy danh sách kỷ luật có phân trang
 * @param page Trang hiện tại (mặc định là 1)
 * @param limit Số lượng bản ghi mỗi trang (mặc định là 10)
 * @returns DisciplinePaginationResponse
 */
export const getPaginatedDisciplines = async (
    page: number = 1,
    limit: number = 10
): Promise<DisciplinePaginationResponse> => {
    const res = await axios.get(`${API}`, {
        params: { page, limit }
    });
    return res.data as DisciplinePaginationResponse;
};


// GET ONE — luôn trả Discipline | null
export const getDiscipline = async (
  action_id: string
): Promise<Discipline | null> => {
  try {
    const res = await axios.get(`${API}/${action_id}`);

    if (!res.data) return null;

    return res.data as Discipline;
  } catch {
    return null;
  }
};

// CREATE — trả về Discipline
export const createDiscipline = async (
  data: Discipline
): Promise<Discipline> => {
  const res = await axios.post(API, data);
  return res.data as Discipline;
};

// UPDATE — trả về Discipline
export const updateDiscipline = async (
  action_id: string,
  data: Discipline
): Promise<Discipline> => {
  const res = await axios.put(`${API}/${action_id}`, data);
  return res.data as Discipline;
};

// DELETE — trả về boolean hoặc message
export const deleteDiscipline = async (
  action_id: string
): Promise<boolean> => {
  const res = await axios.delete(`${API}/${action_id}`);
  return !!res.data; 
};