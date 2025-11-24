import { Request, Response, NextFunction } from "express";
import ReservationService from "../services/reservation.service";
import catchAsync from "../../infrastructure/utils/catchAsync";
import AppError from "../../infrastructure/utils/appError";

class ReservationController {
  // Health check endpoint
  h = catchAsync(
    async (_req: Request, res: Response, _next: NextFunction) => {
      res.status(200).json({ 
        status: "success",
        message: "Hello from Reservation Controller" 
      });
    }
  );

  // CREATE RESERVATION
  createReservation = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { reservationDate, reservationTime, numberOfGuests } = req.body;

      // Validate required fields
      if (!reservationDate || !reservationTime || !numberOfGuests) {
        return next(new AppError("Please provide all required fields", 400));
      }

      if (!req.user?.id) {
        return next(new AppError("User not authenticated", 401));
      }

      const reservation = await ReservationService.createReservation({
        customer: req.user.id,
        reservationDate,
        reservationTime,
        numberOfGuests,
      });

      res.status(201).json({
        status: "success",
        message: "Reservation created successfully",
        data: reservation,
      });
    }
  );

  // GET ALL RESERVATIONS
  getAllReservations = catchAsync(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const reservations = await ReservationService.getAllReservations();

      res.status(200).json({
        status: "success",
        results: reservations.length,
        data: reservations,
      });
    }
  );

  // GET RESERVATION BY ID
  getReservationById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const reservation = await ReservationService.getReservationById(req.params.id);

      if (!reservation) {
        return next(new AppError("Reservation not found", 404));
      }

      res.status(200).json({
        status: "success",
        data: reservation,
      });
    }
  );

  // GET MY RESERVATIONS (Customer's own reservations)
  getMyReservations = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user?.id) {
        return next(new AppError("User not authenticated", 401));
      }

      const reservations = await ReservationService.getReservationsByCustomer(req.user.id);

      res.status(200).json({
        status: "success",
        results: reservations.length,
        data: reservations,
      });
    }
  );

  // UPDATE RESERVATION
  updateReservation = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { reservationDate, reservationTime, numberOfGuests } = req.body;

      if (!req.user?.id) {
        return next(new AppError("User not authenticated", 401));
      }

      const reservation = await ReservationService.updateReservation(
        id,
        req.user.id,
        { reservationDate, reservationTime, numberOfGuests }
      );

      if (!reservation) {
        return next(new AppError("Reservation not found or not authorized", 404));
      }

      res.status(200).json({
        status: "success",
        message: "Reservation updated successfully",
        data: reservation,
      });
    }
  );

  // CANCEL RESERVATION
  cancelReservation = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!req.user?.id) {
        return next(new AppError("User not authenticated", 401));
      }

      let reservation;

      // Admin can cancel any reservation
      if (req.user.role === "Admin" || req.user.role === "admin") {
        reservation = await ReservationService.cancelReservationByAdmin(id);
        
        if (!reservation) {
          return next(new AppError("Reservation not found", 404));
        }

        return res.status(200).json({
          status: "success",
          message: "Reservation canceled by admin",
          data: reservation,
        });
      }

      // Customer can cancel ONLY their own reservation
      reservation = await ReservationService.cancelReservationByCustomer(id, req.user.id);

      if (!reservation) {
        return next(new AppError("Reservation not found or unauthorized", 404));
      }

      res.status(200).json({
        status: "success",
        message: "Reservation canceled successfully",
        data: reservation,
      });
    }
  );

  // CONFIRM RESERVATION (Admin only)
  confirmReservation = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (req.user?.role !== "Admin" && req.user?.role !== "admin") {
        return next(new AppError("Only admin can confirm reservations", 403));
      }

      try {
        const reservation = await ReservationService.confirmReservation(id);

        if (!reservation) {
          return next(new AppError("Reservation not found", 404));
        }

        res.status(200).json({
          status: "success",
          message: "Reservation confirmed successfully",
          data: reservation,
        });
      } catch (error) {
        if (error instanceof Error && error.message === "Cannot confirm a canceled reservation") {
          return next(new AppError(error.message, 400));
        }
        throw error;
      }
    }
  );

  // DELETE RESERVATION (Admin only)
  deleteReservation = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const deleted = await ReservationService.deleteReservation(req.params.id);

      if (!deleted) {
        return next(new AppError("Reservation not found", 404));
      }

      res.status(204).json({
        status: "success",
        data: null,
      });
    }
  );
}

export default new ReservationController();
