import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConflictException, NotFoundException, InternalServerErrorException, BadRequestException, ForbiddenException, UnauthorizedException, Logger } from '@nestjs/common';

export class ErrorHandlingUtil {
  private static readonly logger = new Logger(ErrorHandlingUtil.name);

  static handlePrismaError(error: any, action: string = 'database operation'): never {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          this.logger.warn(`Conflict error on unique field during ${action}`);
          throw new ConflictException(`A record with a unique field already exists.`);
        case 'P2025':
          this.logger.warn(`Record not found error during ${action}`);
          throw new NotFoundException(`The requested record was not found.`);
        case 'P2016':
          this.logger.warn(`Invalid data error during ${action}`);
          throw new BadRequestException(`Invalid data provided for the requested ${action}.`);
        case 'P2003':
          this.logger.warn(`Foreign key constraint failed during ${action}`);
          throw new BadRequestException(`Invalid foreign key reference in the requested ${action}.`);
        default:
          this.logger.error(`Unexpected Prisma error during ${action}`, error);
          throw new InternalServerErrorException(`An unexpected error occurred with the database during ${action}.`);
      }
    } else {
      this.logger.error(`Non-Prisma error during ${action}`, error);
      throw error;
    }
  }

  static handleEmailError(error: any, action: string = 'sending email'): never {
    this.logger.error(`Error ${action}`, error.stack || error.message);
    throw new InternalServerErrorException(`Failed to ${action}. Please try again later.`);
  }

  static handleInvalidCredentials(): never {
    this.logger.warn('Invalid login attempt due to incorrect credentials');
    throw new UnauthorizedException('Invalid email or password');
  }

  static handleBlockedUser(): never {
    this.logger.warn('User is temporarily blocked due to multiple failed login attempts');
    throw new BadRequestException('User is temporarily blocked due to multiple failed login attempts. Please try again later.');
  }

  static handleTokenExpiredError(): never {
    this.logger.warn('Token has expired');
    throw new UnauthorizedException('Token has expired');
  }

  static handleInvalidTokenError(): never {
    this.logger.warn('Invalid token detected');
    throw new UnauthorizedException('Invalid token');
  }

  static handleRefreshTokenExpiredError(): never {
    this.logger.warn('Refresh token has expired');
    throw new UnauthorizedException('Refresh token has expired');
  }

  static handleUnauthorizedAccess(message: string = 'You are not authorized to access this resource'): never {
    this.logger.warn('Unauthorized access attempt detected');
    throw new UnauthorizedException(message);
  }

  static handleMalformedTokenError(): never {
    this.logger.warn('Malformed or invalid token detected');
    throw new UnauthorizedException('Invalid token');
  }

  static validateUserFields(userEntity: { getUserName: () => string; getUserEmail: () => string; getUserPassword: () => string }): void {
    if (!userEntity.getUserName() || !userEntity.getUserEmail() || !userEntity.getUserPassword()) {
      throw new BadRequestException('User name, email, and password are required');
    }
  }

  static ensureHasUpdateFields(updateData: object): void {
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('At least one field must be provided to update the user.');
    }
  }

  static ensureEntityExists(entity: any, entityId: string, entityType: string = 'record'): void {
    if (!entity) {
      throw new NotFoundException(`${entityType} with ID ${entityId} not found`);
    }
  }

  static ensureAuthorized(condition: boolean, message: string = 'You are not authorized to perform this action'): void {
    if (!condition) {
      this.logger.warn(`Unauthorized access attempt detected`);
      throw new UnauthorizedException(message);
    }
  }

  static ensureAccessGranted(condition: boolean, message: string = 'You do not have permission to access this resource'): void {
    if (!condition) {
      this.logger.warn(`Forbidden access attempt detected`);
      throw new ForbiddenException(message);
    }
  }

  static validateNonEmptyString(field: string, fieldName: string): void {
    if (!field || field.trim() === '') {
      throw new BadRequestException(`${fieldName} is required and cannot be empty`);
    }
  }

  static validatePositiveNumber(value: number, fieldName: string): void {
    if (value == null || value <= 0) {
      throw new BadRequestException(`${fieldName} must be a positive number`);
    }
  }

  static validateArrayNotEmpty(array: any[], fieldName: string): void {
    if (!Array.isArray(array) || array.length === 0) {
      throw new BadRequestException(`${fieldName} must contain at least one item`);
    }
  }
}
