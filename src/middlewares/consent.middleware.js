import Account from '../models/account.model.js';
import Consent from '../models/consent.model.js';

export const validateConsent = (requiredPermission) => {
  
  return async (req, res, next) => {
    try {
      const { accountId, customerId: paramCustomerId } = req.params;
      let customerId = paramCustomerId;

      if (accountId) {
        const account = await Account.findById(accountId);
        if (!account) {
          return res.status(404).json({ error: 'Conta não encontrada.' });
        }
        customerId = account.customer_id;
        if (!customerId) {
          return res.status(404).json({ error: 'Conta não associada a um cliente.' });
        }
      }
      
      if (!customerId) {
         return res.status(400).json({ error: 'ID de cliente ou conta não fornecido.' });
      }

      const validConsent = await Consent.findOne({
        customerId: customerId,
        status: 'AUTHORIZED', 
        expirationDateTime: { $gt: new Date() } 
      });

      if (!validConsent) {
        return res.status(403).json({
          error: 'Acesso negado: O cliente não possui um consentimento ativo.',
        });
      }

      if (!validConsent.permissions.includes(requiredPermission)) {
        return res.status(403).json({
          error: `Acesso negado: O consentimento não inclui a permissão necessária (${requiredPermission}).`,
        });
      }

      next();

    } catch (error) {
      console.error('Erro no middleware de consentimento:', error);
      res.status(500).json({ error: 'Erro interno ao validar consentimento.' });
    }
  };
};