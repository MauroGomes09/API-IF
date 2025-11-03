import Customer from '../models/customer.model.js';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';

export const checkStatus = async (req, res) => {
  try { 
    const statusInfo = {
      message: "API da Instituição Financeira - Mauro Artur",
      version: "1.0.0", 
      status: "online",
      endpoints: {
        status: "GET /",
        customers: "POST /customers, PATCH /customers/:customerId/consent",
        accounts: "POST /accounts, GET /accounts/:accountId/balance",
        transactions: "POST /transactions, GET /transactions/:accountId"
      }
    };

    res.status(200).json(statusInfo); 

  } catch (error){
    res.status(400).json({ message: error.message });
  }
};

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
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: 'O campo customerId é obrigatório no corpo da requisição.' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const accountData = {
      ...req.body,
      customer_id: customerId 
    };

    const newAccount = new Account(accountData);
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
    const account = await Account.findById(accountId).select('balance');

    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }

    res.json({
      accountId: account._id,
      balance: account.balance
    });
  } catch (error) {
    console.error('Erro ao consultar saldo:', error);
    res.status(500).json({ error: 'Erro interno ao consultar saldo.' });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { accountId } = req.body;
    let { description, amount, type, category } = req.body;

    if (!accountId) {
      return res.status(400).json({ message: 'O campo accountId é obrigatório no corpo da requisição.' });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }

    const roundedAmount = Math.round(amount * 100) / 100;

    let currentBalance = Math.round(account.balance * 100) / 100;

    if (type === 'debit') {
      if (currentBalance < roundedAmount) { 
        return res.status(400).json({ message: 'Saldo insuficiente' });
      }
      currentBalance -= roundedAmount; 
    } else if (type === 'credit') {
      currentBalance += roundedAmount; 
    } else {
      return res.status(400).json({ message: 'Tipo de transação inválido. Use "credit" ou "debit".' });
    }

    account.balance = currentBalance;

    const transactionData = {
      accountId: account._id,
      description,
      amount,
      type,
      category
    };

    const newTransaction = new Transaction(transactionData);
    const savedTransaction = await newTransaction.save();
    
    account.transactions.push(savedTransaction._id);
    await account.save();

    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { accountId } = req.params;
    const accountTransactions = await Transaction.find({ 
      accountId: accountId 
    });

    const response = accountTransactions.map(t => ({
      _id: t._id, 
      date: t.date,
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category
    }));

    res.json(response);
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    res.status(500).json({ error: 'Erro interno ao listar transações.' });
  }
};

export const updateConsent = async(req, res) => {
  try{
      const { customerId } = req.params;
      const { consent } = req.body;

      if (typeof consent !== 'boolean') {
        return res.status(400).json({ message: 'Consent deve ser "true" ou "false"' });
      }

      const updatedCustomer = await Customer.findByIdAndUpdate(
          customerId,
        { consent_given: consent},
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