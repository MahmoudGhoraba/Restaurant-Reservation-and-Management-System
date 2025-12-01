import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { User, UserSchema } from '../../data/models/user.schema';
import { Customer, CustomerSchema } from '../../data/models/customer.schema';
import { Admin, AdminSchema } from '../../data/models/admin.schema';
import { Staff, StaffSchema } from '../../data/models/staff.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Staff.name, schema: StaffSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, MongooseModule],
})
export class UsersModule {}
