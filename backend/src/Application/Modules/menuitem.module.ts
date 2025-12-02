import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItemController } from '../Application/Controllers/menuitem.controller';
import { MenuItemService } from './menuitem.service';
import { MenuItemSchema } from '../models/menuitem.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'MenuItem', schema: MenuItemSchema },
    ]),
    AuthModule,
  ],
  controllers: [MenuItemController],
  providers: [MenuItemService],
  exports: [MenuItemService],
})
export class MenuItemModule { }
