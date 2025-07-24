/**dependencies */
import { forwardRef, Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { AuthModule } from 'src/authentication/auth/auth.module';
import { UserModel } from './entities';
import { UserController } from './user.controller';
import { UserService } from './user.service';

/**controllers */
/**services */
/**Authentication strategies */
@Module({
  imports: [
     TypegooseModule.forFeature([
      UserModel
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
