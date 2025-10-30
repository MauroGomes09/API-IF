
import { verifyToken } from '../services/authService.js';
import Customer from '../models/customer.model.js'; 

export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acesso negado. Token JWT é obrigatório.' });
    }

    const token = authHeader.split(' ')[1]; 
    const decodedPayload = verifyToken(token);

    if (!decodedPayload) {
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
    
    req.user = decodedPayload;

    try {
        const customer = await Customer.findById(req.user.id);
        
        if (!customer || customer.consentData === false) {
             return res.status(403).json({ message: "Acesso negado. O cliente não deu/revogou o consentimento." });
        }
        
        req.customer = customer;
        
        next(); 
        
    } catch (error) {
        return res.status(500).json({ message: "Erro interno do servidor durante a autorização." });
    }
};