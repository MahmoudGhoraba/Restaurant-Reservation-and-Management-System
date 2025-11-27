import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import TableService from "../services/table.service";
import AppError from "../../infrastructure/utils/appError";
import catchAsync from "../../infrastructure/utils/catchAsync";

class TableController {
    private isValidObjectId(id: string): boolean {
        return mongoose.Types.ObjectId.isValid(id);
    }

    createTable = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const tableDetails = req.body;

        if (!tableDetails || Object.keys(tableDetails).length === 0) {
            return next(new AppError("Table details are required", 400));
        }

        const table = await TableService.createTable(tableDetails);

        res.status(201).json({
            success: true,
            message: "Table created successfully",
            data: table
        });
    });

    getTable = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;

        if (!id) {
            return next(new AppError("Table ID is required", 400));
        }

        if (!this.isValidObjectId(id)) {
            return next(new AppError("Invalid table ID format", 400));
        }

        const table = await TableService.getTable(id);

        if (!table) {
            return next(new AppError("Table not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Table retrieved successfully",
            data: table
        });
    });

    updateTable = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const tableDetails = req.body;

        if (!id) {
            return next(new AppError("Table ID is required", 400));
        }

        if (!this.isValidObjectId(id)) {
            return next(new AppError("Invalid table ID format", 400));
        }

        if (!tableDetails || Object.keys(tableDetails).length === 0) {
            return next(new AppError("Update details are required", 400));
        }

        const table = await TableService.updateTable(id, tableDetails);

        if (!table) {
            return next(new AppError("Table not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Table updated successfully",
            data: table
        });
    });

    deleteTable = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;

        if (!id) {
            return next(new AppError("Table ID is required", 400));
        }

        if (!this.isValidObjectId(id)) {
            return next(new AppError("Invalid table ID format", 400));
        }

        const table = await TableService.deleteTable(id);

        if (!table) {
            return next(new AppError("Table not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Table deleted successfully",
            data: table
        });
    });

    getAllTables = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const tables = await TableService.getAllTables();

        res.status(200).json({
            success: true,
            message: "Tables retrieved successfully",
            data: tables,
            count: tables.length
        });
    });
    checkTableAvailability = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { date, time, duration = 60 } = req.query;

        if (!id) {
            return next(new AppError("Table ID is required", 400));
        }

        if (!this.isValidObjectId(id)) {
            return next(new AppError("Invalid table ID formatdd", 400));
        }

        if (!date || !time) {
            return next(new AppError("Date and time are required", 400));
        }

        // Validate time format
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time as string)) {
            return next(new AppError("Time must be in HH:MM format", 400));
        }

        const reservationDate = new Date(date as string);
        const reservationDuration = parseInt(duration as string);

        if (reservationDuration < 30 || reservationDuration > 480) {
            return next(new AppError("Duration must be between 30 and 480 minutes", 400));
        }

        // Check if table exists
        const table = await TableService.getTable(id);
        if (!table) {
            return next(new AppError("Table not found", 404));
        }

        // Check availability
        const isAvailable = await TableService.checkTableAvailability(
            id,
            reservationDate,
            time as string,
            reservationDuration
        );

        res.status(200).json({
            success: true,
            message: "Table availability checked",
            data: {
                tableId: id,
                table: {
                    capacity: table.capacity,
                    location: table.location
                },
                requestedSlot: {
                    date: date,
                    time: time,
                    duration: `${reservationDuration} minutes`
                },
                isAvailable,
                status: isAvailable ? "Available" : "Not available"
            }
        });
    });

    // NEW: Get all available tables for specific time slot
    getAvailableTables = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { date, time, duration = 60, capacity } = req.query;

        if (!date || !time) {
            return next(new AppError("Date and time are required", 400));
        }

        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time as string)) {
            return next(new AppError("Time must be in HH:MM format", 400));
        }

        const reservationDate = new Date(date as string);
        const reservationDuration = parseInt(duration as string);
        const requiredCapacity = capacity ? parseInt(capacity as string) : undefined;

        if (reservationDuration < 30 || reservationDuration > 480) {
            return next(new AppError("Duration must be between 30 and 480 minutes", 400));
        }

        const availableTables = await TableService.getAvailableTables(
            reservationDate,
            time as string,
            reservationDuration,
            requiredCapacity
        );

        res.status(200).json({
            success: true,
            message: "Available tables retrieved successfully",
            data: availableTables,
            count: availableTables.length,
            requestedSlot: {
                date: date,
                time: time,
                duration: `${reservationDuration} minutes`,
                minimumCapacity: requiredCapacity || "Any"
            }
        });
    });
}

export default TableController;
