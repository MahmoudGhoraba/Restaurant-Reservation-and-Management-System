import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/Application/Modules/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';

describe('Restaurant Management System E2E', () => {
    let app: INestApplication;
    let mongoConnection: mongoose.Connection;

    // Test data storage
    let adminToken: string;
    let customerToken: string;
    let staffToken: string;
    let adminId: string;
    let customerId: string;
    let staffId: string;
    let tableId: string;
    let menuItemId: string;
    let reservationId: string;
    let orderId: string;

    const testDbName = 'restaurant-test-db';
    const mongoUri = `mongodb://localhost:27017/${testDbName}`;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideModule(MongooseModule)
            .useModule(
                MongooseModule.forRoot(mongoUri, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                }),
            )
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true
        }));

        await app.init();
        mongoConnection = mongoose.connection;
    });

    afterAll(async () => {
        // Clean up test database
        if (mongoConnection.db) {
            await mongoConnection.db.dropDatabase();
        }
        await mongoConnection.close();
        await app.close();
    });

    beforeEach(async () => {
        // Clear all collections before each test
        const collections = await mongoConnection.db.collections();
        for (const collection of collections) {
            await collection.deleteMany({});
        }
    });

    describe('Authentication System', () => {
        describe('User Registration', () => {
            it('should register a new customer successfully', async () => {
                const customerData = {
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123',
                    phone: 1234567890,
                    role: 'Customer'
                };

                const response = await request(app.getHttpServer())
                    .post('/auth/register')
                    .send(customerData)
                    .expect(201);

                expect(response.body).toHaveProperty('user');
                expect(response.body).toHaveProperty('token');
                expect(response.body.user.email).toBe(customerData.email);
                expect(response.body.user.role).toBe('Customer');

                customerToken = response.body.token;
                customerId = response.body.user._id;
            });

            it('should register a new admin successfully', async () => {
                const adminData = {
                    name: 'Admin User',
                    email: 'admin@example.com',
                    password: 'admin123',
                    phone: 9876543210,
                    role: 'Admin'
                };

                const response = await request(app.getHttpServer())
                    .post('/auth/register')
                    .send(adminData)
                    .expect(201);

                expect(response.body.user.role).toBe('Admin');
                adminToken = response.body.token;
                adminId = response.body.user._id;
            });

            it('should register a staff member successfully', async () => {
                const staffData = {
                    name: 'Staff Member',
                    email: 'staff@example.com',
                    password: 'staff123',
                    role: 'Staff'
                };

                const response = await request(app.getHttpServer())
                    .post('/auth/register')
                    .send(staffData)
                    .expect(201);

                expect(response.body.user.role).toBe('Staff');
                staffToken = response.body.token;
                staffId = response.body.user._id;
            });

            it('should fail registration with invalid email', async () => {
                const invalidData = {
                    name: 'Test User',
                    email: 'invalid-email',
                    password: 'password123',
                    role: 'Customer'
                };

                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send(invalidData)
                    .expect(400);
            });

            it('should fail registration with short password', async () => {
                const invalidData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: '123',
                    role: 'Customer'
                };

                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send(invalidData)
                    .expect(400);
            });

            it('should fail registration with duplicate email', async () => {
                const userData = {
                    name: 'First User',
                    email: 'duplicate@example.com',
                    password: 'password123',
                    role: 'Customer'
                };

                // First registration should succeed
                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send(userData)
                    .expect(201);

                // Second registration with same email should fail
                const duplicateData = {
                    name: 'Second User',
                    email: 'duplicate@example.com',
                    password: 'password456',
                    role: 'Customer'
                };

                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send(duplicateData)
                    .expect(400);
            });

            it('should fail registration with invalid role', async () => {
                const invalidData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'InvalidRole'
                };

                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send(invalidData)
                    .expect(400);
            });
        });

        describe('User Login', () => {
            beforeEach(async () => {
                // Register test users for login tests
                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send({
                        name: 'Login Test User',
                        email: 'login@example.com',
                        password: 'password123',
                        role: 'Customer'
                    });
            });

            it('should login with valid credentials', async () => {
                const loginData = {
                    email: 'login@example.com',
                    password: 'password123'
                };

                const response = await request(app.getHttpServer())
                    .post('/auth/login')
                    .send(loginData)
                    .expect(201);

                expect(response.body).toHaveProperty('user');
                expect(response.body).toHaveProperty('token');
                expect(response.body.user.email).toBe(loginData.email);
            });

            it('should fail login with invalid email', async () => {
                const loginData = {
                    email: 'nonexistent@example.com',
                    password: 'password123'
                };

                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send(loginData)
                    .expect(401);
            });

            it('should fail login with invalid password', async () => {
                const loginData = {
                    email: 'login@example.com',
                    password: 'wrongpassword'
                };

                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send(loginData)
                    .expect(401);
            });

            it('should fail login with missing credentials', async () => {
                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({ email: 'test@example.com' })
                    .expect(400);

                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({ password: 'password123' })
                    .expect(400);
            });
        });
    });

    describe('Table Management', () => {
        beforeEach(async () => {
            // Setup auth tokens for table tests
            const adminResponse = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Table Admin',
                    email: 'tableadmin@example.com',
                    password: 'admin123',
                    role: 'Admin'
                });
            adminToken = adminResponse.body.token;

            const customerResponse = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Table Customer',
                    email: 'tablecustomer@example.com',
                    password: 'customer123',
                    role: 'Customer'
                });
            customerToken = customerResponse.body.token;
        });

        it('should create a table (Admin only)', async () => {
            const tableData = {
                capacity: 4,
                location: 'Window Side'
            };

            const response = await request(app.getHttpServer())
                .post('/tables')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(tableData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.capacity).toBe(4);
            expect(response.body.data.location).toBe('Window Side');
            tableId = response.body.data._id;
        });

        it('should fail to create table without admin role', async () => {
            const tableData = {
                capacity: 4,
                location: 'Garden'
            };

            await request(app.getHttpServer())
                .post('/tables')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(tableData)
                .expect(403);
        });

        it('should fail to create table without authentication', async () => {
            const tableData = {
                capacity: 4,
                location: 'Patio'
            };

            await request(app.getHttpServer())
                .post('/tables')
                .send(tableData)
                .expect(401);
        });

        it('should get all tables (no auth required)', async () => {
            // First create a table
            await request(app.getHttpServer())
                .post('/tables')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ capacity: 6, location: 'Main Hall' });

            const response = await request(app.getHttpServer())
                .get('/tables')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        it('should get table by ID', async () => {
            // Create a table first
            const createResponse = await request(app.getHttpServer())
                .post('/tables')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ capacity: 2, location: 'Bar Area' });

            const tableId = createResponse.body.data._id;

            const response = await request(app.getHttpServer())
                .get(`/tables/${tableId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(tableId);
        });

        it('should fail to get table with invalid ID', async () => {
            await request(app.getHttpServer())
                .get('/tables/invalid-id')
                .expect(400);
        });

        it('should fail to get non-existent table', async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();

            await request(app.getHttpServer())
                .get(`/tables/${nonExistentId}`)
                .expect(404);
        });

        it('should update table (Admin only)', async () => {
            // Create a table first
            const createResponse = await request(app.getHttpServer())
                .post('/tables')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ capacity: 4, location: 'Old Location' });

            const tableId = createResponse.body.data._id;

            const updateData = {
                capacity: 6,
                location: 'New Location'
            };

            const response = await request(app.getHttpServer())
                .put(`/tables/${tableId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.capacity).toBe(6);
            expect(response.body.data.location).toBe('New Location');
        });

        it('should delete table (Admin only)', async () => {
            // Create a table first
            const createResponse = await request(app.getHttpServer())
                .post('/tables')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ capacity: 4, location: 'To Be Deleted' });

            const tableId = createResponse.body.data._id;

            const response = await request(app.getHttpServer())
                .delete(`/tables/${tableId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify table is deleted
            await request(app.getHttpServer())
                .get(`/tables/${tableId}`)
                .expect(404);
        });
    });

    describe('Menu Item Management', () => {
        beforeEach(async () => {
            // Setup admin token
            const adminResponse = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Menu Admin',
                    email: 'menuadmin@example.com',
                    password: 'admin123',
                    role: 'Admin'
                });
            adminToken = adminResponse.body.token;
        });

        it('should create a menu item (Admin only)', async () => {
            const menuItemData = {
                name: 'Grilled Chicken',
                description: 'Delicious grilled chicken with herbs',
                price: 25.99,
                availability: true,
                category: 'Main Course'
            };

            const response = await request(app.getHttpServer())
                .post('/menuitems')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(menuItemData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(menuItemData.name);
            expect(response.body.data.price).toBe(menuItemData.price);
            menuItemId = response.body.data._id;
        });

        it('should get all menu items', async () => {
            // Create a menu item first
            await request(app.getHttpServer())
                .post('/menuitems')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Test Item',
                    description: 'Test Description',
                    price: 10.99,
                    availability: true,
                    category: 'Appetizer'
                });

            const response = await request(app.getHttpServer())
                .get('/menuitems')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        it('should update menu item (Admin only)', async () => {
            // Create a menu item first
            const createResponse = await request(app.getHttpServer())
                .post('/menuitems')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Original Item',
                    description: 'Original Description',
                    price: 15.99,
                    availability: true,
                    category: 'Main Course'
                });

            const itemId = createResponse.body.data._id;

            const updateData = {
                name: 'Updated Item',
                price: 18.99,
                availability: false
            };

            const response = await request(app.getHttpServer())
                .put(`/menuitems/${itemId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Updated Item');
            expect(response.body.data.price).toBe(18.99);
            expect(response.body.data.availability).toBe(false);
        });

        it('should delete menu item (Admin only)', async () => {
            // Create a menu item first
            const createResponse = await request(app.getHttpServer())
                .post('/menuitems')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Item to Delete',
                    description: 'Will be deleted',
                    price: 12.99,
                    availability: true,
                    category: 'Dessert'
                });

            const itemId = createResponse.body.data._id;

            const response = await request(app.getHttpServer())
                .delete(`/menuitems/${itemId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify item is deleted
            await request(app.getHttpServer())
                .get(`/menuitems/${itemId}`)
                .expect(404);
        });
    });

    describe('Reservation System with Table Availability', () => {
        beforeEach(async () => {
            // Setup users and table
            const adminResponse = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Reservation Admin',
                    email: 'resadmin@example.com',
                    password: 'admin123',
                    role: 'Admin'
                });
            adminToken = adminResponse.body.token;

            const customerResponse = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Reservation Customer',
                    email: 'rescustomer@example.com',
                    password: 'customer123',
                    role: 'Customer'
                });
            customerToken = customerResponse.body.token;
            customerId = customerResponse.body.user._id;

            // Create a table
            const tableResponse = await request(app.getHttpServer())
                .post('/tables')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ capacity: 4, location: 'Main Dining' });
            tableId = tableResponse.body.data._id;
        });

        it('should create a reservation successfully', async () => {
            const reservationData = {
                table: tableId,
                reservationDate: '2025-12-15',
                reservationTime: '19:00',
                numberOfGuests: 3,
                duration: 120
            };

            const response = await request(app.getHttpServer())
                .post('/reservations')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(reservationData)
                .expect(201);

            expect(response.body.status).toBe('success');
            expect(response.body.data.table).toBe(tableId);
            expect(response.body.data.numberOfGuests).toBe(3);
            reservationId = response.body.data._id;
        });

        it('should fail to create overlapping reservation', async () => {
            // Create first reservation
            const firstReservation = {
                table: tableId,
                reservationDate: '2025-12-15',
                reservationTime: '19:00',
                numberOfGuests: 2,
                duration: 120
            };

            await request(app.getHttpServer())
                .post('/reservations')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(firstReservation)
                .expect(201);

            // Try to create overlapping reservation
            const overlappingReservation = {
                table: tableId,
                reservationDate: '2025-12-15',
                reservationTime: '20:00', // Overlaps with first reservation
                numberOfGuests: 2,
                duration: 60
            };

            await request(app.getHttpServer())
                .post('/reservations')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(overlappingReservation)
                .expect(400);
        });

        it('should check table availability correctly', async () => {
            // Create a reservation first
            await request(app.getHttpServer())
                .post('/reservations')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    table: tableId,
                    reservationDate: '2025-12-15',
                    reservationTime: '19:00',
                    numberOfGuests: 2,
                    duration: 120
                });

            // Check availability for conflicting time
            const conflictResponse = await request(app.getHttpServer())
                .get(`/tables/${tableId}/check-availability`)
                .query({
                    date: '2025-12-15',
                    time: '20:00',
                    duration: '60'
                })
                .expect(200);

            expect(conflictResponse.body.available).toBe(false);

            // Check availability for non-conflicting time
            const availableResponse = await request(app.getHttpServer())
                .get(`/tables/${tableId}/check-availability`)
                .query({
                    date: '2025-12-15',
                    time: '22:00',
                    duration: '60'
                })
                .expect(200);

            expect(availableResponse.body.available).toBe(true);
        });

        it('should get available tables for specific time slot', async () => {
            // Create another table
            const table2Response = await request(app.getHttpServer())
                .post('/tables')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ capacity: 6, location: 'Garden Area' });

            // Make first table unavailable
            await request(app.getHttpServer())
                .post('/reservations')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    table: tableId,
                    reservationDate: '2025-12-15',
                    reservationTime: '19:00',
                    numberOfGuests: 2,
                    duration: 120
                });

            // Check available tables
            const response = await request(app.getHttpServer())
                .get('/tables/available')
                .query({
                    date: '2025-12-15',
                    time: '19:30',
                    duration: '60'
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(1); // Only second table should be available
            expect(response.body.data[0]._id).toBe(table2Response.body.data._id);
        });

        it('should update reservation successfully', async () => {
            // Create reservation first
            const createResponse = await request(app.getHttpServer())
                .post('/reservations')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    table: tableId,
                    reservationDate: '2025-12-15',
                    reservationTime: '19:00',
                    numberOfGuests: 2,
                    duration: 60
                });

            const reservationId = createResponse.body.data._id;

            const updateData = {
                numberOfGuests: 4,
                reservationTime: '20:00'
            };

            const response = await request(app.getHttpServer())
                .put(`/reservations/${reservationId}`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.numberOfGuests).toBe(4);
            expect(response.body.data.reservationTime).toBe('20:00');
        });

        it('should cancel reservation successfully', async () => {
            // Create reservation first
            const createResponse = await request(app.getHttpServer())
                .post('/reservations')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    table: tableId,
                    reservationDate: '2025-12-15',
                    reservationTime: '19:00',
                    numberOfGuests: 2,
                    duration: 60
                });

            const reservationId = createResponse.body.data._id;

            const response = await request(app.getHttpServer())
                .delete(`/reservations/${reservationId}/cancel`)
                .set('Authorization', `Bearer ${customerToken}`)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.bookingStatus).toBe('canceled');
        });

        it('should validate reservation time format', async () => {
            const invalidTimeReservation = {
                table: tableId,
                reservationDate: '2025-12-15',
                reservationTime: '25:70', // Invalid time
                numberOfGuests: 2
            };

            await request(app.getHttpServer())
                .post('/reservations')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(invalidTimeReservation)
                .expect(400);
        });

        it('should validate reservation date format', async () => {
            const invalidDateReservation = {
                table: tableId,
                reservationDate: 'invalid-date',
                reservationTime: '19:00',
                numberOfGuests: 2
            };

            await request(app.getHttpServer())
                .post('/reservations')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(invalidDateReservation)
                .expect(400);
        });
    });

    describe('Order Management System', () => {
        beforeEach(async () => {
            // Setup users, table, and menu item
            const adminResponse = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Order Admin',
                    email: 'orderadmin@example.com',
                    password: 'admin123',
                    role: 'Admin'
                });
            adminToken = adminResponse.body.token;

            const customerResponse = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Order Customer',
                    email: 'ordercustomer@example.com',
                    password: 'customer123',
                    role: 'Customer'
                });
            customerToken = customerResponse.body.token;
            customerId = customerResponse.body.user._id;

            // Create table and menu item
            const tableResponse = await request(app.getHttpServer())
                .post('/tables')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ capacity: 4, location: 'Order Table' });
            tableId = tableResponse.body.data._id;

            const menuResponse = await request(app.getHttpServer())
                .post('/menuitems')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Order Test Item',
                    description: 'Test menu item for orders',
                    price: 15.99,
                    availability: true,
                    category: 'Main Course'
                });
            menuItemId = menuResponse.body.data._id;
        });

        it('should create an order successfully', async () => {
            const orderData = {
                orderType: 'DineIn',
                table: tableId,
                totalAmount: 31.98,
                paymentType: 'Card',
                items: [
                    {
                        menuItem: menuItemId,
                        name: 'Order Test Item',
                        quantity: 2,
                        price: 15.99,
                        subTotal: 31.98
                    }
                ]
            };

            const response = await request(app.getHttpServer())
                .post('/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(orderData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.orderType).toBe('DineIn');
            expect(response.body.data.totalAmount).toBe(31.98);
            expect(response.body.data.items).toHaveLength(1);
            orderId = response.body.data._id;
        });

        it('should get all orders', async () => {
            // Create an order first
            await request(app.getHttpServer())
                .post('/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    orderType: 'Takeaway',
                    totalAmount: 15.99,
                    paymentType: 'Cash',
                    items: [
                        {
                            menuItem: menuItemId,
                            name: 'Order Test Item',
                            quantity: 1,
                            price: 15.99,
                            subTotal: 15.99
                        }
                    ]
                });

            const response = await request(app.getHttpServer())
                .get('/orders')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        it('should update order status', async () => {
            // Create an order first (use Takeaway to avoid reservation requirements)
            const createResponse = await request(app.getHttpServer())
                .post('/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    orderType: 'Takeaway',
                    totalAmount: 15.99,
                    paymentType: 'Card',
                    items: [
                        {
                            menuItem: menuItemId,
                            name: 'Order Test Item',
                            quantity: 1,
                            price: 15.99,
                            subTotal: 15.99
                        }
                    ]
                })
                .expect(201);

            expect(createResponse.body.success).toBe(true);
            expect(createResponse.body.data._id).toBeDefined();
            const orderId = createResponse.body.data._id;

            const response = await request(app.getHttpServer())
                .put(`/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'Preparing' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('Preparing');
        });
    });

    describe('Edge Cases and Security', () => {
        beforeEach(async () => {
            // Setup tokens
            const adminResponse = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Security Admin',
                    email: 'secadmin@example.com',
                    password: 'admin123',
                    role: 'Admin'
                });
            adminToken = adminResponse.body.token;

            const customerResponse = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Security Customer',
                    email: 'seccustomer@example.com',
                    password: 'customer123',
                    role: 'Customer'
                });
            customerToken = customerResponse.body.token;
        });

        it('should handle invalid MongoDB ObjectId gracefully', async () => {
            const invalidIds = ['invalid', '123', 'not-an-objectid'];

            for (const id of invalidIds) {
                await request(app.getHttpServer())
                    .get(`/tables/${id}`)
                    .expect(400);

                await request(app.getHttpServer())
                    .get(`/menuitems/${id}`)
                    .expect(400);

                await request(app.getHttpServer())
                    .get(`/reservations/${id}`)
                    .expect(400);
            }

            // Handle empty string case separately - these actually route to the collection endpoints
            await request(app.getHttpServer())
                .get('/tables/')
                .expect(200); // Routes to getAllTables

            await request(app.getHttpServer())
                .get('/menuitems/')
                .expect(200); // Routes to getAllMenuItems (may return 404 if empty)

            // For reservations, it may require auth
            await request(app.getHttpServer())
                .get('/reservations/')
                .expect(200); // Routes to getAllReservations
        });

        it('should prevent unauthorized access to admin routes', async () => {
            const restrictedRoutes = [
                { method: 'post', path: '/tables', data: { capacity: 4, location: 'Test' } },
                { method: 'post', path: '/menuitems', data: { name: 'Test', description: 'Test', price: 10, availability: true, category: 'Test' } },
                { method: 'put', path: '/reservations/507f1f77bcf86cd799439011/confirm', data: {} }
            ];

            for (const route of restrictedRoutes) {
                const request_method = route.method === 'post' ? request(app.getHttpServer()).post(route.path) :
                    route.method === 'put' ? request(app.getHttpServer()).put(route.path) :
                        request(app.getHttpServer()).delete(route.path);

                // Test without token
                await request_method
                    .send(route.data)
                    .expect(401);

                // Test with customer token (should be 403 for admin routes)
                await request_method
                    .set('Authorization', `Bearer ${customerToken}`)
                    .send(route.data)
                    .expect(403);
            }
        });

        it('should handle malformed JSON requests', async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .set('Content-Type', 'application/json')
                .send('{ invalid json }')
                .expect(400);
        });

        it('should validate required fields in requests', async () => {
            // Test missing required fields for reservation
            const incompleteReservation = {
                table: 'someId',
                // Missing reservationDate, reservationTime, numberOfGuests
            };

            await request(app.getHttpServer())
                .post('/reservations')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(incompleteReservation)
                .expect(400);

            // Test missing required fields for menu item
            const incompleteMenuItem = {
                name: 'Test Item',
                // Missing description, price, availability, category
            };

            await request(app.getHttpServer())
                .post('/menuitems')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(incompleteMenuItem)
                .expect(400);
        });

        it('should handle concurrent reservation attempts', async () => {
            // Create a table
            const tableResponse = await request(app.getHttpServer())
                .post('/tables')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ capacity: 4, location: 'Concurrent Test' });

            const testTableId = tableResponse.body.data._id;

            const reservationData = {
                table: testTableId,
                reservationDate: '2025-12-20',
                reservationTime: '19:00',
                numberOfGuests: 2,
                duration: 120
            };

            // Try to create multiple reservations simultaneously
            const promises = Array(3).fill(null).map(() =>
                request(app.getHttpServer())
                    .post('/reservations')
                    .set('Authorization', `Bearer ${customerToken}`)
                    .send(reservationData)
            );

            const results = await Promise.allSettled(promises);

            // Only one should succeed (201), others should fail (400)
            const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 201);
            const failed = results.filter(r => r.status === 'fulfilled' && r.value.status === 400);

            expect(successful.length).toBe(1);
            expect(failed.length).toBe(2);
        });

        it('should handle cross-midnight reservations', async () => {
            // Create a table
            const tableResponse = await request(app.getHttpServer())
                .post('/tables')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ capacity: 4, location: 'Late Night Table' });

            const testTableId = tableResponse.body.data._id;

            // Create late night reservation (crosses midnight)
            const lateReservation = {
                table: testTableId,
                reservationDate: '2025-12-15',
                reservationTime: '23:30',
                numberOfGuests: 2,
                duration: 120 // 2 hours, goes into next day
            };

            const response = await request(app.getHttpServer())
                .post('/reservations')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(lateReservation)
                .expect(201);

            expect(response.body.status).toBe('success');

            // Try to create overlapping reservation next day
            const nextDayReservation = {
                table: testTableId,
                reservationDate: '2025-12-16',
                reservationTime: '00:30',
                numberOfGuests: 2,
                duration: 60
            };

            await request(app.getHttpServer())
                .post('/reservations')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(nextDayReservation)
                .expect(400); // Should conflict with previous reservation
        });

        it('should validate business constraints', async () => {
            // Test invalid number of guests (negative, zero)
            const invalidGuestNumbers = [-1, 0, 1000];

            const tableResponse = await request(app.getHttpServer())
                .post('/tables')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ capacity: 4, location: 'Validation Test' });

            const testTableId = tableResponse.body.data._id;

            for (const guests of invalidGuestNumbers) {
                await request(app.getHttpServer())
                    .post('/reservations')
                    .set('Authorization', `Bearer ${customerToken}`)
                    .send({
                        table: testTableId,
                        reservationDate: '2025-12-15',
                        reservationTime: '19:00',
                        numberOfGuests: guests,
                        duration: 60
                    })
                    .expect(400);
            }

            // Test invalid duration (less than minimum, more than maximum)
            const invalidDurations = [15, 29, 500]; // Below 30min, above 480min

            for (const duration of invalidDurations) {
                await request(app.getHttpServer())
                    .post('/reservations')
                    .set('Authorization', `Bearer ${customerToken}`)
                    .send({
                        table: testTableId,
                        reservationDate: '2025-12-15',
                        reservationTime: '19:00',
                        numberOfGuests: 2,
                        duration: duration
                    })
                    .expect(400);
            }
        });

        it('should handle non-existent resource references', async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();

            // Test reservation with non-existent table
            await request(app.getHttpServer())
                .post('/reservations')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    table: nonExistentId,
                    reservationDate: '2025-12-15',
                    reservationTime: '19:00',
                    numberOfGuests: 2,
                    duration: 60
                })
                .expect(400);

            // Test order with non-existent menu item
            await request(app.getHttpServer())
                .post('/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    orderType: 'Takeaway',
                    totalAmount: 15.99,
                    paymentType: 'Cash',
                    items: [
                        {
                            menuItem: nonExistentId,
                            name: 'Non-existent Item',
                            quantity: 1,
                            price: 15.99,
                            subTotal: 15.99
                        }
                    ]
                })
                .expect(400);
        });
    });

    describe('Performance and Load Testing', () => {
        beforeEach(async () => {
            const adminResponse = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Load Admin',
                    email: 'loadadmin@example.com',
                    password: 'admin123',
                    role: 'Admin'
                });
            adminToken = adminResponse.body.token;
        });

        it('should handle multiple table creations efficiently', async () => {
            const startTime = Date.now();
            const tablePromises = [];

            for (let i = 0; i < 20; i++) {
                tablePromises.push(
                    request(app.getHttpServer())
                        .post('/tables')
                        .set('Authorization', `Bearer ${adminToken}`)
                        .send({
                            capacity: Math.floor(Math.random() * 8) + 2,
                            location: `Table Area ${i}`
                        })
                );
            }

            const results = await Promise.all(tablePromises);
            const endTime = Date.now();

            // All requests should succeed
            results.forEach(result => {
                expect(result.status).toBe(201);
            });

            // Should complete within reasonable time (5 seconds)
            expect(endTime - startTime).toBeLessThan(5000);

            // Verify all tables were created
            const tablesResponse = await request(app.getHttpServer())
                .get('/tables')
                .expect(200);

            expect(tablesResponse.body.data).toHaveLength(20);
        });

        it('should handle large dataset queries efficiently', async () => {
            // Create multiple tables, menu items, and reservations
            const setupPromises = [];

            // Create 25 tables (reduced for stability)
            for (let i = 0; i < 25; i++) {
                setupPromises.push(
                    request(app.getHttpServer())
                        .post('/tables')
                        .set('Authorization', `Bearer ${adminToken}`)
                        .send({
                            capacity: Math.floor(Math.random() * 8) + 2,
                            location: `Load Test Table ${i}`
                        })
                );
            }

            // Create 25 menu items (reduced for stability)
            for (let i = 0; i < 25; i++) {
                setupPromises.push(
                    request(app.getHttpServer())
                        .post('/menuitems')
                        .set('Authorization', `Bearer ${adminToken}`)
                        .send({
                            name: `Load Test Item ${i}`,
                            description: `Description for item ${i}`,
                            price: Math.random() * 50 + 10,
                            availability: Math.random() > 0.2,
                            category: ['Appetizer', 'Main Course', 'Dessert', 'Beverage'][Math.floor(Math.random() * 4)]
                        })
                );
            }

            await Promise.all(setupPromises);

            // Add a small delay to ensure database operations complete
            await new Promise(resolve => setTimeout(resolve, 100));

            // Test query performance
            const startTime = Date.now();

            const queryPromises = [
                request(app.getHttpServer()).get('/tables'),
                request(app.getHttpServer()).get('/menuitems'),
                request(app.getHttpServer()).get('/tables/available').query({
                    date: '2025-12-15',
                    time: '19:00',
                    duration: 60
                })
            ];

            const results = await Promise.all(queryPromises);
            const endTime = Date.now();

            // All queries should succeed
            results.forEach((result, index) => {
                if (result.status !== 200) {
                    console.log(`Query ${index} failed with status ${result.status}:`, result.body);
                }
                expect(result.status).toBe(200);
            });

            // Queries should complete within reasonable time (increased timeout)
            expect(endTime - startTime).toBeLessThan(3000);
        }, 30000);
    });

    describe('Integration Flow Tests', () => {
        it('should complete full restaurant workflow', async () => {
            // 1. Register admin and customer
            const adminResponse = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Integration Admin',
                    email: 'intadmin@example.com',
                    password: 'admin123',
                    role: 'Admin'
                })
                .expect(201);

            const customerResponse = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Integration Customer',
                    email: 'intcustomer@example.com',
                    password: 'customer123',
                    role: 'Customer'
                })
                .expect(201);

            const adminToken = adminResponse.body.token;
            const customerToken = customerResponse.body.token;

            // 2. Admin creates tables and menu items
            const tableResponse = await request(app.getHttpServer())
                .post('/tables')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ capacity: 4, location: 'Integration Table' })
                .expect(201);

            const menuResponse = await request(app.getHttpServer())
                .post('/menuitems')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Integration Dish',
                    description: 'Test dish for integration',
                    price: 25.99,
                    availability: true,
                    category: 'Main Course'
                })
                .expect(201);

            const tableId = tableResponse.body.data._id;
            const menuItemId = menuResponse.body.data._id;

            // 3. Customer makes reservation
            const reservationResponse = await request(app.getHttpServer())
                .post('/reservations')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    table: tableId,
                    reservationDate: '2025-12-15',
                    reservationTime: '19:00',
                    numberOfGuests: 3,
                    duration: 120
                })
                .expect(201);

            const reservationId = reservationResponse.body.data._id;

            // 4. Admin confirms reservation
            await request(app.getHttpServer())
                .put(`/reservations/${reservationId}/confirm`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            // 5. Customer places order
            const orderResponse = await request(app.getHttpServer())
                .post('/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    orderType: 'DineIn',
                    table: tableId,
                    reservation: reservationId,
                    totalAmount: 51.98,
                    paymentType: 'Card',
                    items: [
                        {
                            menuItem: menuItemId,
                            name: 'Integration Dish',
                            quantity: 2,
                            price: 25.99,
                            subTotal: 51.98
                        }
                    ]
                })
                .expect(201);

            const orderId = orderResponse.body.data._id;

            // 6. Admin updates order status through workflow
            await request(app.getHttpServer())
                .put(`/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'Preparing' })
                .expect(200);

            await request(app.getHttpServer())
                .put(`/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'Served' })
                .expect(200);

            await request(app.getHttpServer())
                .put(`/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'Completed' })
                .expect(200);

            // 7. Verify final state
            const finalOrderResponse = await request(app.getHttpServer())
                .get(`/orders/${orderId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(finalOrderResponse.body.data.status).toBe('Completed');

            // 8. Verify table becomes available after reservation period
            const availabilityResponse = await request(app.getHttpServer())
                .get(`/tables/${tableId}/check-availability`)
                .query({
                    date: '2025-12-15',
                    time: '22:00', // After reservation ends
                    duration: '60'
                })
                .expect(200);

            expect(availabilityResponse.body.available).toBe(true);
        });
    });
});