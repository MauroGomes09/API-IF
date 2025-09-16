import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  date: { type: String, 
          default: () => new Date().toISOString().slice(0, 10), 
        },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true, enum: ['credit', 'debit'] },
  category: { type: String }
});

export default mongoose.model('Transaction', TransactionSchema);