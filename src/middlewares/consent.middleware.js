import Account from '../models/account.model.js';

export const validateConsent = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const aggregationPipeline = [
      {
        $match: { _id: accountId }
      },
      {
        $lookup: {
          from: 'customers',         
          localField: 'customer_id',   
          foreignField: '_id',         
          as: 'customerData'           
        }
      },
      {
        $unwind: {
          path: '$customerData',
          preserveNullAndEmptyArrays: true 
        }
      },
      {
        $project: {
          _id: 1,
          customer_id: 1,
          consent_given: '$customerData.consent_given'
        }
      }
    ];

    const result = await Account.aggregate(aggregationPipeline);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }

    const data = result[0];

    if (!data.customer_id) {
      return res.status(404).json({ error: 'Cliente associado à conta não encontrado.' });
    }

    if (!data.consent_given) {
      return res.status(403).json({
        error: 'Acesso negado: Cliente não forneceu consentimento (LGPD).',
      });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de consentimento:', error);
    res.status(500).json({ error: 'Erro interno ao validar consentimento.' });
  }
};