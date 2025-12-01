import { SetMetadata } from '@nestjs/common';

export const ADMIN_LEVELS_KEY = 'adminLevels';
export const AdminLevels = (...levels: string[]) => SetMetadata(ADMIN_LEVELS_KEY, levels);
