import { UserEntity } from '@domain/entities/user.entity';

export interface UserEntityRepository {
  create(user: UserEntity): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  update(id: string, updateData: Partial<UserEntity>): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}
