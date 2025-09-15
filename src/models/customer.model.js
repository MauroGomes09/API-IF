import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }]
});

export default mongoose.model('Customer', CustomerSchema);