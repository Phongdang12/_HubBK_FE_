export const DISCIPLINE_FORMS = [
  "Cafeteria Duty",
  "Cleaning Duty",
  "Community Service",
  "Dorm Cleaning",
  "Library Service",
  "Yard Cleaning",
  "Classroom Setup",
  "Hall Monitoring",
] as const;

export const SEVERITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Expulsion", value: "expulsion" },
] as const;

export const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
] as const;

export const ACTION_ID_ERROR_MESSAGE = "Mã hành động đã tồn tại hoặc không hợp lệ.";
export const STUDENT_CODE_ERROR_MESSAGE =
  "Mã sinh viên không hợp lệ hoặc không tồn tại trong hệ thống.";
export const ACTION_TYPE_ERROR_MESSAGE =
  "Loại hình kỷ luật không hợp lệ. Vui lòng chọn một trong các lựa chọn hợp lệ.";
export const SEVERITY_ERROR_MESSAGE =
  "Mức độ nghiêm trọng không hợp lệ. Vui lòng chọn một trong các mức độ: Low, Medium, High, Expulsion.";
export const STATUS_ERROR_MESSAGE =
  "Trạng thái không hợp lệ. Vui lòng chọn một trong các trạng thái: Active, Pending, Completed, Cancelled.";
export const REASON_ERROR_MESSAGE =
  "Lý do không hợp lệ. Vui lòng nhập lý do rõ ràng và hợp lý.";
export const DECISION_DATE_ERROR_MESSAGE =
  "Ngày quyết định không hợp lệ. Ngày quyết định không được là ngày trong tương lai.";
export const EFFECTIVE_FROM_ERROR_MESSAGE =
  "Ngày bắt đầu có hiệu lực phải nhỏ hơn ngày kết thúc có hiệu lực.";
export const EFFECTIVE_TO_ERROR_MESSAGE =
  "Ngày kết thúc có hiệu lực phải lớn hơn ngày bắt đầu có hiệu lực.";
export const GENERAL_FORM_ERROR_MESSAGE =
  "Vui lòng kiểm tra lại thông tin đã nhập và sửa các lỗi được chỉ ra.";

export type DisciplineFormOption = (typeof DISCIPLINE_FORMS)[number];

