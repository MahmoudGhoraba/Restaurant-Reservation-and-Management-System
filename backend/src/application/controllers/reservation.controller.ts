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
      const {id ,table, reservationDate, reservationTime, numberOfGuests, duration } = req.body;

      // Validate required fields
      if (!table || !reservationDate || !reservationTime || !numberOfGuests) {
        return next(new AppError("Please provide table, reservationDate, reservationTime, and numberOfGuests", 400));
      }

      if (!id) {
        return next(new AppError("User not authenticated", 401));
      }

      const reservation = await ReservationService.createReservation({
        customer: id as string,
        table,
        reservationDate: new Date(reservationDate),
        reservationTime,
        numberOfGuests,
        duration: duration || 60 // Default to 60 minutes if not provided
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
      const { id } = req.body;
      const reservation = await ReservationService.getReservationById(id as string);

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
      const { id } = req.body;
      if (!id) {
        return next(new AppError("User not authenticated", 401));
      }

      const reservations = await ReservationService.getReservationsByCustomer(id as string);

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
      const { id ,customerId } = req.body;
      const { table, reservationDate, reservationTime, numberOfGuests, duration } = req.body;

      if (!id) {
        return next(new AppError("User not authenticated", 401));
      }

      const updates: any = {};
      if (table) updates.table = table;
      if (reservationDate) updates.reservationDate = new Date(reservationDate);
      if (reservationTime) updates.reservationTime = reservationTime;
      if (numberOfGuests) updates.numberOfGuests = numberOfGuests;
      if (duration) updates.duration = duration;

      const reservation = await ReservationService.updateReservation(
        id,
        customerId as string,
        updates
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
      const { id ,customerId } = req.body;

      if (!customerId) {
        return next(new AppError("User not authenticated", 401));
      }

      let reservation;

      // Admin can cancel any reservation
      if (req.user?.role === "Admin" || req.user?.role === "admin") {
        reservation = await ReservationService.cancelReservationByAdmin(id );

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
      reservation = await ReservationService.cancelReservationByCustomer(id, customerId as string);

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
      const { id , role } = req.body;

      if (role!== "Admin" && role!== "admin") {
        return next(new AppError("Only admin can confirm reservations", 403));
      }

      try {
        const reservation = await ReservationService.confirmReservation(id as string);

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
      const { id , AdminId} = req.body;
      const deleted = await ReservationService.deleteReservation(id as string);

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
