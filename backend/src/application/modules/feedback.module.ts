import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedbackController } from '../controllers/feedback.controller';
import { FeedbackService } from '../services/feedback.service';
import { Feedback, FeedbackSchema } from '../../data/models/feedback.schema';
import { Order, OrderSchema } from '../../data/models/order.schema';
import { User, UserSchema } from '../../data/models/user.schema';
import { OrdersModule } from './orders.module';
import { UsersModule } from './users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Feedback.name, schema: FeedbackSchema },
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => OrdersModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService, MongooseModule],
})
export class FeedbackModule {}
