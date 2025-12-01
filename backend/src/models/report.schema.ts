import mongoose , { Schema , Document , Types} from "mongoose";

export interface IReport extends Document {
    generatedBy: Types.ObjectId;
    reportType:  "Sales" | "Reservation" | "Staff Performance" | "Feedback";
    generatedDate: Date;
    content : any;
}

const ReportSchema = new Schema<IReport>({
    generatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportType: {
        type: String,
        enum: ["Sales", "Reservation", "Staff Performance", "Feedback"],
        required: true
    },
    generatedDate: {
        type: Date,
        default: Date.now
    },
    content: {
        type: Schema.Types.Mixed,
        required: true
    }
}, {    timestamps: true    }
);

const Report = mongoose.model<IReport>('Report', ReportSchema);
export default Report;