import axios from "axios";

export interface DisciplineFormType {
  id: number;
  name: string;
}

const API = "/api/discipline-forms";

export const getDisciplineForms = async (): Promise<DisciplineFormType[]> => {
  const res = await axios.get(API);
  return res.data as DisciplineFormType[];
};

export const addDisciplineForm = async (name: string): Promise<DisciplineFormType> => {
  const res = await axios.post(API, { name });
  return res.data as DisciplineFormType;
};

export const deleteDisciplineForm = async (id: number): Promise<void> => {
  await axios.delete(`${API}/${id}`);
};