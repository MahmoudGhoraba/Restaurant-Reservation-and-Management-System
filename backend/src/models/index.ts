// Import all models to ensure discriminators are registered
// IMPORTANT: Import order matters for discriminators - base model must be imported first
import "./user.schema";
// Discriminators must be imported after the base model
import "./customer.schema";
import "./admin.schema";
import "./staff.schema";
// Import other models as well
import "./reservation.schema";
import "./table.schema";
import "./order.schema";
import "./menuitem.schema";
import "./payments.schema";
import "./feedback.schema";
import "./report.schema";

// Export all models for convenience
export { default as User } from "./user.schema";
export { default as Customer } from "./customer.schema";
export { default as Admin } from "./admin.schema";
export { default as Staff } from "./staff.schema";

