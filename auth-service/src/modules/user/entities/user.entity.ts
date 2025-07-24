// user.model.ts
import { Prop } from '@typegoose/typegoose';
import { UserTypesEnum } from 'src/authentication/common/enum';

export class UserModel {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  mobile?: string;

  @Prop()
  hashedRt?: string;

  @Prop({ default: UserTypesEnum.USER })
  userType: string;

  @Prop()
  gender?: string;

  @Prop()
  maritalStatus?: string;

  @Prop()
  birthDate?: Date;

  @Prop()
  address?: string;
  
  @Prop({ default: Date.now })
  createdAt?: Date;
}

