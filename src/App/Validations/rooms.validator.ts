import { z } from 'zod';

export const BuildingIdParams = z.object({
  buildingId: z.string().min(1, 'buildingId is required'),
});

export const RoomCheckParams = z.object({
  buildingId: z.string().min(1, 'buildingId is required'),
  roomId: z.string().min(1, 'roomId is required'),
});

export type BuildingIdParamsDto = z.infer<typeof BuildingIdParams>;
export type RoomCheckParamsDto = z.infer<typeof RoomCheckParams>;
