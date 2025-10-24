import mongoose from 'mongoose';
import Counter from './counter.model.js';

const CustomerSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  accounts: [{ type: String, ref: 'Account' }],
  consentData: { type: Boolean, default: false }
}, {
  _id: false
});

CustomerSchema.pre('save', async function(next) {
  if (this.isNew) { 
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'customerId' },      
        { $inc: { seq: 1 } },     
        { new: true, upsert: true }                         
      );

      const newId = 'cus_' + String(counter.seq).padStart(3, '0');
      
      this._id = newId;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export default mongoose.model('Customer', CustomerSchema);