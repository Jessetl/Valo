export const FIREBASE_AUTH_SERVICE = Symbol('FIREBASE_AUTH_SERVICE');

export interface FirebaseSignUpInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface FirebaseSignInInput {
  email: string;
  password: string;
}

export interface FirebaseAuthResult {
  firebaseUid: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  email: string;
}

export interface FirebaseRefreshResult {
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  firebaseUid: string;
}

export interface FirebaseGoogleSignInResult extends FirebaseAuthResult {
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
}

export interface IFirebaseAuthService {
  signUp(input: FirebaseSignUpInput): Promise<FirebaseAuthResult>;
  signIn(input: FirebaseSignInInput): Promise<FirebaseAuthResult>;
  refreshIdToken(refreshToken: string): Promise<FirebaseRefreshResult>;
  sendEmailVerification(idToken: string): Promise<void>;
  isEmailVerified(firebaseUid: string): Promise<boolean>;
  deleteUser(firebaseUid: string): Promise<void>;
  updatePassword(firebaseUid: string, newPassword: string): Promise<void>;
  revokeRefreshTokens(firebaseUid: string): Promise<void>;
  sendPasswordResetEmail(email: string): Promise<void>;
  signInWithGoogle(googleIdToken: string): Promise<FirebaseGoogleSignInResult>;
}
