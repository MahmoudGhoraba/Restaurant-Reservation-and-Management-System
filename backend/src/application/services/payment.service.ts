import Payment from "../../data/models/payments.schema";
import Order from "../../data/models/order.schema";
import { Types, Document } from "mongoose";

interface CreatePaymentInput {
    order?: Types.ObjectId | string;
    reservation?: Types.ObjectId | string;
    amount: number;
    paymentMethod: "Cash" | "Card" | "Online";
    cardDetails?: any; // mocking in milestone 3
}

//  (Simulating external processing) related Bank API by mocking
const mockBankCharge = async (card: any, amount: number) => {
    return new Promise<{ success: boolean; transId: string }>((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                transId: `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            });
        }, 500);
    });
};

class PaymentService {
    async createPayment({
       order,
       reservation,
       amount,
       paymentMethod,
       cardDetails,
    }:CreatePaymentInput): Promise<Document> {
        let status = "Pending";
        let transactionId = undefined;

        // 1. Handle Online Payment Logic
        if (paymentMethod === "Online") {
            try {
                const bankResponse = await mockBankCharge(cardDetails, amount);
                if (bankResponse.success) {
                    status = "Paid";
                    transactionId = bankResponse.transId;
                }
            } catch (error) {
                throw new Error("Bank transaction failed.");
            }
        } else {
            // 2. Handle Cash/Card (Physical)
            // Assuming Cash is marked Paid immediately for this system,
            // or you can set it to 'Pending' if you need Manager approval.
            status = "Paid";
        }

        // 3. Create the Payment Document
        const newPayment = new Payment({
            order,
            reservation,
            amount,
            paymentMethod,
            status,
            transactionId,
        });

        const savedPayment = await newPayment.save();

        return savedPayment;
    }

    async getAllPayments(): Promise<Document[]> {
        return Payment.find()
            .populate("order", "totalAmount status")      // Show minimal order info
            .populate("reservation", "reservationDate");  // Show minimal reservation info
    }

    async getPaymentById(paymentId: string): Promise<Document | null> {
        return Payment.findById(paymentId)
            .populate("order")
            .populate("reservation");
    }

    async updatePaymentStatus(
        paymentId: string,
        status: "Paid" | "Pending" | "Refunded"
    ): Promise<Document | null> {
        const updatedPayment = await Payment.findByIdAndUpdate(
            paymentId,
            { status },
            { new: true }
        );
        return updatedPayment;
    }

    // Get all payments for a specific Order
    async getPaymentsByOrder(orderId: string): Promise<Document[]> {
        return Payment.find({ order: orderId });
    }
}

export default new PaymentService();