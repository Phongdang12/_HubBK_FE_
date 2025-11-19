import { z } from 'zod';

export const GetDisciplinedStudents = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid startDate format',
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid endDate format',
  }),
});

export const BuildingIdParams = z.object({
  buildingId: z
    .string()
    .min(1, {
      message: 'Building ID is required',
    })
    .max(5, {
      message: 'Building ID must be at most 5 characters long',
    }),
});

export type GetDisciplinedStudentsDto = z.infer<typeof GetDisciplinedStudents>;
export type BuildingIdParamsDto = z.infer<typeof BuildingIdParams>;
