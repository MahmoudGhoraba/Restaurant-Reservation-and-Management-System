import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItemController } from 'src/Application/Controllers/menuitem.controller';
import { MenuItemService } from 'src/Application/Services/menuitem.service';
import { MenuItemSchema } from 'src/Data/models/menuitem.schema';
import { AuthModule } from 'src/Application/Modules/auth.module';

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
