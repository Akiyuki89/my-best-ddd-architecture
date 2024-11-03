import { Injectable } from '@nestjs/common';
import { EncryptHelperService } from '@common/helpers/functions/encrypt.helper';
import { UserEntity } from '@domain/entities/user.entity';
import { UserEntityRepository } from '@domain/repositories/user.repository';
import { IUpdateUserData } from '@shared/interfaces/update-user.interface';
import { ErrorHandlingUtil } from '@shared/utils/error.util';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';

@Injectable()
export class UserEntityPersistence implements UserEntityRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionHelperService: EncryptHelperService,
  ) {}

  private toUserEntity(user: any): UserEntity {
    return new UserEntity(user.userId, user.name, user.email, user.password, user.role, user.verified);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    if (!user.getUserName() || !user.getUserEmail() || !user.getUserPassword()) {
      ErrorHandlingUtil.validateUserFields(user);
    }

    user.encryptPassword(this.encryptionHelperService);

    try {
      const newUser = await this.prisma.user.create({
        data: {
          userId: user.getUserId(),
          name: user.getUserName(),
          email: user.getUserEmail(),
          password: user.getUserPassword(),
          role: user.getUserRole(),
          verified: user.getUserVerified(),
        },
      });

      return new UserEntity(newUser.userId, newUser.name, newUser.email, newUser.password, newUser.role, newUser.verified);
    } catch (error) {
      ErrorHandlingUtil.handlePrismaError(error);
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    try {
      const user = await this.prisma.user.findUnique({ where: { userId: id } });

      return user ? this.toUserEntity(user) : null;
    } catch (error) {
      ErrorHandlingUtil.handlePrismaError(error);
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email: email } });

      return user ? this.toUserEntity(user) : null;
    } catch (error) {
      ErrorHandlingUtil.handlePrismaError(error);
    }
  }

  async findAll(): Promise<UserEntity[]> {
    try {
      const users = await this.prisma.user.findMany();

      return users.map(user => this.toUserEntity(user));
    } catch (error) {
      ErrorHandlingUtil.handlePrismaError(error);
    }
  }

  async update(id: string, updateData: Partial<UserEntity>): Promise<UserEntity> {
    // Verificação inicial: se não há dados para atualizar, lança um erro usando o utilitário
    ErrorHandlingUtil.ensureHasUpdateFields(updateData);

    const existingUser = await this.prisma.user.findUnique({ where: { userId: id } });
    ErrorHandlingUtil.ensureEntityExists(existingUser, id, 'User');

    const dataToUpdate: Partial<IUpdateUserData> = {
      name: updateData.getUserName?.(),
      email: updateData.getUserEmail?.(),
      password: updateData.getUserPassword ? this.encryptionHelperService.encryptPassword(updateData.getUserPassword()) : undefined,
      role: updateData.getUserRole?.(),
    };

    const cleanedDataToUpdate = Object.entries(dataToUpdate).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key as keyof IUpdateUserData] = value;
      }
      return acc;
    }, {} as Partial<IUpdateUserData>);

    try {
      const updatedUser = await this.prisma.user.update({
        where: { userId: id },
        data: cleanedDataToUpdate,
      });

      return new UserEntity(updatedUser.userId, updatedUser.name, updatedUser.email, updatedUser.password, updatedUser.role, updatedUser.verified);
    } catch (error) {
      ErrorHandlingUtil.handlePrismaError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existingUser = await this.prisma.user.findUnique({ where: { userId: id } });

      ErrorHandlingUtil.ensureEntityExists(existingUser, id, 'User');

      await this.prisma.user.delete({ where: { userId: id } });
    } catch (error) {
      ErrorHandlingUtil.handlePrismaError(error);
    }
  }
}
