import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  _id: { type: String },
  name: { 
     type: String, 
     required: true,
     trim: true 
  },
  type: { 
     type: String,
     required: true,
     uppercase: true,
     enum: ["CDB", "STOCK", "CRYPTO", "FII", "FUNDS", "TREASURY"]
  },
  institution: { 
      type: String, 
      required: true 
  },
  riskLevel: {
     type: String,
     enum: ["LOW", "MEDIUM", "HIGH", "AGGRESSIVE"],
     required: true
  },
  minInvestmentAmount: {
     type: Number,
     default: 0.01
  },
  active: {
     type: Boolean,
     default: true 
  },
  rateType: { type: String }, 
  rateValue: { type: Number }, 
  maturityDate: { type: Date }, 
  liquidity: { type: String }, 
  issuer: { type: String }, 
  
  ticker: { type: String, uppercase: true }, 
  sector: { type: String },
  
  adminFee: { type: Number }, 
  performanceFee: { type: Number }, 
  
  bondType: { type: String }, 
  indexer: { type: String }, 
  couponRate: { type: Number },
  }, { 
  timestamps: true 
}); 

export default mongoose.model('Product', ProductSchema);