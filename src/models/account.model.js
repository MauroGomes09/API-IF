import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['checking', 'savings'] },
  branch: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0.00 },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }]
});

export default mongoose.model('Account', AccountSchema);