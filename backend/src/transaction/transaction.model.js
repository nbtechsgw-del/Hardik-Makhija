import { model, Schema } from "mongoose";

const transactionSchema = new Schema({
    transactionType:{
        type: String,
        trim: true,
        lowercase: true,
        required: true,
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title:{
        type: String,
        trim: true,
        lowercase: true,
        required: true,
    },
    amount:{
        type: Number,
        required: true,
    },
    paymentMethod:{
        type: String,
        trim: true,
        lowercase: true,
        required: true,
    },
    notes:{
        type: String,
        trim: true,
        lowercase: true,
    },

}, {timestamps:true});

const TransactionModel = model("Transaction", transactionSchema);

export default TransactionModel;