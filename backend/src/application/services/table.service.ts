import { ITable, Table } from "../../data/models/table.schema";
import Reservation, { IReservation } from "../../data/models/reservation.schema";
import { Document } from "mongoose";

export interface ITableService {
    createTable(details: ITable): Promise<ITable>;
    updateTable(id: string, details: Partial<ITable>): Promise<ITable | null>;
    getTable(id: string): Promise<ITable | null>;
    getAllTables(): Promise<ITable[]>;
    deleteTable(id: string): Promise<ITable | null>;
    checkTableAvailability(tableId: string, reservationDate: Date, reservationTime: string, duration?: number): Promise<boolean>;
    getAvailableTables(reservationDate: Date, reservationTime: string, duration?: number, requiredCapacity?: number): Promise<ITable[]>;
}
class TableService implements ITableService {
    createTable(details: ITable): Promise<ITable> {
        const table = new Table(details);
        return table.save();
    }

    updateTable(id: string, details: Partial<ITable>): Promise<ITable | null> {
        return Table.findByIdAndUpdate(id, details, { new: true });
    }

    getTable(id: string): Promise<ITable | null> {
        return Table.findById(id);
    }

    getAllTables(): Promise<ITable[]> {
        return Table.find();
    }

    deleteTable(id: string): Promise<ITable | null> {
        return Table.findByIdAndDelete(id);
    }

    // Check if table is available (no overlapping reservations)
    async checkTableAvailability(
        tableId: string,
        reservationDate: Date,
        reservationTime: string,
        duration: number = 60
    ): Promise<boolean> {
        const startOfDay = new Date(reservationDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(reservationDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Get all active reservations for this table on this date
        const existingReservations = await Reservation.find({
            table: tableId,
            reservationDate: { $gte: startOfDay, $lte: endOfDay },
            bookingStatus: { $in: ['pending', 'confirmed'] }
        });

        // Check for time conflicts
        const requestedStart = this.timeToMinutes(reservationTime);
        const requestedEnd = requestedStart + duration;

        // Return false if any reservation overlaps
        for (const reservation of existingReservations) {
            const existingStart = this.timeToMinutes(reservation.reservationTime);
            const existingEnd = existingStart + reservation.duration;

            // Check if time ranges overlap
            if (requestedStart < existingEnd && requestedEnd > existingStart) {
                return false; // Conflict found
            }
        }

        return true; // No conflicts
    }

    // Get all available tables for specific date, time and duration
    async getAvailableTables(
        reservationDate: Date,
        reservationTime: string,
        duration: number = 60,
        requiredCapacity?: number
    ): Promise<ITable[]> {
        const startOfDay = new Date(reservationDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(reservationDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Get all reservations for this date
        const allReservations = await Reservation.find({
            reservationDate: { $gte: startOfDay, $lte: endOfDay },
            bookingStatus: { $in: ['pending', 'confirmed'] }
        });

        // Find tables with time conflicts
        const requestedStart = this.timeToMinutes(reservationTime);
        const requestedEnd = requestedStart + duration;
        const conflictingTableIds = new Set();

        allReservations.forEach(reservation => {
            const existingStart = this.timeToMinutes(reservation.reservationTime);
            const existingEnd = existingStart + reservation.duration;

            // Check if time ranges overlap
            if (requestedStart < existingEnd && requestedEnd > existingStart) {
                conflictingTableIds.add(reservation.table.toString());
            }
        });

        // Build query for available tables
        const query: any = {
            _id: { $nin: Array.from(conflictingTableIds) }
        };

        if (requiredCapacity) {
            query.capacity = { $gte: requiredCapacity };
        }

        return await Table.find(query);
    }



    // Helper method: Convert time string to minutes
    private timeToMinutes(timeString: string): number {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }
}
export default new TableService()
