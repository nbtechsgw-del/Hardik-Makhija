import TransactionModel from "./transaction.model.js";



export const createTransaction = async (req, res) => {
    try{
        const data = req.body;
        const{id}=req.user;
        data.userId = id;
        const transaction = await new TransactionModel(data).save();
        res.json(transaction);
    }catch(err){
        res.status(500).json({
            message: err.message || "Internal server error"
        });
    }
}

export const updateTransaction = async (req, res) => {
    try{
        const data = req.body;
        const { id } = req.params;
        const transaction = await TransactionModel.findByIdAndUpdate(id, data, { new: true });
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found",
            transaction 
        });

        }

        res.json(transaction);
    }catch(err){
        res.status(500).json({
            message: err.message || "Internal server error"
        });
    }
}

export const deleteTransaction = async (req, res) => {
    try{
         const { id } = req.params;
        const transaction = await TransactionModel.findByIdAndDelete(id);
        if(!transaction)
            return res.status(404).json({
        message: "Transaction not found",
        transaction
        });
        res.json(transaction);
    }catch(err){
        res.status(500).json({
            message: err.message || "Internal server error"
        });
    }
}

export const getTransaction = async (req, res) => {
    try{
                const { id } = req.user;
                const { page = 1, limit = 20, search, start, end, transactionType, paymentMethod } = req.query;

                const q = { userId: id };
                if (transactionType) q.transactionType = transactionType;
                if (paymentMethod) q.paymentMethod = paymentMethod;
                if (start || end) {
                    q.createdAt = {};
                    if (start) q.createdAt.$gte = new Date(start);
                    if (end) q.createdAt.$lte = new Date(end);
                }
                if (search) {
                    const regex = new RegExp(search, 'i');
                    q.$or = [
                        { title: regex },
                        { notes: regex },
                        { amount: isNaN(Number(search)) ? undefined : Number(search) }
                    ].filter(Boolean);
                }

                const skip = (Number(page) - 1) * Number(limit);
                const [transactions, total] = await Promise.all([
                    TransactionModel.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
                    TransactionModel.countDocuments(q),
                ]);

        res.json({ data: transactions, total, page: Number(page), limit: Number(limit) });
    }catch(err){
        res.status(500).json({
            message: err.message || "Internal server error"
        })
    }
}

export const downloadTransactions = async (req, res) => {
    try {
        const { id, role } = req.user;
        const { userId, start, end } = req.query;
        const q = {};

        if (role === 'admin') {
            if (userId) q.userId = userId;
        } else {
            q.userId = id;
        }
        if (start || end) {
            q.createdAt = {};
            if (start) q.createdAt.$gte = new Date(start);
            if (end) q.createdAt.$lte = new Date(end);
        }

        const transactions = await TransactionModel.find(q)
            .sort({ createdAt: -1 })
            .populate('userId', 'fullname email mobile')
            .lean();

        const header = [
            'User Fullname',
            'User Email',
            'User Mobile',
            'Transaction Type',
            'Title',
            'Amount',
            'Payment Method',
            'Notes',
            'Date'
        ];

        const escape = (value) => {
            if (value === undefined || value === null) return '""';
            const text = String(value).replace(/"/g, '""');
            return `"${text}"`;
        };

        const rows = transactions.map(txn => [
            escape(txn.userId?.fullname || ''),
            escape(txn.userId?.email || ''),
            escape(txn.userId?.mobile || ''),
            escape(txn.transactionType),
            escape(txn.title),
            escape(txn.amount),
            escape(txn.paymentMethod),
            escape(txn.notes),
            escape(txn.createdAt?.toISOString() || ''),
        ].join(','));

        const csv = [header.join(','), ...rows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="transactions_export_${Date.now()}.csv"`);
        res.send(csv);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Internal server error' });
    }
}
