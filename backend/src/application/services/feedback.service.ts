import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback, FeedbackDocument } from '../../data/models/feedback.schema';
import { CreateFeedbackDto, UpdateFeedbackDto } from '../../data/dtos';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
  ) {}

  async createFeedback(data: CreateFeedbackDto): Promise<FeedbackDocument> {
    const feedback = new this.feedbackModel({
      customer: data.customer,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      rating: data.rating,
      comments: data.comments,
        });
    return feedback.save();
    }

  async updateFeedback(feedbackId: string, data: UpdateFeedbackDto): Promise<FeedbackDocument> {
    const updateData: any = {};
    if (data.rating) updateData.rating = data.rating;
    if (data.comments) updateData.comments = data.comments;

    const feedback = await this.feedbackModel.findByIdAndUpdate(feedbackId, updateData, { new: true });
    if (!feedback) {
      throw new Error('FEEDBACK_NOT_FOUND');
    }
    return feedback;
    }

  async getFeedbackById(feedbackId: string): Promise<FeedbackDocument> {
    const feedback = await this.feedbackModel.findById(feedbackId)
      .populate('customer', 'name email');
    if (!feedback) {
      throw new Error('FEEDBACK_NOT_FOUND');
    }
    return feedback;
  }

  async getAllFeedback(filters: { rating?: number; customer?: string } = {}): Promise<FeedbackDocument[]> {
    const query: any = {};

    if (filters.rating) {
      query.rating = filters.rating;
        }
    if (filters.customer) {
            query.customer = filters.customer;
        }

    return this.feedbackModel.find(query)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
    }

  async getFeedbackByReference(referenceType: string, referenceId: string): Promise<FeedbackDocument[]> {
    return this.feedbackModel.find({ referenceType, referenceId })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
  }

  async deleteFeedback(feedbackId: string): Promise<void> {
    const feedback = await this.feedbackModel.findByIdAndDelete(feedbackId);
    if (!feedback) {
      throw new Error('FEEDBACK_NOT_FOUND');
    }
  }

  async getAverageRating(referenceType?: string, referenceId?: string): Promise<number> {
    const match: any = {};
    if (referenceType) match.referenceType = referenceType;
    if (referenceId) match.referenceId = referenceId;

    const result = await this.feedbackModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    return result[0]?.averageRating || 0;
  }
}