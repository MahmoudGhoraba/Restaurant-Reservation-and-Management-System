import { isAnyArrayBuffer } from "util/types";
import Feedback, {IFeedback} from "../../data/models/feedback.schema";
import {Types} from "mongoose";

interface CreateFeedbackInput {
    customer: Types.ObjectId | string;
    referenceId: Types.ObjectId | string;
    rating: number;
    comments?: string;
}

class FeedbackService {
    async createFeedback(input: CreateFeedbackInput): Promise<IFeedback> {
        const feedback = new Feedback({
            customer: input.customer,
            referenceId: input.referenceId,
            rating: input.rating,
            comments: input.comments
        });
        return await feedback.save();
    }
    async updateFeedback(feedbackId: string, updates: Partial<CreateFeedbackInput>): Promise<IFeedback | null> {
        return Feedback.findByIdAndUpdate(feedbackId, updates, { new: true });
    }

    async getFeedbackById(feedbackId: string): Promise<IFeedback | null> {
        return Feedback.findById(feedbackId);
    }
    async getAllFeedback(filters: any = {}) {
        const query : any = {}; 

        if(filters.rating) {
            query.rating= filters.rating;
        }
        if(filters.customer) {
            query.customer = filters.customer;
        }
        return Feedback.find(query).populate('customer', 'name email').sort({ date: -1 });
    }
    async deleteFeedback(feedbackId: string): Promise<IFeedback | null> {
        return Feedback.findByIdAndDelete(feedbackId);
    }
        
}
export default new FeedbackService;