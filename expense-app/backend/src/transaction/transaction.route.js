import {Router} from "express";
const TransactionRouter = Router();
import { createTransaction, updateTransaction, deleteTransaction, getTransaction, downloadTransactions } from "./transaction.controller.js";
import { AdminUserGuard } from "../middleware/guard.middleware.js";


TransactionRouter.post("/create", AdminUserGuard, createTransaction);
TransactionRouter.put("/update/:id", AdminUserGuard,updateTransaction);
TransactionRouter.delete("/delete/:id", AdminUserGuard,deleteTransaction);
TransactionRouter.get("/get",AdminUserGuard, getTransaction);
TransactionRouter.get("/download",AdminUserGuard, downloadTransactions);

export default TransactionRouter;