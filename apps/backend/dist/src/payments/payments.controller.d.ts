import { PaymentsService } from './services/payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createOrder(req: any, createOrderDto: CreateOrderDto): Promise<{
        orderId: string;
        razorpayOrderId: string;
        amount: number;
        currency: string;
        keyId: any;
    }>;
    handleWebhook(payload: any, signature: string): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    getOrderStatus(orderId: string): Promise<{
        id: string;
        createdAt: Date;
        courseId: string;
        userId: string;
        amount: number;
        status: string;
        currency: string;
        razorpayOrderId: string | null;
        razorpayPaymentId: string | null;
        paymentMethod: string | null;
    }>;
}
