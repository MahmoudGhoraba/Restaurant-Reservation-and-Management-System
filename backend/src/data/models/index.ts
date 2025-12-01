// Import all models to ensure discriminators are registered
// IMPORTANT: Import order matters for discriminators - base model must be imported first
import "./user.schema";
// Discriminators must be imported after the base model
import "./customer.schema";
import "./admin.schema";
import "./staff.schema";
// Import other models as well
import "./table.schema";
import "./menuitem.schema";
import "./reservation.schema";
import "./orderItem.schema";
import "./order.schema";
import "./payments.schema";
import "./feedback.schema";
import "./report.schema";

// Export all models and document types for convenience
export { User, UserSchema } from "./user.schema";
export type { UserDocument } from "./user.schema";
export { UserRole } from "./user.schema";

export { Customer, CustomerSchema } from "./customer.schema";
export type { CustomerDocument } from "./customer.schema";

export { Admin, AdminSchema } from "./admin.schema";
export type { AdminDocument } from "./admin.schema";
export { AdminLevel } from "./admin.schema";

export { Staff, StaffSchema } from "./staff.schema";
export type { StaffDocument } from "./staff.schema";
export { StaffPosition, ShiftTime } from "./staff.schema";

export { Table, TableSchema } from "./table.schema";
export type { TableDocument } from "./table.schema";
export { TableLocation as TableLocationEnum, TableStatus } from "./table.schema";

export { MenuItem, MenuItemSchema } from "./menuitem.schema";
export type { MenuItemDocument } from "./menuitem.schema";
export { MenuCategory } from "./menuitem.schema";

export { Reservation, ReservationSchema } from "./reservation.schema";
export type { ReservationDocument } from "./reservation.schema";
export { BookingStatus } from "./reservation.schema";

export { OrderItem, OrderItemSchema } from "./orderItem.schema";

export { Order, OrderSchema } from "./order.schema";
export type { OrderDocument } from "./order.schema";
export { OrderType, OrderStatus } from "./order.schema";

export { Payment, PaymentSchema } from "./payments.schema";
export type { PaymentDocument } from "./payments.schema";
export { PaymentMethod, PaymentStatus } from "./payments.schema";

export { Feedback, FeedbackSchema } from "./feedback.schema";
export type { FeedbackDocument } from "./feedback.schema";
export { ReferenceType } from "./feedback.schema";

export { Report, ReportSchema } from "./report.schema";
export type { ReportDocument } from "./report.schema";
export { ReportType, ReportStatus } from "./report.schema";

// Discriminators will be registered in the Database module when connection is established

// Export the singleton database service
export { default as Database } from "../../infrastructure/db";

