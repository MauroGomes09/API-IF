import Customer from '../models/customer.model.js';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';
import Consent from '../models/consent.model.js';
import Product from '../models/product.model.js';
import Investment from '../models/investment.model.js';

export const checkStatus = async (req, res) => {
  try { 
    const statusInfo = {
      message: "API da Instituição Financeira - Mauro Artur",
      version: "2.0.0", 
      status: "online",
      endpoints: {
        open: [
          "GET /openfinance/",
          "POST /openfinance/customers",
          "POST /openfinance/accounts",
          "POST /openfinance/transactions"
        ],
        consent: [
          "POST /openfinance/consents",
          "GET /openfinance/consents/:consentId",
          "DELETE /openfinance/consents/:consentId"
        ],
        protected: [
          "GET /openfinance/customers/:customerId",
          "GET /openfinance/customers/:customerId/accounts",
          "GET /openfinance/accounts/:accountId/balance",
          "GET /openfinance/transactions/:accountId"
        ]
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

export const getCustomerData = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const customer = await Customer.findById(customerId)
                            .select('-accounts -__v'); 

    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }
    
    res.status(200).json(customer);

  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar dados do cliente", error: error.message });
  }
};

export const getCustomerAccounts = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId)
                            .populate('accounts');

    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    res.status(200).json(customer.accounts);

  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar contas do cliente", error: error.message });
  }
};

export const createConsent = async (req, res) => {
  try {
    const { customerId, permissions } = req.body;

    if (!customerId || !permissions) {
      return res.status(400).json({ error: 'customerId e permissions (array) são obrigatórios.' });
    }

    const newConsent = new Consent({
      customerId: customerId,
      permissions: permissions, 
      status: 'AUTHORIZED', 
    });

    const savedConsent = await newConsent.save();

    const consentObject = savedConsent.toObject();
    
    const response = {
      ...consentObject,
      creationDateTime: consentObject.creationDateTime.toISOString().slice(0, 10),
      expirationDateTime: consentObject.expirationDateTime.toISOString().slice(0, 10)
    };

    res.status(201).json(response);

  } catch (error) {
    res.status(500).json({ message: "Erro ao criar consentimento", error: error.message });
  }
};

export const revokeConsent = async (req, res) => {
  try {
    const { consentId } = req.params;

    const revokedConsent = await Consent.findByIdAndUpdate(
      consentId,
      { status: 'REVOKED' },
      { new: true } 
    );

    if (!revokedConsent) {
      return res.status(404).json({ error: 'Consentimento não encontrado.' });
    }
    
    res.status(204).send();

  } catch (error) {
    res.status(500).json({ message: "Erro ao revogar consentimento", error: error.message });
  }
};

export const getConsentById = async (req, res) => {
  try {
    const { consentId } = req.params;
    const consent = await Consent.findById(consentId);

    if (!consent) {
      return res.status(404).json({ error: 'Consentimento não encontrado.' });
    }
    
    const consentObject = consent.toObject();
    const response = {
      ...consentObject,
      creationDateTime: consentObject.creationDateTime.toISOString().slice(0, 10),
      expirationDateTime: consentObject.expirationDateTime.toISOString().slice(0, 10)
    };
    
    res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar consentimento", error: error.message });
  }
};

export const getCustomerByCpf = async (req, res) => {
  try {
    const { cpf } = req.params;
    
    const customer = await Customer.findOne({ cpf: cpf }).select('_id cpf');
    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado com este CPF.' });
    }

    if (customer.cpf !== cpf) {
      console.error("ALERTA DE INTEGRIDADE: O CPF encontrado não bate com o CPF buscado.");
      return res.status(500).json({ error: 'Erro de integridade de dados.' });
    }
    
    res.status(200).json(customer);

  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar cliente por CPF", error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ active: true });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar produtos.' });
  }
};

 export const createInvestment = async (req, res) => {
  try {
    const { accountId, productId, amount, quantity } = req.body;

    if (!accountId || !productId || !amount) {
       return res.status(400).json({ message: 'accountId, productId e amount são obrigatórios.' });
    }
    if (amount <= 0) return res.status(400).json({ message: 'O valor deve ser positivo.' });

    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ message: 'Conta não encontrada.' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Produto não encontrado.' });

    if (amount < product.minInvestmentAmount) {
        return res.status(400).json({ message: `Valor mínimo para este produto é ${product.minInvestmentAmount}` });
    }

    let currentBalance = Math.round(account.balance * 100) / 100;
    const investmentAmount = Math.round(amount * 100) / 100;

    if (currentBalance < investmentAmount) {
        return res.status(400).json({ message: 'Saldo insuficiente para investimento.' });
    }

    account.balance -= investmentAmount;
    
    const newTransaction = new Transaction({
        accountId: account._id,
        description: `Investimento em ${product.name}`,
        amount: investmentAmount,
        type: 'debit',
        category: 'Investimento'
    });
    
    const savedTransaction = await newTransaction.save();
    account.transactions.push(savedTransaction._id);
    await account.save();

    const finalQuantity = quantity || 1;

    const newInvestment = new Investment({
        accountId: accountId,
        productId: productId,
        investedAmount: investmentAmount,
        quantity: finalQuantity 
    });

    const savedInvestment = await newInvestment.save();

    res.status(201).json({
        success: true,
        investment: savedInvestment,
        transactionId: savedTransaction._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const redeemInvestment = async (req, res) => {
    try {
        const { investmentId } = req.params;
        const { amount } = req.body; 

        const investment = await Investment.findById(investmentId);
        if (!investment) return res.status(404).json({ message: 'Investimento não encontrado.' });

        if (amount > investment.investedAmount) {
            return res.status(400).json({ message: 'Valor de resgate excede o saldo investido.' });
        }

        const account = await Account.findById(investment.accountId);
        if (!account) return res.status(404).json({ message: 'Conta associada não encontrada.' });

        investment.investedAmount -= amount;
        await investment.save();

        account.balance += amount;

        const newTransaction = new Transaction({
            accountId: account._id,
            description: `Resgate de Investimento (${investmentId})`,
            amount: amount,
            type: 'credit',
            category: 'Resgate'
        });

        const savedTransaction = await newTransaction.save();
        account.transactions.push(savedTransaction._id);
        await account.save();

        res.status(200).json({
            message: 'Resgate realizado com sucesso.',
            remainingInvested: investment.investedAmount
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAccountInvestments = async (req, res) => {
    try {
        const { accountId } = req.params;
        const investments = await Investment.find({ accountId }).populate('productId');
        res.status(200).json(investments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};