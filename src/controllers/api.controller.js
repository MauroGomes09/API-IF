import Customer from '../models/customer.model.js';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';

export const checkStatus = async (req, res) => {
  res.status(200).json({ status: "API is running" });  
}

export const createCustomer = async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createAccount = async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const newAccount = new Account(req.body);
    const savedAccount = await newAccount.save();

    customer.accounts.push(savedAccount._id);
    await customer.save(); 

    res.status(201).json(savedAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getBalance = async (req, res) => {
  try {
    const { accountId } = req.params;
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }
    res.status(200).json({ balance: account.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { description, amount, type, category } = req.body;

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }

    if (type === 'debit') {
      if (account.balance < amount) {
        return res.status(400).json({ message: 'Saldo insuficiente' });
      }
      account.balance -= amount; 
    } else if (type === 'credit') {
      account.balance += amount; 
    } else {
      return res.status(400).json({ message: 'Tipo de transação inválido. Use "credit" ou "debit".' });
    }

    const newTransaction = new Transaction({ description, amount, type, category });
    const savedTransaction = await newTransaction.save();
    
    account.transactions.push(savedTransaction._id);
    await account.save();

    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const listTransaction = async (req, res) => {
  try {
    const { accountId } = req.params;
    const account = await Account.findById(accountId).populate('transactions');
    
    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }
    
    res.status(200).json(account.transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDataSharingConsent = async(req, res) => {
  try{
      const { customerId } = req.params;
      const { consent } = req.body;

      if (typeof consent !== 'boolean') {
        return res.status(400).json({ message: 'Consent deve ser "true" ou "false"' });
      }

      const updatedCustomer = await Customer.findByIdAndUpdate(
          customerId,
        { consentData: consent},
        { new: true }
      );

      if (!updatedCustomer) {
        return res.status(404).json({ message: 'Usuário não encontrado!' })
      }

      res.status(200).json(updatedCustomer);

  } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar consentimento do usuário!", error: error.message })
  }
}