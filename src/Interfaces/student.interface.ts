export interface Student {
  new_ssn: string;
  cccd: string;
  ssn: string;
  guardian_list?: any[]; // Thêm trường guardian_list để chứa danh sách người thân
  first_name: string;
  last_name: string;
  birthday: string;
  sex: string;
  health_state: string | null;
  ethnic_group: string | null;
  student_id: string;
  has_health_insurance?: boolean; // Optional vì database không có field này
  study_status: string | null;
  class_name: string | null;
  faculty: string | null;
  building_id: string;
  room_id: string;
  phone_numbers: string;
  emails: string;
  addresses: string;
  guardian_cccd?: string;
  guardian_name?: string;
  guardian_relationship?: string;
  guardian_occupation?: string;
  guardian_birthday?: string;
  guardian_phone_numbers?: string;
  guardian_addresses?: string;
}
