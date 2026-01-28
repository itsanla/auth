export interface GmailAccount {
  email: string;
  key: string;
  backupCodes: string[];
}

export interface JWTPayload {
  username: string;
  iat: number;
  exp: number;
}
