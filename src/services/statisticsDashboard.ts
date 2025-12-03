import axios from 'axios';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
};

// Use same pattern as other services
const API_BASE = 'http://localhost:3000/api/statistics';

export interface StatisticsOverview {
  occupancyRate: number;
  totalStudents: number;
  availableRooms: number;
  pendingDiscipline: number;
  totalCapacity: number;
  currentResidents: number;
}

export interface FacultyDistributionItem {
  faculty: string;
  count: number;
}

export interface OccupancyByBuildingItem {
  building: string;
  totalCapacity: number;
  currentResidents: number;
  available: number;
}

export interface DisciplineSeverityItem {
  severity: string;
  count: number;
}

export interface ViolationsTrendItem {
  month: string;
  count: number;
}

interface StatisticsQueryParams {
  from?: string;
  to?: string;
  buildingId?: string;
  period?: string;
}

// Main statistics API calls
export const getStatisticsOverview = async (
  params?: StatisticsQueryParams,
): Promise<StatisticsOverview> => {
  const response = await axios.get<StatisticsOverview>(
    `${API_BASE}/overview`,
    {
      params,
      headers: getAuthHeaders(),
    },
  );
  return response.data;
};

export const getFacultyDistribution = async (
  params?: StatisticsQueryParams,
): Promise<FacultyDistributionItem[]> => {
  const response = await axios.get<{ data: FacultyDistributionItem[] }>(
    `${API_BASE}/faculty-distribution`,
    {
      params,
      headers: getAuthHeaders(),
    },
  );
  return response.data.data;
};

export const getOccupancyByBuilding = async (
  params?: StatisticsQueryParams,
): Promise<OccupancyByBuildingItem[]> => {
  const response = await axios.get<{ data: OccupancyByBuildingItem[] }>(
    `${API_BASE}/occupancy-by-building`,
    {
      params,
      headers: getAuthHeaders(),
    },
  );
  return response.data.data;
};

export const getDisciplineSeverity = async (
  params?: StatisticsQueryParams,
): Promise<DisciplineSeverityItem[]> => {
  const response = await axios.get<{ data: DisciplineSeverityItem[] }>(
    `${API_BASE}/discipline-severity`,
    {
      params,
      headers: getAuthHeaders(),
    },
  );
  return response.data.data;
};

export const getViolationsTrend = async (
  params?: StatisticsQueryParams,
): Promise<ViolationsTrendItem[]> => {
  const response = await axios.get<{ data: ViolationsTrendItem[] }>(
    `${API_BASE}/violations-trend`,
    {
      params,
      headers: getAuthHeaders(),
    },
  );
  return response.data.data;
};

// Drill-down API calls
interface DrillDownParams {
  faculty?: string;
  severity?: string;
  status?: string;
  from?: string;
  to?: string;
  month?: string;
  buildingId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getStudentsForDrillDown = async (
  params?: DrillDownParams,
): Promise<PaginatedResponse<any>> => {
  const response = await axios.get<PaginatedResponse<any>>(
    `${API_BASE}/drill-down/students`,
    {
      params,
      headers: getAuthHeaders(),
    },
  );
  return response.data;
};

export const getRoomsForDrillDown = async (
  params?: DrillDownParams,
): Promise<PaginatedResponse<any>> => {
  const response = await axios.get<PaginatedResponse<any>>(
    `${API_BASE}/drill-down/rooms`,
    {
      params,
      headers: getAuthHeaders(),
    },
  );
  return response.data;
};

export const getDisciplinesForDrillDown = async (
  params?: DrillDownParams,
): Promise<PaginatedResponse<any>> => {
  const response = await axios.get<PaginatedResponse<any>>(
    `${API_BASE}/drill-down/disciplines`,
    {
      params,
      headers: getAuthHeaders(),
    },
  );
  return response.data;
};
