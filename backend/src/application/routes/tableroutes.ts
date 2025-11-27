import express, { Router } from "express";
import TableController from "../controllers/table.controller";

const router: Router = express.Router();
const tableController = new TableController();

/**
 * @swagger
 * tags:
 *   name: Tables
 *   description: Table management operations
 */

/**
 * @swagger
 * /api/v1/tables:
 *   post:
 *     summary: Create a new table
 *     tags: [Tables]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - capacity
 *               - location
 *             properties:
 *               capacity:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 20
 *                 example: 4
 *               location:
 *                 type: string
 *                 example: "Window side"
 *     responses:
 *       201:
 *         description: Table created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request
 */
router.post('/', tableController.createTable);

/**
 * @swagger
 * /api/v1/tables:
 *   get:
 *     summary: Get all tables
 *     tags: [Tables]
 *     responses:
 *       200:
 *         description: Tables retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Table'
 *                 count:
 *                   type: number
 */
router.get('/', tableController.getAllTables);

/**
 * @swagger
 * /api/v1/tables/available/search:
 *   get:
 *     summary: Search for available tables
 *     tags: [Tables]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-11-25"
 *       - in: query
 *         name: time
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *         example: "19:00"
 *       - in: query
 *         name: duration
 *         schema:
 *           type: number
 *           default: 60
 *           minimum: 30
 *           maximum: 480
 *         example: 90
 *       - in: query
 *         name: capacity
 *         schema:
 *           type: number
 *           minimum: 1
 *         example: 4
 *     responses:
 *       200:
 *         description: Available tables found
 *       400:
 *         description: Invalid parameters
 */
router.get('/available/search', tableController.getAvailableTables);

/**
 * @swagger
 * /api/v1/tables/{id}:
 *   get:
 *     summary: Get table by ID
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Table found
 *       404:
 *         description: Table not found
 */
router.get('/:id', tableController.getTable);

/**
 * @swagger
 * /api/v1/tables/{id}/availability:
 *   get:
 *     summary: Check table availability
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-11-25"
 *       - in: query
 *         name: time
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *         example: "19:00"
 *       - in: query
 *         name: duration
 *         schema:
 *           type: number
 *           default: 60
 *         example: 90
 *     responses:
 *       200:
 *         description: Availability checked successfully
 *       404:
 *         description: Table not found
 */
router.get('/:id/availability', tableController.checkTableAvailability);

/**
 * @swagger
 * /api/v1/tables/{id}:
 *   put:
 *     summary: Update table
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               capacity:
 *                 type: number
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Table updated successfully
 *       404:
 *         description: Table not found
 */
router.put('/:id', tableController.updateTable);

/**
 * @swagger
 * /api/v1/tables/{id}:
 *   delete:
 *     summary: Delete table
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Table deleted successfully
 *       404:
 *         description: Table not found
 */
router.delete('/:id', tableController.deleteTable);

export default router;