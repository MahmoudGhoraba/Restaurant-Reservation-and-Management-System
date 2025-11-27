import express from "express";
import ReservationController from "../controllers/reservation.controller";

const router = express.Router();

router.get("/", ReservationController.h);
router.get("/all", ReservationController.getAllReservations);
router.get("/my-reservations", ReservationController.getMyReservations);
router.get("/:id", ReservationController.getReservationById);
router.post("/", ReservationController.createReservation);
router.put("/:id", ReservationController.updateReservation);
router.delete("/:id", ReservationController.cancelReservation);
router.patch("/:id/confirm", ReservationController.confirmReservation);

export default router;
