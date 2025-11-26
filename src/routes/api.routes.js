import express from "express";
import * as controller from "../controllers/api.controller.js";
import { validateConsent } from "../middlewares/consent.middleware.js";

const router = express.Router();

// Open Routes

router.get("/", controller.checkStatus);

router.post("/customers", controller.createCustomer);

router.post("/accounts", controller.createAccount);

router.post("/transactions", controller.createTransaction);

router.post("/investments", controller.createInvestment);

router.post("/investments/:investmentId/redeem", controller.redeemInvestment);

router.get("/products", controller.getProducts);

// Consent Routes

router.post("/consents", controller.createConsent);

router.get("/consents/:consentId", controller.getConsentById);

router.delete("/consents/:consentId", controller.revokeConsent);

// Protected Routes

router.get("/customers/:customerId", validateConsent('CUSTOMER_DATA_READ'), controller.getCustomerData);

router.get("/customers/:customerId/accounts", validateConsent('ACCOUNTS_READ'), controller.getCustomerAccounts);

router.get("/accounts/:accountId/balance", validateConsent('BALANCES_READ'), controller.getBalance);

router.get("/transactions/:accountId", validateConsent('TRANSACTIONS_READ'), controller.getTransactions);

router.get("/investments/accounts/:accountId", validateConsent('INVESTMENTS_READ'), controller.getAccountInvestments)

// Find customerId from the CPF

router.get("/customers/lookup/by-cpf/:cpf", controller.getCustomerByCpf);

export default router;