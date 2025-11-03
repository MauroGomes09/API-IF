import mongoose from 'mongoose';
import Counter from './counter.model.js';

const AccountSchema = new mongoose.Schema({
  _id: { type: String },
  customer_id: { type: String, ref: 'Customer', required: true },
  type: { type: String, required: true, enum: ['checking', 'savings'] },
  branch: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0.00 },
  transactions: [{ type: String, ref: 'Transaction' }]
}, {
  _id: false
});

AccountSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'accountId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const newId = 'acc_' + String(counter.seq).padStart(3, '0');
      this._id = newId; 

      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export default mongoose.model('Account', AccountSchema);