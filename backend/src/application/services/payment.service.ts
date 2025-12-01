import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from '../../data/models/payments.schema';
import { Order, OrderDocument } from '../../data/models/order.schema';
import { CreatePaymentDto, UpdatePaymentDto } from '../../data/dtos';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async createPayment(data: CreatePaymentDto): Promise<PaymentDocument> {
    let status: 'Pending' | 'Paid' | 'Failed' = 'Pending';
    let transactionId: string | undefined;

    // Handle Online Payment Logic
    if (data.paymentMethod === 'Online') {
      try {
        const bankResponse = await this.mockBankCharge({}, data.amount);
        if (bankResponse.success) {
          status = 'Paid';
          transactionId = bankResponse.transId;
        } else {
          status = 'Failed';
        }
      } catch (error) {
        status = 'Failed';
      }
    }

    // Handle Card Payment Logic (simplified for MVP)
    if (data.paymentMethod === 'Card') {
      status = 'Paid';
      transactionId = `CARD_${Date.now()}`;
    }

    // Handle Cash Payment Logic
    if (data.paymentMethod === 'Cash') {
      status = 'Pending'; // Cash payments need to be confirmed
    }

    const payment = new this.paymentModel({
      paymentNumber: await this.generatePaymentNumber(),
      order: data.order,
      reservation: data.reservation,
      customer: data.customer,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      status,
      transactionId,
      finalAmount: data.amount, // Simplified for MVP
    });

    return payment.save();
  }

  async getPaymentById(paymentId: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findById(paymentId)
      .populate('order')
      .populate('reservation')
      .populate('customer', 'name email');
    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND');
    }
    return payment;
  }

  async getPaymentsByCustomer(customerId: string): Promise<PaymentDocument[]> {
    return this.paymentModel.find({ customer: customerId })
      .populate('order')
      .populate('reservation')
      .sort({ createdAt: -1 });
  }

  async updatePayment(paymentId: string, data: UpdatePaymentDto): Promise<PaymentDocument> {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.paymentMethod) updateData.paymentMethod = data.paymentMethod;
    if (data.transactionId) updateData.transactionId = data.transactionId;

    const payment = await this.paymentModel.findByIdAndUpdate(paymentId, updateData, { new: true });
    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND');
    }
    return payment;
  }

  async getAllPayments(): Promise<PaymentDocument[]> {
    return this.paymentModel.find()
      .populate('order')
      .populate('reservation')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
  }

  async getPaymentsByStatus(status: string): Promise<PaymentDocument[]> {
    return this.paymentModel.find({ status })
      .populate('order')
      .populate('reservation')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
  }

  private async mockBankCharge(card: any, amount: number): Promise<{ success: boolean; transId: string }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                transId: `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            });
        }, 500);
    });
  }

  private async generatePaymentNumber(): Promise<string> {
    const count = await this.paymentModel.countDocuments();
    const timestamp = Date.now();
    return `PAY-${timestamp}-${String(count + 1).padStart(4, '0')}`;
    }
}