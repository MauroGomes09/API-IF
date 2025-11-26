import mongoose from 'mongoose';
import Counter from './counter.model.js'; 

const InvestmentSchema = new mongoose.Schema({
   _id: { type: String }, 
   accountId: {
      type: String,
      ref: "Account",
      required: true
   },
   productId: {
      type: String,
      ref: "Product",
      required: true
   },
   investedAmount: { 
      type: Number, 
      required: true, 
      min: 0 
   },
   purchaseDate: { 
      type: Date, 
      default: Date.now 
   }
}, { timestamps: true });

InvestmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'investmentId' }, 
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this._id = 'inv_' + String(counter.seq).padStart(3, '0');
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export default mongoose.model('Investment', InvestmentSchema);