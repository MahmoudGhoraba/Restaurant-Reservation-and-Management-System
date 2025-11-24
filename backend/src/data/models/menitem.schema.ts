import mongoose ,{Document , Schema} from "mongoose";

export interface IMenuItem extends Document{
    name: string;
    description: string;
    price: number;
    availability: boolean;
    imageUrl?: string; // we can change this
    category: string;
}
const MenuItemSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    availability: { type: Boolean, required: true },
    imageUrl: { type: String },
    category: { type: String, required: true },
}, { timestamps: true
})
export const MenuItem= mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
