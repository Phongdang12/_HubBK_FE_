import { z } from 'zod';

export const SsnParam = z.object({
  ssn: z.string().length(8, {
    message: 'SSN must be exactly 8 characters long',
  }),
});

// ✅ Schema dùng cho thêm sinh viên (add)
export const StudentBody = z.object({
  ssn: z.string().trim().length(8, {
    message: 'SSN must be exactly 8 characters long',
  }),
  cccd: z.string().trim().length(12, {
    message: 'CCCD must be exactly 12 characters long',
  }),
  first_name: z.string().trim().min(1, { message: 'First name is required' }),
  last_name: z.string().trim().min(1, { message: 'Last name is required' }),
  birthday: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Birthday must be a valid date',
  }),
  sex: z.enum(['M', 'F'], { message: 'Sex is required' }),
  health_state: z.string().nullable(),
  ethnic_group: z.string({ message: 'Ethnic group is required' }),
  student_id: z.string().trim().length(7, {
    message: 'Student ID must be exactly 7 characters long',
  }),
  has_health_insurance: z.boolean().nullable(),
  study_status: z.string({ message: 'Study status is required' }),
  class_name: z.string().nullable(),
  faculty: z.string().nullable(),
  building_id: z.string({ message: 'Building ID is required' }),
  room_id: z.string({ message: 'Room ID is required' }),

  // ✅ Các thông tin bổ sung
  phone_numbers: z.string().nullable(),
  emails: z.string().nullable(),
  addresses: z.string().nullable(),

  // ✅ Guardian (tuỳ chọn)
  guardian_cccd: z.string().trim().length(12, {
    message: 'Guardian CCCD must be exactly 12 characters long',
  }).optional(),
  guardian_name: z.string().trim().optional(),
  guardian_relationship: z.string().optional(),
  guardian_occupation: z.string().optional(),
  guardian_birthday: z.string().optional(),
  guardian_phone_numbers: z.string().nullable().optional(),
  guardian_addresses: z.string().nullable().optional(),
});

// ✅ Schema dùng cho cập nhật sinh viên (update)
export const UpdateStudentBody = StudentBody.extend({
  new_ssn: z.string().trim().length(8, {
    message: 'New SSN must be exactly 8 characters long',
  }),
});

export type SsnParamDto = z.infer<typeof SsnParam>;
export type AddStudentBodyDto = z.infer<typeof StudentBody>;
export type UpdateStudentBodyDto = z.infer<typeof UpdateStudentBody>;
