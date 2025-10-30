import express from "express";
import * as controller from "../controllers/api.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", controller.checkStatus);

router.post("/customers", controller.createCustomer);

router.post("/accounts", controller.createAccount);

router.patch("/customers/:customerId/consent", controller.updateDataSharingConsent);

router.get("/accounts/:accountId/balance", protect, controller.getBalance);

router.get("/transactions/:accountId", protect, controller.getTransactions);

router.post("/transactions", controller.createTransaction);

router.post('/auth/token', controller.getAccessToken);

export default router;