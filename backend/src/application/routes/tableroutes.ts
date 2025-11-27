import express, { Router } from "express";
import TableController from "../controllers/table.controller";

const router: Router = express.Router();
const tableController = new TableController();

router.post('/', tableController.createTable);
router.get('/', tableController.getAllTables);
router.get('/available/search', tableController.getAvailableTables);

router.get('/:id', tableController.getTable);
router.get('/:id/availability', tableController.checkTableAvailability);
router.put('/:id', tableController.updateTable);
router.delete('/:id', tableController.deleteTable);

export default router;