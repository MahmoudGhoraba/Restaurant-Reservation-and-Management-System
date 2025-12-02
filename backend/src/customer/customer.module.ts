import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { MenuItemSchema } from '../models/menuitem.schema';
import { OrderSchema } from '../models/order.schema';
import { FeedbackSchema } from '../models/feedback.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'MenuItem', schema: MenuItemSchema },
      { name: 'Order', schema: OrderSchema },
      { name: 'Feedback', schema: FeedbackSchema },
    ]),
    AuthModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
