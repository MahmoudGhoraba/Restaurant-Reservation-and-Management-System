import mongoose from 'mongoose';
import User from '../src/Data/models/user.schema';
import MenuItem from '../src/Data/models/menuitem.schema';
import { Table } from '../src/Data/models/table.schema';
import Reservation from '../src/Data/models/reservation.schema';
import Order from '../src/Data/models/order.schema';
import Payment from '../src/Data/models/payments.schema';

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-management';

async function main() {
  await mongoose.connect(MONGO);
  console.log('Connected to', MONGO);

  const [usersCount, menuCount, tableCount, resCount, orderCount, paymentCount] = await Promise.all([
    User.countDocuments(),
    MenuItem.countDocuments(),
    Table.countDocuments(),
    Reservation.countDocuments(),
    Order.countDocuments(),
    Payment.countDocuments(),
  ]);

  console.log('Counts:');
  console.log({ usersCount, menuCount, tableCount, resCount, orderCount, paymentCount });

  const user = await User.findOne().lean();
  const menu = await MenuItem.findOne().lean();
  const table = await Table.findOne().lean();
  const reservation = await Reservation.findOne().lean();
  const order = await Order.findOne().lean();
  const payment = await Payment.findOne().lean();

  console.log('\nSample documents:');
  console.log('user:', user);
  console.log('menu:', menu);
  console.log('table:', table);
  console.log('reservation:', reservation);
  console.log('order:', order);
  console.log('payment:', payment);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
