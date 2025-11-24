import express from "express";
import ReservationController from "../controllers/reservationController";

const router = express.Router();

// Health check
router.get("/", ReservationController.h);

// Get all reservations (likely admin only in production)
router.get("/all", ReservationController.getAllReservations);

// Get customer's own reservations
router.get("/my-reservations", ReservationController.getMyReservations);

// Get specific reservation by ID
router.get("/:id", ReservationController.getReservationById);

// Create a new reservation
router.post("/", ReservationController.createReservation);

// Update a reservation (customer can only update their own)
router.put("/:id", ReservationController.updateReservation);

// Cancel a reservation (customer cancels their own, admin can cancel any)
router.delete("/:id", ReservationController.cancelReservation);

// Confirm a reservation (admin only)
router.patch("/:id/confirm", ReservationController.confirmReservation);

export default router;
