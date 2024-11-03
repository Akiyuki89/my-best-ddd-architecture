import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConflictException, NotFoundException, InternalServerErrorException, BadRequestException, ForbiddenException, UnauthorizedException, Logger } from '@nestjs/common';

export class ErrorHandlingUtil {
  private static readonly logger = new Logger(ErrorHandlingUtil.name);

  static handlePrismaError(error: any, action: string = 'database operation'): never {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          // Erro de violação de unicidade
          this.logger.warn(`Conflict error on unique field during ${action}`);
          throw new ConflictException(`A record with a unique field already exists.`);

        case 'P2025':
          // Erro de registro não encontrado
          this.logger.warn(`Record not found error during ${action}`);
          throw new NotFoundException(`The requested record was not found.`);

        case 'P2016':
          // Erro de dados inválidos
          this.logger.warn(`Invalid data error during ${action}`);
          throw new BadRequestException(`Invalid data provided for the requested ${action}.`);

        case 'P2003':
          this.logger.warn(`Foreign key constraint failed during ${action}`);
          throw new BadRequestException(`Invalid foreign key reference in the requested ${action}.`);
          
        default:
          // Erro inesperado do Prisma
          this.logger.error(`Unexpected Prisma error during ${action}`, error);
          throw new InternalServerErrorException(`An unexpected error occurred with the database during ${action}.`);
      }
    } else {
      this.logger.error(`Non-Prisma error during ${action}`, error);
      throw error; // Lança o erro não relacionado ao Prisma
    }
  }

  static handleEmailError(error: any, action: string = 'sending email'): never {
    this.logger.error(`Error ${action}`, error.stack || error.message);
    throw new InternalServerErrorException(`Failed to ${action}. Please try again later.`);
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
