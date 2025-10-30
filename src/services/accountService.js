import Account from '../models/account.model.js'; 
import Transaction from '../models/transaction.model.js'; 

const findAccountAndVerifyOwner = async (accountId, customerId) => {
    const account = await Account.findOne({ _id: accountId }); 

    if (!account) {
        const error = new Error("Conta não encontrada.");
        error.status = 404;
        throw error;
    }
    
    if (!account.customerId || account.customerId !== customerId) { 
        const error = new Error("Acesso negado: A conta não pertence ao cliente logado.");
        error.status = 403;
        throw error;
    }
    
    return account; 
};

export const getBalanceAndVerifyOwner = async (accountId, customerId) => {
    const account = await findAccountAndVerifyOwner(accountId, customerId);
    return account.balance;
};

export const getTransactionsAndVerifyOwner = async (accountId, customerId, filters = {}) => {
    await findAccountAndVerifyOwner(accountId, customerId);
    
    const transactions = await Transaction.find({ accountId: accountId, ...filters })
                                        .sort({ date: -1 })
                                        .limit(50);
                                        
    return transactions;
};