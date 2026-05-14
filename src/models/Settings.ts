import { Schema, model, models } from 'mongoose';

const SettingsSchema = new Schema({
  monthlyBudget: { type: Number, required: true },
  dailyBudget: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  currentMonth: { type: String, required: true }, // Format: YYYY-MM
  theme: { type: String, default: 'dark' },
}, { timestamps: true });

const Settings = models.Settings || model('Settings', SettingsSchema);

export default Settings;
