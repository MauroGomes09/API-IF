import mongoose from 'mongoose';
import Counter from './counter.model.js';

const ConsentSchema = new mongoose.Schema({
  _id: { type: String },
  customerId: { type: String, ref: 'Customer', required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['AWAITING_AUTHORIZATION', 'AUTHORIZED', 'REJECTED', 'REVOKED'],
    default: 'AWAITING_AUTHORIZATION'
  },
  permissions: [{ 
    type: String, 
    required: true,
    enum: [
      'CUSTOMER_DATA_READ', 
      'ACCOUNTS_READ',      
      'BALANCES_READ',      
      'TRANSACTIONS_READ',
      'INVESTMENTS_READ'   
    ]
  }],
  creationDateTime: { type: Date, default: Date.now },
  expirationDateTime: { 
    type: Date, 
    default: () => new Date(new Date().setFullYear(new Date().getFullYear() + 1)) 
  },
}, { _id: false });

ConsentSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'consentId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this._id = 'con_' + String(counter.seq).padStart(3, '0');
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export default mongoose.model('Consent', ConsentSchema);