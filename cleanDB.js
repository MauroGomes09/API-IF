import mongoose from 'mongoose';
import 'dotenv/config';

import Customer from './src/models/customer.model.js';
import Account from './src/models/account.model.js';
import Transaction from './src/models/transaction.model.js';
import Counter from './src/models/counter.model.js'; 

const MONGO_URI = process.env.MONGO_URI;

const cleanDatabase = async () => {
  if (!MONGO_URI) {
    console.error('Erro: Variável MONGO_URI não encontrada no arquivo .env!');
    process.exit(1); 
  }

  try {
    console.log('Conectando ao banco de dados...');
    await mongoose.connect(MONGO_URI);
    console.log('Conexão bem-sucedida. Limpando coleções...');

    const deletePromises = [
      Customer.deleteMany({}),
      Account.deleteMany({}),
      Transaction.deleteMany({}),
      Counter.deleteMany({})
    ];

    await Promise.all(deletePromises);

    console.log('---------------------------------');
    console.log('Banco de dados limpo com sucesso!');
    console.log('---------------------------------');

  } catch (error) {
    console.error('Erro ao limpar o banco de dados:', error.message);
  } finally {
    console.log('Fechando conexão...');
    await mongoose.connection.close();
    process.exit(0); 
  }
};

cleanDatabase();