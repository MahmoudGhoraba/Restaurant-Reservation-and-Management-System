import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItemController } from '../controllers/menuitem.controller';
import { MenuItemService } from '../services/menuitem.service';
import { MenuItem, MenuItemSchema } from '../../data/models/menuitem.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
  ],
  controllers: [MenuItemController],
  providers: [MenuItemService],
  exports: [MenuItemService, MongooseModule],
})
export class MenuItemsModule {}
