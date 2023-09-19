import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { UserDto } from './dto/user.dto';
import { ProductDto } from './dto/product.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('user')
  async createUser(@Body() dto: UserDto) {
    return this.appService.createUser(dto);
  }

  @Post('transcode')
  async transcode(@Body() dto: any) {
    return this.appService.transcode(dto);
  }

  @Post('product')
  async createProduct(@Body() dto: ProductDto) {
    return this.appService.createProduct(dto);
  }

  @Post('order')
  async createOrder(@Body() dto: any) {
    return this.appService.createOrder(dto);
  }
}
