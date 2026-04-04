import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  householdId: string | null;
}
