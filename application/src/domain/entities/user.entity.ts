import { v4 as uuidv4 } from 'uuid';
import { EncryptHelperService } from '@common/helpers/functions/encrypt.helper';
import { EmailVerificationCode, ResetPasswordToken } from '@domain/value-objects/user-email-verification-code.value-object';

export class UserEntity {
  private emailVerificationCode?: EmailVerificationCode;
  private resetPasswordToken?: ResetPasswordToken;

  constructor(
    public readonly userId: string = uuidv4(),
    public readonly userName: string,
    public readonly userEmail: string,
    protected userPassword: string,
    public readonly userRole: string,
    public userVerified: boolean = false,
  ) {}

  getUserId(): string {
    if (!this.userId) {
      throw new Error('User id is not set');
    }
    return this.userId;
  }

  getUserName(): string {
    if (!this.userName) {
      throw new Error('User name is not set');
    }
    return this.userName;
  }

  getUserEmail(): string {
    if (!this.userEmail) {
      throw new Error('User email is not set');
    }
    return this.userEmail;
  }

  getUserPassword(): string {
    if (!this.userPassword) {
      throw new Error('User password is not set');
    }
    return this.userPassword;
  }

  getUserRole(): string {
    if (!this.userRole) {
      throw new Error('User role is not set');
    }
    return this.userRole;
  }

  getUserVerified(): boolean {
    return this.userVerified;
  }

  generateEmailVerificationCode(): string {
    this.emailVerificationCode = new EmailVerificationCode();
    return this.emailVerificationCode.getCode();
  }

  verifyEmail(code: string): boolean {
    if (this.emailVerificationCode && this.emailVerificationCode.isValid(code)) {
      this.userVerified = true;
      this.emailVerificationCode = undefined;
      return true;
    }
    return false;
  }

  generateResetPasswordToken(): string {
    this.resetPasswordToken = new ResetPasswordToken();
    return this.resetPasswordToken.getToken();
  }

  validateResetPasswordToken(token: string): boolean {
    if (this.resetPasswordToken && this.resetPasswordToken.isValid(token)) {
      this.resetPasswordToken = undefined;
      return true;
    }
    return false;
  }

  isResetPasswordTokenExpired(): boolean {
    return this.resetPasswordToken?.isExpired() ?? true;
  }

  setPassword(newPassword: string, encryptHelperService: EncryptHelperService): void {
    this.userPassword = encryptHelperService.encryptPassword(newPassword);
  }

  encryptPassword(encryptHelperService: EncryptHelperService): void {
    this.userPassword = encryptHelperService.encryptPassword(this.userPassword);
  }

  validatePassword(password: string, encryptHelperService: EncryptHelperService): boolean {
    return encryptHelperService.validatePassword(password, this.getUserPassword());
  }
}
