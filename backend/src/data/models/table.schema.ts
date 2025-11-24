import mongoose ,{Document,Schema} from "mongoose";

export interface ITable extends Document{
    capacity: number;
    location: string;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const tableSchema = new Schema({
    capacity:{type:Number, required:true},
    location:{type:String, required:true},
    isAvailable:{type:Boolean,required:true},
},{timestamps:true});

export const Table =mongoose.model<ITable>(`Table`,tableSchema);