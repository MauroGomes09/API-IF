import { Types } from 'mongoose';
import { validateConsent } from '../middlewares/consent.middleware.js';
import Account from '../models/account.model.js'; 
jest.mock('../models/account.model.js');

const createMocks = (accountId) => {
  const req = {
    params: { accountId: accountId }
  };
  const res = {
    status: jest.fn(() => res), 
    json: jest.fn(() => res)
  };
  const next = jest.fn();
  
  return { req, res, next };
};


describe('Middleware: validateConsent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Account.aggregate.mockClear(); 
  });

  it('deve chamar next() se o consentimento for true', async () => {
    const accountId = new Types.ObjectId().toHexString();
    const { req, res, next } = createMocks(accountId);

    const mockDbResult = [
      {
        _id: accountId,
        customer_id: new Types.ObjectId(),
        consent_given: true 
      }
    ];
    Account.aggregate.mockResolvedValue(mockDbResult);

    await validateConsent(req, res, next);

    expect(Account.aggregate).toHaveBeenCalledTimes(1); 
    expect(next).toHaveBeenCalledTimes(1);             
    expect(res.status).not.toHaveBeenCalled();        
    expect(res.json).not.toHaveBeenCalled();
  });

  it('deve retornar 403 se o consentimento for false', async () => {
    const accountId = new Types.ObjectId().toHexString();
    const { req, res, next } = createMocks(accountId);

    const mockDbResult = [
      {
        _id: accountId,
        customer_id: new Types.ObjectId(),
        consent_given: false 
      }
    ];
    Account.aggregate.mockResolvedValue(mockDbResult);

    await validateConsent(req, res, next);

    expect(Account.aggregate).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled(); 
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining('Acesso negado') 
    });
  });

  it('deve retornar 404 se a conta não for encontrada', async () => {
    const accountId = new Types.ObjectId().toHexString();
    const { req, res, next } = createMocks(accountId);

    Account.aggregate.mockResolvedValue([]); 

    await validateConsent(req, res, next);

    expect(Account.aggregate).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Conta não encontrada.' });
  });

  it('deve retornar 404 se o cliente não for encontrado (customer_id nulo)', async () => {
    const accountId = new Types.ObjectId().toHexString();
    const { req, res, next } = createMocks(accountId);

    const mockDbResult = [
      {
        _id: accountId,
        customer_id: null, 
        consent_given: null
      }
    ];
    Account.aggregate.mockResolvedValue(mockDbResult);

    await validateConsent(req, res, next);

    expect(Account.aggregate).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cliente associado à conta não encontrado.' });
  });
  
  it('deve retornar 404 se o accountId não existir no banco', async () => {
    const { req, res, next } = createMocks('123-id-invalido'); 
    Account.aggregate.mockResolvedValue([]);
    await validateConsent(req, res, next);

    expect(Account.aggregate).toHaveBeenCalledTimes(1); 
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Conta não encontrada.' });
  });
  
  it('deve retornar 500 se o aggregate falhar', async () => {
    const accountId = new Types.ObjectId().toHexString();
    const { req, res, next } = createMocks(accountId);

    const mockError = new Error('Falha na conexão com o banco');
    Account.aggregate.mockRejectedValue(mockError);

    await validateConsent(req, res, next);

    expect(Account.aggregate).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('Erro interno') });
  });

});