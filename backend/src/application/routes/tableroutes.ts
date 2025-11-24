import express, { Router } from "express";
import TableController from "../controllers/table.controller";

const router: Router = express.Router();
const tableController = new TableController();

// Basic CRUD operations
router.post('/', tableController.createTable);
router.get('/', tableController.getAllTables);

// ✅ FIX: Put specific routes BEFORE parameter routes
router.get('/available/search', tableController.getAvailableTables);  // Move this up
router.get('/:id', tableController.getTable);                         // Parameter route comes after
router.get('/:id/availability', tableController.checkTableAvailability);
router.put('/:id', tableController.updateTable);
router.delete('/:id', tableController.deleteTable);

export default router;