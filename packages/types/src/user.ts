export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'USER';
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
  createdAt: string;
}
