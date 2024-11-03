import { Inject, Injectable, Logger } from '@nestjs/common';
import { UserEntity } from '@domain/entities/user.entity';
import { UserEntityRepository } from '@domain/repositories/user.repository';
import { USER_ENTITY_REPOSITORY } from '@domain/tokens/inject.token';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(USER_ENTITY_REPOSITORY)
    private readonly userEntityRepository: UserEntityRepository,
  ) {}

  async saveUser(user: UserEntity): Promise<UserEntity> {
    try {
      return await this.userEntityRepository.create(user);
    } catch (error) {
      this.logger.error('Error saving user', error);
      throw error;
    }
  }
}
