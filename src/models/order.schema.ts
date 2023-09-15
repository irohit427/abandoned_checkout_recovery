import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { User } from './user.schema';
import { Product } from './product.schema';

export type OrderDocument = Order & Document;

@Schema({ versionKey: false })
export class Order {
  @Prop()
  isPaid: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId;

  @Prop({
    type: [
      { quantity: { type: Number }, product: { type: SchemaTypes.ObjectId } },
    ],
  })
  products: { quantity: number; product: Product }[];

  @Prop({ default: 0 })
  retry: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
