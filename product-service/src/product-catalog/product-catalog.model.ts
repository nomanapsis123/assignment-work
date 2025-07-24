import { prop } from '@typegoose/typegoose';
import { Types } from 'mongoose';

export class ProductCatalog {
  @prop({ required: true })
  name: string; // Product name

  @prop({ required: true })
  price: number;

  @prop()
  description?: string;

  @prop({ default: 0 })
  stock: number;

  @prop()
  category?: string;

  // Owner of this product (User)
  @prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @prop({ default: Date.now })
  createdAt?: Date;
}
