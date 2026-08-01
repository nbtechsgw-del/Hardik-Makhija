import { model, Schema } from "mongoose";

const settingsSchema = new Schema({
    appName: { type: String, default: "Expense App" },
    supportEmail: { type: String, default: "support@example.com" },
    supportMobile: { type: String, default: "+1234567890" },
    domain: { type: String, default: process.env.DOMAIN || "http://localhost:5173" },
    defaultTransactionLimit: { type: Number, default: 20 },
    currencySymbol: { type: String, default: "$" },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const SettingsModel = model("Settings", settingsSchema);
export default SettingsModel;
