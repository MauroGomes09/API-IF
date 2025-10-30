import jsonwebtoken from 'jsonwebtoken';
const { sign, verify } = jsonwebtoken;

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = '1d'; 

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET não está definida no ambiente.");
}

/**
 * @param {object} payload
 * @returns {string} 
 */
export function generateToken(payload) {
    return sign(
        payload,
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRATION }
    );
}

/**
 * @param {string} token 
 * @returns {object|null} 
 */
export function verifyToken(token) {
    try {
        return verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}