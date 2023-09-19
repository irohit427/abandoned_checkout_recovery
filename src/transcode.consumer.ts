import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { TRANSCODE_QUEUE } from './constants';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './models/user.schema';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './models/order.schema';
import { Product, ProductDocument } from './models/product.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
@Processor(TRANSCODE_QUEUE)
export class TranscodeConsumer {
  constructor(
    @InjectQueue(TRANSCODE_QUEUE) private readonly transcodeQueue: Queue,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendMail(order, delay: number | null) {
    const orderId = order._id;
    const productIds = order.products.map((product) => product.product);
    const user = await this.userModel.findById(order.user);
    const products = await this.productModel.find().where('_id').in(productIds);
    const productsName = products.map((product) => product.name).join(', ');

    await this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get('MAIL_USER'),
      subject: 'Complete Checkout',
      text: `Hi ${user.name}, Please Complete Checkout for ${productsName}`,
    });
    await this.orderModel
      .findByIdAndUpdate(orderId, { retry: order.retry + 1 })
      .exec();

    if (delay) {
      await this.transcodeQueue.add(
        {
          orderId,
        },
        {
          delay: delay * 1000,
        },
      );
    }
  }

  @Process()
  async transcode(job: Job<unknown>) {
    const data: any = job.data;
    const { orderId } = data;
    const order = await this.orderModel.findById(orderId);

    if (!order.isPaid) {
      if (order.retry == 0) {
        this.sendMail(order, 86400);
      }
      if (order.retry == 1) {
        this.sendMail(order, 2 * 86400);
      } else {
        this.sendMail(order, null);
      }
    }
  }
}
