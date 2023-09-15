import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { TRANSCODE_QUEUE } from './constants';
import { UserDto } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './models/user.schema';
import { Product, ProductDocument } from './models/product.schema';
import { ProductDto } from './dto/product.dto';
import { Order, OrderDocument } from './models/order.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectQueue(TRANSCODE_QUEUE) private readonly transcodeQueue: Queue,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async transcode(body: any) {
    const { event, orderId } = body;
    if (event === 'checkout.failure') {
      await this.transcodeQueue.add(
        {
          orderId,
        },
        {
          delay: 3 * 1000,
        },
      );
    } else {
      return await this.orderModel
        .findByIdAndUpdate(orderId, { isPaid: true })
        .exec();
    }
  }

  async createUser(body: UserDto) {
    return await new this.userModel({
      ...body,
    }).save();
  }

  async createProduct(body: ProductDto) {
    return await new this.productModel({
      ...body,
    }).save();
  }

  async createOrder(body: any) {
    console.log('Order: ', body);
    return await new this.orderModel({
      ...body,
    }).save();
  }
}
