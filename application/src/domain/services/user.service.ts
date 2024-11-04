import { Inject, Injectable, Logger } from '@nestjs/common';
import { EnvService } from '@common/configuration/env/dotenv.config';
import { EncryptHelperService } from '@common/helpers/functions/encrypt.helper';
import { UserEntity } from '@domain/entities/user.entity';
import { USER_ENTITY_REPOSITORY } from '@domain/tokens/inject.token';
import { UserEntityRepository } from '@domain/repositories/user.repository';
import { ErrorHandlingUtil } from '@shared/utils/error.util';
import { IUpdateUserData } from '@shared/interfaces/update-user.interface';
import { EmailService } from '@infrastructure/email/email.service';
import { RedisService } from '@infrastructure/redis/services/redis.service';
import { AuthService } from '@infrastructure/security/services/auth.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(USER_ENTITY_REPOSITORY)
    private readonly userEntityRepository: UserEntityRepository,
    private readonly envService: EnvService,
    private readonly emailService: EmailService,
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
  ) {}

  private async handleFailedLoginAttempt(userId: string): Promise<void> {
    const attempts = await this.redisService.incrementLoginAttempts(userId);

    if (attempts >= this.envService.getRedisMaxLogin()) {
      await this.redisService.blockUser(userId);
      this.logger.warn(`User ${userId} is temporarily blocked due to multiple failed login attempts`);
    }
  }

  async createUser(user: UserEntity): Promise<UserEntity> {
    try {
      const savedUser = await this.userEntityRepository.create(user);

      const verificationCode = savedUser.generateEmailVerificationCode();

      await this.redisService.setEmailVerificationCode(savedUser.getUserId(), verificationCode, 3600);

      await this.emailService.sendVerificationEmail(savedUser.getUserEmail(), verificationCode);

      return savedUser;
    } catch (error) {
      this.logger.error('Error creating user', error);
      throw error;
    }
  }

  async verifyUserEmail(userId: string, code: string): Promise<boolean> {
    try {
      const storedCode = await this.redisService.getEmailVerificationCode(userId);

      if (storedCode === code) {
        await this.userEntityRepository.update(userId, { verified: true });

        await this.redisService.deleteEmailVerificationCode(userId);

        return true;
      } else {
        this.logger.warn(`Verification code mismatch for user ${userId}`);
        return false;
      }
    } catch (error) {
      this.logger.error('Error verifying user email', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      const user = await this.userEntityRepository.findByEmail(email);

      const resetToken = user.generateResetPasswordToken();

      await this.redisService.setResetPasswordToken(user.getUserId(), resetToken, 3600);

      const resetUrl = `${this.envService.getMailResetUrl()}/reset-password?token=${resetToken}`;

      await this.emailService.sendPasswordResetEmail(user.getUserEmail(), resetUrl);
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error('Error sending password reset email', error);
      throw error;
    }
  }

  async resetPassword(userId: string, token: string, newPassword: string): Promise<boolean> {
    try {
      const storedToken = await this.redisService.getResetPasswordToken(userId);

      if (storedToken !== token) {
        this.logger.warn(`Invalid reset token for user ${userId}`);
        return false;
      }

      const user = await this.userEntityRepository.findById(userId);

      const encryptHelperService = new EncryptHelperService();
      user.setPassword(newPassword, encryptHelperService);

      await this.userEntityRepository.update(userId, { password: user.getUserPassword() });

      await this.redisService.deleteResetPasswordToken(userId);

      this.logger.log(`Password reset successful for user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error('Error resetting password', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const user = await this.userEntityRepository.findByEmail(email);

      if (!user) {
        ErrorHandlingUtil.handleUnauthorizedAccess();
      }

      const isBlocked = await this.redisService.isUserBlocked(user.getUserId());

      if (isBlocked) {
        ErrorHandlingUtil.handleBlockedUser();
      }

      const encryptHelperService = new EncryptHelperService();
      const isPasswordValid = user.validatePassword(password, encryptHelperService);

      if (!isPasswordValid) {
        await this.handleFailedLoginAttempt(user.getUserId());
        ErrorHandlingUtil.handleInvalidCredentials();
      }

      await this.redisService.resetLoginAttempts(user.getUserId());

      const { accessToken, refreshToken } = this.authService.generateToken(user.getUserId(), user.getUserRole());

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error('Error during login', error);
      throw error;
    }
  }

  async logout(userId: string, accessToken: string, refreshToken: string): Promise<void> {
    try {
      const expiresInAccessToken = this.authService.getTokenExpiration(accessToken);
      const expiresInRefreshToken = this.authService.getTokenExpiration(refreshToken);

      await this.redisService.set(`blacklist:access:${accessToken}`, 'invalid', expiresInAccessToken);
      await this.redisService.set(`blacklist:refresh:${refreshToken}`, 'invalid', expiresInRefreshToken);

      this.logger.log(`User ${userId} logged out successfully`);
    } catch (error) {
      this.logger.error('Error during logout', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const isBlacklisted = await this.redisService.get(`blacklist:refresh:${refreshToken}`);

      if (isBlacklisted) {
        ErrorHandlingUtil.handleInvalidTokenError();
      }

      const { accessToken } = this.authService.refreshAccessToken(refreshToken);
      return { accessToken };
    } catch (error) {
      this.logger.error('Error refreshing token', error);
      throw error;
    }
  }

  async revokeAllSessions(userId: string): Promise<void> {
    try {
      await this.redisService.set(`blacklist:all-sessions:${userId}`, 'invalid', this.envService.getRefreshTokenExpiration());

      this.logger.log(`All sessions revoked for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error revoking all sessions for user ${userId}`, error);
      throw error;
    }
  }

  async confirmEmail(userId: string): Promise<boolean> {
    try {
      await this.userEntityRepository.update(userId, { verified: true });

      this.logger.log(`Email confirmed manually for user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error confirming email for user ${userId}`, error);
      throw error;
    }
  }

  async findUserById(userId: string): Promise<UserEntity | null> {
    try {
      const user = await this.userEntityRepository.findById(userId);

      return user;
    } catch (error) {
      this.logger.error('Error find user by id', error);
      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    try {
      const user = await this.userEntityRepository.findByEmail(email);

      return user;
    } catch (error) {
      this.logger.error('Error find user by email', error);
      throw error;
    }
  }

  async findAllUsers(): Promise<UserEntity[]> {
    try {
      return await this.userEntityRepository.findAll();
    } catch (error) {
      this.logger.error('Error find all users', error);
      throw error;
    }
  }

  async checkUserStatus(userId: string): Promise<{ isBlocked: boolean; verified: boolean }> {
    const user = await this.userEntityRepository.findById(userId);
    const isBlocked = await this.redisService.isUserBlocked(userId);

    return { isBlocked, verified: user.getUserVerified() };
  }

  async updateProfile(userId: string, updateData: Partial<IUpdateUserData>): Promise<UserEntity> {
    try {
      await this.userEntityRepository.update(userId, updateData);
      
      const updatedUser = await this.userEntityRepository.findById(userId);

      return updatedUser;
    } catch (error) {
      this.logger.error(`Error updating profile for user ${userId}`, error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      return await this.userEntityRepository.delete(userId);
    } catch (error) {
      this.logger.error('Error delete user', error);
      throw error;
    }
  }
}
