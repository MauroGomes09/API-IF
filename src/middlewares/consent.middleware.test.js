import { validateConsent } from '../middlewares/consent.middleware.js';

import Account from '../models/account.model.js';
import Consent from '../models/consent.model.js';

jest.mock('../models/account.model.js');
jest.mock('../models/consent.model.js');

let mockReq;
let mockRes;
let mockNext;

beforeEach(() => {
  jest.clearAllMocks();

  mockReq = {
    params: {} 
  };
  mockRes = {
    status: jest.fn(() => mockRes),
    json: jest.fn(() => mockRes)
  };
  mockNext = jest.fn();
});

describe('Middleware: validateConsent (Factory)', () => {

  it('deve chamar next() se o consentimento for válido para BALANCES_READ', async () => {
    mockReq.params = { accountId: 'acc_001' };

    const middleware = validateConsent('BALANCES_READ');

    Account.findById.mockResolvedValue({ _id: 'acc_001', customer_id: 'cus_001' });
    
    Consent.findOne.mockResolvedValue({
      _id: 'con_001',
      status: 'AUTHORIZED',
      expirationDateTime: new Date(Date.now() + 86400000), 
      permissions: ['ACCOUNTS_READ', 'BALANCES_READ'] 
    });

    await middleware(mockReq, mockRes, mockNext);

    expect(Account.findById).toHaveBeenCalledWith('acc_001');
    expect(Consent.findOne).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledTimes(1); 
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('deve chamar next() se o consentimento for válido para CUSTOMER_DATA_READ', async () => {
    mockReq.params = { customerId: 'cus_001' };

    const middleware = validateConsent('CUSTOMER_DATA_READ');

    Consent.findOne.mockResolvedValue({
      _id: 'con_001',
      status: 'AUTHORIZED',
      expirationDateTime: new Date(Date.now() + 86400000),
      permissions: ['CUSTOMER_DATA_READ']
    });

    await middleware(mockReq, mockRes, mockNext);

    expect(Account.findById).not.toHaveBeenCalled(); 
    expect(Consent.findOne).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledTimes(1); 
  });

  it('deve retornar 404 se a conta não for encontrada', async () => {
    mockReq.params = { accountId: 'acc_999' };
    const middleware = validateConsent('BALANCES_READ');

    Account.findById.mockResolvedValue(null);

    await middleware(mockReq, mockRes, mockNext);

    expect(Account.findById).toHaveBeenCalledWith('acc_999');
    expect(Consent.findOne).not.toHaveBeenCalled(); 
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Conta não encontrada.' });
  });

  it('deve retornar 403 se nenhum consentimento ATIVO for encontrado', async () => {
    mockReq.params = { accountId: 'acc_001' };
    const middleware = validateConsent('BALANCES_READ');

    Account.findById.mockResolvedValue({ _id: 'acc_001', customer_id: 'cus_001' });
    
    Consent.findOne.mockResolvedValue(null);

    await middleware(mockReq, mockRes, mockNext);

    expect(Account.findById).toHaveBeenCalledTimes(1);
    expect(Consent.findOne).toHaveBeenCalledTimes(1);
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('não possui um consentimento ativo') })
    );
  });
  
  it('deve retornar 403 se o consentimento não tiver a permissão necessária', async () => {
    mockReq.params = { accountId: 'acc_001' };
    
    const middleware = validateConsent('BALANCES_READ'); 

    Account.findById.mockResolvedValue({ _id: 'acc_001', customer_id: 'cus_001' });
    
    Consent.findOne.mockResolvedValue({
      _id: 'con_001',
      status: 'AUTHORIZED',
      expirationDateTime: new Date(Date.now() + 86400000),
      permissions: ['ACCOUNTS_READ', 'TRANSACTIONS_READ'] 
    });

    await middleware(mockReq, mockRes, mockNext);

    expect(Consent.findOne).toHaveBeenCalledTimes(1);
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('permissão necessária (BALANCES_READ)') })
    );
  });

});