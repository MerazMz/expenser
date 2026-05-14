import { Schema, model, models } from 'mongoose';

const ExpenseSchema = new Schema({
  date: { type: String, required: true, unique: true }, // Format: YYYY-MM-DD
  limit: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  saved: { type: Number, default: 0 },
  note: { type: String, default: '' },
}, { timestamps: true });

const Expense = models.Expense || model('Expense', ExpenseSchema);

export default Expense;
