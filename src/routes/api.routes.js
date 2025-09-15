import express from "express";
import mongoose from "mongoose";
import * as controller from "../controllers/api.controller.js";

const router = express.Router();

router.post("/customers", controller.createCustomer);

router.post("/customers/:customerId/accounts", controller.createAccount);

router.get("/accounts/:accountId/balance", controller.getBalance);

router.get("/accounts/:accountId/transactions", controller.listTransaction);

router.post("/accounts/:accountId/transactions", controller.createTransaction);

export default router;