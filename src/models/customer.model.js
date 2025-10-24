import mongoose from 'mongoose';
import Counter from './counter.model.js';

const CustomerSchema = new mongoose.Schema({
  _id: { type: String },
  name: { 
    type: String, 
    required: [true, 'O campo "name" é obrigatório.'],
    trim: true,
    minlength: [3, 'O nome deve ter no mínimo 3 caracteres.'],
    maxlength: [100, 'O nome não pode exceder 100 caracteres.'],
    match: [/^[a-zA-ZÀ-ÿ ]+$/, 'O nome deve conter apenas letras e espaços.']
  },
  cpf: { 
    type: String, 
    required: [true, 'O campo CPF é obrigatório'],
    unique: true,
    match: [/^\d{11}$/, 'O CPF deve conter exatamente 11 dígitos numéricos (sem caracteres especiais).'] 
  },
  email: { 
    type: String, 
    required: [true, 'O campo e-mail é obrigatório.'], 
    unique: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Por favor, insira um e-mail válido.'] 
  },
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