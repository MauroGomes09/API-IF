import express from "express";
import * as controller from "../controllers/api.controller.js";

const router = express.Router();

router.get("/", controller.checkStatus);

router.post("/customers", controller.createCustomer);

router.post("/customers/:customerId/accounts", controller.createAccount);

router.patch("/customers/:customerId/consent", controller.updateDataSharingConsent);

router.get("/accounts/:accountId/balance", controller.getBalance);

router.get("/accounts/:accountId/transactions", controller.listTransaction);

router.post("/accounts/:accountId/transactions", controller.createTransaction);

export default router;