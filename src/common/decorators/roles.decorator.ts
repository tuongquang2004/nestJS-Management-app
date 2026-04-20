import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants/constants';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export { ROLES_KEY };
