import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import User from '../src/Data/models/user.schema';
import Admin from '../src/Data/models/admin.schema';
import Customer from '../src/Data/models/customer.schema';
import Staff from '../src/Data/models/staff.schema';
import MenuItem from '../src/Data/models/menuitem.schema';
import { Table } from '../src/Data/models/table.schema';
import Reservation from '../src/Data/models/reservation.schema';
import Order from '../src/Data/models/order.schema';
import Payment from '../src/Data/models/payments.schema';

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-management';

async function hash(password: string) {
    return await bcrypt.hash(password, 10);
}

async function main() {
    console.log('Connecting to', MONGO);
    await mongoose.connect(MONGO);

    console.log('Clearing collections...');
    await Promise.all([
        User.deleteMany({}),
        MenuItem.deleteMany({}),
        Table.deleteMany({}),
        Reservation.deleteMany({}),
        Order.deleteMany({}),
        Payment.deleteMany({}),
    ]);

    console.log('Creating users...');
    const admin = await Admin.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: await hash('password123'),
        role: 'Admin',
        adminLevel: 'Main Admin',
    });

    const staff = await Staff.create({
        name: 'Alice Staff',
        email: 'alice.staff@example.com',
        password: await hash('password123'),
        role: 'Staff',
        position: 'Waiter',
        shiftTime: '09:00-17:00',
    });

    const customer1 = await Customer.create({
        name: 'Bob Customer',
        email: 'bob.customer@example.com',
        password: await hash('password123'),
        role: 'Customer',
        reservationCount: 0,
    });

    const customer2 = await Customer.create({
        name: 'Sara Customer',
        email: 'sara.customer@example.com',
        password: await hash('password123'),
        role: 'Customer',
        reservationCount: 0,
    });

    console.log('Creating menu items...');
    const items = await MenuItem.insertMany([
        { name: 'Margherita Pizza', description: 'Classic cheese & tomato', price: 8.5, availability: true, category: 'Pizza' },
        { name: 'Caesar Salad', description: 'Crisp romaine with dressing', price: 6.0, availability: true, category: 'Salad' },
        { name: 'Grilled Chicken', description: 'Served with veggies', price: 10.0, availability: true, category: 'Mains' },
        { name: 'Spaghetti Bolognese', description: 'Rich meat sauce', price: 9.0, availability: true, category: 'Pasta' },
        { name: 'Chocolate Cake', description: 'Decadent dessert', price: 4.5, availability: true, category: 'Dessert' },
    ]);

    console.log('Creating tables...');
    const tables = await Table.insertMany([
        { capacity: 2, location: 'Window' },
        { capacity: 4, location: 'Center' },
        { capacity: 6, location: 'Patio' },
        { capacity: 4, location: 'Corner' },
        { capacity: 8, location: 'Private' },
    ]);

    console.log('Creating reservation and order...');
    const reservation = await Reservation.create({
        customer: customer1._id,
        table: tables[1]._id,
        reservationDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        reservationTime: '19:00',
        duration: 90,
        numberOfGuests: 4,
        bookingStatus: 'confirmed',
    });

    const orderItems = [
        { menuItem: items[0]._id, name: items[0].name, quantity: 2, price: items[0].price, subTotal: items[0].price * 2 },
        { menuItem: items[4]._id, name: items[4].name, quantity: 1, price: items[4].price, subTotal: items[4].price },
    ];

    const total = orderItems.reduce((s, it) => s + it.subTotal, 0);

    const order = await Order.create({
        customer: customer1._id,
        staff: staff._id,
        orderType: 'DineIn',
        reservation: reservation._id,
        table: tables[1]._id,
        orderDate: new Date(),
        status: 'Pending',
        totalAmount: total,
        paymentType: 'Card',
        items: orderItems,
    });

    const payment = await Payment.create({
        order: order._id,
        amount: total,
        paymentMethod: 'Card',
        status: 'Paid',
        transactionId: `txn_${Date.now()}`,
    });

    // link payment to order
    await Order.findByIdAndUpdate(order._id, { payment: payment._id });

    console.log('Seed complete:');
    console.log({ admin: admin.email, staff: staff.email, customer1: customer1.email, customer2: customer2.email });

    await mongoose.disconnect();
    console.log('Disconnected.');
}

main().catch((err) => {
    console.error('Seed error', err);
    process.exit(1);
});
