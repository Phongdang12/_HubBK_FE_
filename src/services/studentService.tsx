import axios from 'axios';
export interface StudentOption {
  sssn: string;
  first_name: string;
  last_name: string;
  student_id: string;
}
export interface Student {
  ssn: string;
  cccd: string;
  student_id?: string;
  first_name: string;
  last_name: string;
  fullname?: string;
  birthday: string;
  sex: string;
  health_state?: string;
  ethnic_group: string;
  has_health_insurance?: boolean;
  study_status: string;
  class_name: string;
  faculty: string;
  building_id?: string;
  room_id?: string;
  phone_numbers?: string;
  emails?: string;
  addresses?: string;

  guardian_cccd?: string;
  guardian_name?: string;
  guardian_relationship?: string;
  guardian_occupation?: string;
  guardian_birthday?: string;
  guardian_phone_numbers?: string;
  guardian_addresses?: string;
}

const API_URL = 'http://localhost:3000/api/students';

/* ========================= AUTH ========================= */

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
};

/* ========================= PAGINATION + FILTER + SORT ========================= */

export interface PaginatedStudentsResponse {
  data: Student[];
  pagination: {
    totalPages: number;
  };
}

export const getPaginatedStudents = async (
  page: number,
  limit: number,
  payload?: {
    sorts?: { field: string; order: 'asc' | 'desc' }[];
    filters?: {
      faculty?: string;
      room?: string;
      building?: string;
      status?: string;
    };
  },
): Promise<PaginatedStudentsResponse> => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    _t: String(Date.now()),
  });

  if (payload?.sorts) {
    query.append('sorts', JSON.stringify(payload.sorts));
  }

  if (payload?.filters?.faculty) {
    query.append('faculty', payload.filters.faculty);
  }
  if (payload?.filters?.room) {
    query.append('room', payload.filters.room);
  }
  if (payload?.filters?.building) {
    query.append('building', payload.filters.building);
  }
  if (payload?.filters?.status) {
    query.append('status', payload.filters.status);
  }

  const response = await axios.get<PaginatedStudentsResponse>(
    `${API_URL}/paginated?${query.toString()}`,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data;
};

/* ========================= GET ALL ========================= */

export const getAllStudents = async (): Promise<Student[]> => {
  try {
    const response = await axios.get<Student[]>(API_URL, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch students data');
  }
};

/* ========================= DETAIL ========================= */

export const getStudentDetail = async (ssn: string): Promise<Student> => {
  const response = await axios.get<Student>(`${API_URL}/${ssn}`, {
    headers: getAuthHeaders(),
  });

  const data = response.data;

  return {
    ...data,
    fullname: `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim(),
  };
};

/* ========================= ADD ========================= */

export const addStudent = async (
  student: Partial<Student>,
): Promise<Student> => {
  try {
    const response = await axios.post<Student>(API_URL, student, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Failed to add student:', error);
    throw error;
  }
};

/* ========================= UPDATE ========================= */

export const updateStudent = async (
  ssn: string,
  student: Partial<Student>,
): Promise<Student> => {
  try {
    const response = await axios.put<Student>(
      `${API_URL}/${ssn}`,
      student,
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      },
    );
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || 'Failed to update student';
    throw new Error(message);
  }
};

/* ========================= DELETE ========================= */

export const deleteStudent = async (ssn: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${ssn}`, {
      headers: getAuthHeaders(),
    });
  } catch (error: any) {
    console.error('Failed to delete student:', error);
    // TRÍCH XUẤT MESSAGE TỪ BACKEND ĐỂ GỬI RA UI
    const message = error.response?.data?.message || 'Failed to delete student';
    throw new Error(message);
  }
};

/* ========================= OTHER ========================= */

export const getNotFamilyStudent = async (): Promise<Student[]> => {
  const response = await axios.get<Student[]>(
    `${API_URL}/no-relatives`,
    {
      headers: getAuthHeaders(),
    },
  );
  return response.data;
};

export const getStudentFilterOptions = async () => {
  const response = await axios.get('/api/students/filters/options', {
    headers: getAuthHeaders(),
  });

  return response.data as {
    faculties: string[];
    rooms: string[];
    buildings: string[];
    statuses: string[];
  };
};
export const getStudentOptions = async (): Promise<StudentOption[]> => {
  const res = await axios.get('/api/students/options');
  return res.data as StudentOption[];
};
export const getStudentsWithoutRoom = async (): Promise<StudentOption[]> => {
  const res = await axios.get('/api/students/without-room', {
    headers: getAuthHeaders(),
  });
  return res.data as StudentOption[];
};