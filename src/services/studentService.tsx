import axios from 'axios';
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
const API_URL = "http://localhost:3000/api/students";

export interface PaginatedStudentsResponse {
  data: Student[];
  pagination: {
    totalPages: number;
  };
}

export const getPaginatedStudents = async (
  page: number,
  limit: number,
): Promise<PaginatedStudentsResponse> => {
  const response = await axios.get<PaginatedStudentsResponse>(
    `${API_URL}/paginated?page=${page}&limit=${limit}`,
  );
  return response.data;
};
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
};

export const getAllStudents = async (): Promise<Student[]> => {
  try {
    console.log('Making request to /api/students...');
    const headers = getAuthHeaders();
    console.log('Auth headers:', headers);
    
    const response = await axios.get<Student[]>('/api/students', {
      headers,
    });
    console.log('Response received:', response);
    return response.data;
  } catch (error: any) {
    console.error('Error in getAllStudents:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch students data');
  }
};

export const deleteStudent = async (ssn: string): Promise<void> => {
  try {
    await axios.delete(`/api/students/${ssn}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error('Failed to delete student:', error);
    throw error;
  }
};

export const getStudentDetail = async (ssn: string): Promise<Student> => {
  const response = await axios.get<Student>(`/api/students/${ssn}`, {
    headers: getAuthHeaders(),
  });
  const data = response.data;
  return {
    ...data,
    fullname: `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim(),
  };
};


export const updateStudent = async (
  ssn: string,
  student: Partial<Student>,
): Promise<Student> => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    };

    const response = await axios.put<Student>(`/api/students/${ssn}`, student, {
      headers,
    });
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: { message?: string } } };
    const message = err.response?.data?.message || 'Failed to update student';
    throw new Error(message);
  }
};


export const getNotFamilyStudent = async (): Promise<Student[]> => {
  const response = await axios.get<Student[]>('/api/students/no-relatives', {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const addStudent = async (student: Student): Promise<Student> => {
  try {
    const response = await axios.post<Student>('/api/students', student, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to add student:', error);
    throw error;
  }
};
