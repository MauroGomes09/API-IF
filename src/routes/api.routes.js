import express from "express";
import * as controller from "../controllers/api.controller.js";
import { validateConsent } from "../middlewares/consent.middleware.js";

const router = express.Router();

router.get("/", controller.checkStatus);

router.post("/customers", controller.createCustomer);

router.post("/accounts", controller.createAccount);

router.patch("/customers/:customerId/consent", controller.updateConsent);

router.get("/accounts/:accountId/balance", validateConsent, controller.getBalance);

router.get("/transactions/:accountId", validateConsent, controller.getTransactions);

router.post("/transactions", controller.createTransaction);

export default router;