import { v4 as uuidv4 } from 'uuid';

export class EmailVerificationCode {
  private readonly code: string;

  constructor() {
    this.code = uuidv4();
  }

  getCode(): string {
    return this.code;
  }

  isValid(code: string): boolean {
    return this.code === code;
  }
}

export class ResetPasswordToken {
  private readonly token: string;
  private readonly expiryDate: Date;

  constructor() {
    this.token = uuidv4();
    this.expiryDate = new Date(Date.now() + 3600 * 1000);
  }

  getToken(): string {
    return this.token;
  }

  isValid(token: string): boolean {
    return this.token === token && this.expiryDate > new Date();
  }

  isExpired(): boolean {
    return this.expiryDate <= new Date();
  }
}
