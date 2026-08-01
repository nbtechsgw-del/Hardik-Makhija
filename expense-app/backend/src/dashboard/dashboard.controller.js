import TransactionModel from "../transaction/transaction.model.js";
export const getReport = async (req, res) => {
    try {
        const { id, role } = req.user;
        const { start, end, userId } = req.query;

        // build query
        const q = {};
        if (role !== 'admin') q.userId = id;
        else if (userId) q.userId = userId;

        if (start || end) {
            q.createdAt = {};
            if (start) q.createdAt.$gte = new Date(start);
            if (end) q.createdAt.$lte = new Date(end);
        }

        let transactions = await TransactionModel.find(q).lean();

       

        let totalCredit = 0;
        let totalDebit = 0;
        transactions.forEach((txn) => {
            if (txn.transactionType === "cr") {
                totalCredit += txn.amount;
            }
            else if (txn.transactionType === "dr") {
                totalDebit += txn.amount;
            }

        });

        const totalTransactions = transactions.length;
        const balance = totalCredit - totalDebit;

        const estimate = (value) => Math.floor(value + value * 0.15);

        // build daily map for the requested range (default: last 30 days)
        const dailyMap = {};
        transactions.forEach((txn) => {
            const date = new Date(txn.createdAt).toISOString().slice(0, 10);
            dailyMap[date] = (dailyMap[date] || 0) + txn.amount;
        });

        // breakdowns
        const byType = {};
        const byPayment = {};
        const byTitle = {};
        transactions.forEach((txn) => {
            const t = txn.transactionType || 'unknown';
            const p = txn.paymentMethod || 'unknown';
            const title = txn.title || 'untitled';
            byType[t] = (byType[t] || 0) + txn.amount;
            byPayment[p] = (byPayment[p] || 0) + txn.amount;
            byTitle[title] = (byTitle[title] || 0) + txn.amount;
        });
        const byTitleArr = Object.keys(byTitle).map(k => ({ title: k, total: byTitle[k] })).sort((a,b)=>b.total-a.total).slice(0,10);

        let startDate = start ? new Date(start) : new Date();
        let endDate = end ? new Date(end) : new Date();
        if (!start && !end) {
            // default last 30 days
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 29);
        }

        // normalize to date strings
        const lastDays = [];
        const cur = new Date(startDate);
        while (cur <= endDate) {
            const dateSTR = cur.toISOString().slice(0, 10);
            lastDays.push({ date: dateSTR, total: dailyMap[dateSTR] || 0 });
            cur.setDate(cur.getDate() + 1);
        }




        res.status(200).json({
            summary: {
                totalTransactions,
                totalCredit,
                totalDebit,
                balance,
                
                totalTransactionsEstimate: estimate(totalTransactions),
                totalCreditEstimate: estimate(totalCredit),
                totalDebitEstimate: estimate(totalDebit),
                balanceEstimate: estimate(balance),
            },
            chart: lastDays,
            breakdown: {
                byType,
                byPayment,
                byTitle: byTitleArr,
            }
         });
    }
    catch (err) {
        res.status(500).json({
            message: err.message || "Internal server error"
        });
    }
}
