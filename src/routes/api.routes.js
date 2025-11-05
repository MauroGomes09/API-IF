import express from "express";
import * as controller from "../controllers/api.controller.js";
import { validateConsent } from "../middlewares/consent.middleware.js";

const router = express.Router();

// Open Routes

router.get("/", controller.checkStatus);

router.post("/customers", controller.createCustomer);

router.post("/accounts", controller.createAccount);

router.post("/transactions", controller.createTransaction);

// Consent Routes

router.post("/consents", controller.createConsent);

router.get("/consents/:consentId", controller.getConsentById);

router.delete("/consents/:consentId", controller.revokeConsent);

// Protected Routes

router.get("/customers/:customerId", validateConsent('CUSTOMER_DATA_READ'), controller.getCustomerData);

router.get("/customers/:customerId/accounts", validateConsent('ACCOUNTS_READ'), controller.getCustomerAccounts);

router.get("/accounts/:accountId/balance", validateConsent('BALANCES_READ'), controller.getBalance);

router.get("/transactions/:accountId", validateConsent('TRANSACTIONS_READ'), controller.getTransactions);

export default router;