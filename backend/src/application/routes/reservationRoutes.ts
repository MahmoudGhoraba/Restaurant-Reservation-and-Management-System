import express from "express";
import ReservationController from "../controllers/reservation.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Reservation management operations
 */

/**
 * @swagger
 * /api/v1/reservations:
 *   get:
 *     summary: Health check for reservations
 *     tags: [Reservations]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get("/", ReservationController.h);

/**
 * @swagger
 * /api/v1/reservations/all:
 *   get:
 *     summary: Get all reservations (Admin only)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All reservations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 */
router.get("/all", ReservationController.getAllReservations);

/**
 * @swagger
 * /api/v1/reservations/my-reservations:
 *   get:
 *     summary: Get current user's reservations
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User reservations retrieved successfully
 *       401:
 *         description: User not authenticated
 */
router.get("/my-reservations", ReservationController.getMyReservations);

/**
 * @swagger
 * /api/v1/reservations/{id}:
 *   get:
 *     summary: Get reservation by ID
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Reservation found
 *       404:
 *         description: Reservation not found
 */
router.get("/:id", ReservationController.getReservationById);

/**
 * @swagger
 * /api/v1/reservations:
 *   post:
 *     summary: Create a new reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - table
 *               - reservationDate
 *               - reservationTime
 *               - numberOfGuests
 *             properties:
 *               table:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               reservationDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-11-25"
 *               reservationTime:
 *                 type: string
 *                 pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: "19:00"
 *               duration:
 *                 type: number
 *                 minimum: 30
 *                 maximum: 480
 *                 example: 90
 *               numberOfGuests:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 20
 *                 example: 4
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Table not available (overlap conflict)
 */
router.post("/", ReservationController.createReservation);

/**
 * @swagger
 * /api/v1/reservations/{id}:
 *   put:
 *     summary: Update reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
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
 *               table:
 *                 type: string
 *               reservationDate:
 *                 type: string
 *                 format: date
 *               reservationTime:
 *                 type: string
 *               duration:
 *                 type: number
 *               numberOfGuests:
 *                 type: number
 *     responses:
 *       200:
 *         description: Reservation updated successfully
 *       404:
 *         description: Reservation not found
 *       409:
 *         description: Time slot conflict
 */
router.put("/:id", ReservationController.updateReservation);

/**
 * @swagger
 * /api/v1/reservations/{id}:
 *   delete:
 *     summary: Cancel reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservation canceled successfully
 *       404:
 *         description: Reservation not found
 */
router.delete("/:id", ReservationController.cancelReservation);

/**
 * @swagger
 * /api/v1/reservations/{id}/confirm:
 *   patch:
 *     summary: Confirm reservation (Admin only)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservation confirmed successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Reservation not found
 */
router.patch("/:id/confirm", ReservationController.confirmReservation);

export default router;
