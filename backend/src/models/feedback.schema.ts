import mongoose, { Schema , Document , Types} from "mongoose";

export interface IFeedback extends Document {
    customer: Types.ObjectId;
    referenceId: Types.ObjectId;
    rating: number;
    comments?: string;
    date: Date;
}

export const FeedbackSchema = new Schema<IFeedback>({
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    referenceId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    rating: {
        type: Number,
        required: true, 
        min: 1,
        max: 5
    },
    comments: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {    timestamps: true    }
);

const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);
export default Feedback;
