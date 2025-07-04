import { UserEntity } from 'modules/users/entities/users.entity';

export interface VerifyCodeStrategy {
  execute(data: UserEntity): Promise<any>;
}
