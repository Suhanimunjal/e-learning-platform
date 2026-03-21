import { Controller, Post, Get, Body, Param, Headers, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.paymentsService.createOrder(
      createOrderDto.courseId,
      createOrderDto.amount,
      req.user,
    );
  }

  @Post('webhook')
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(payload, signature);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  getOrderStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.getOrderStatus(orderId);
  }
}
