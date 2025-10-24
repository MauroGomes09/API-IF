import mongoose from 'mongoose';
import Counter from './counter.model.js';

const TransactionSchema = new mongoose.Schema({
  _id: {type: String },
  date: { type: String, 
          default: () => new Date().toISOString().slice(0, 10), 
        },
  description: { type: String, required: true },
  amount: { 
    type: Number, 
    required: true,
    min: [0.01, 'O valor da transação deve ser maior que R$ 0,00.'],
    validate: {
    validator: function(v) {
      return Math.round(v * 100) / 100 === v;
    },
    message: props => `${props.value} não é um valor monetário válido. Use no máximo 2 casas decimais.`
  } 
  },
  type: { type: String, required: true, enum: ['credit', 'debit'] },
  category: { type: String }
}, {
  _id: false
});

TransactionSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'transactionId' }, 
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const newId = 'txn_' + String(counter.seq).padStart(3, '0');
      this._id = newId;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export default mongoose.model('Transaction', TransactionSchema);