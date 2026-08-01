import { BarChartOutlined, DollarCircleOutlined, PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { Button, Card, Divider } from "antd";
import DailyTransactionchart from "../DailyTransactions";
import Loader from "../Loader";
import {generateFakeTransactions} from "../../../utils/fakeTransactions";
import http from "../../../utils/http";
import { useEffect, useState } from "react";
const fakeTransactions = generateFakeTransactions(30); // Generate 30 days of fake transactions

const Dashboard = () => {
    
    const [report, setReport] = useState(null);

    useEffect(() => {
        http.get("/api/dashboard/report")
        .then((res)=> setReport(res?.data ?? {}))
        .catch((err) => {
            console.error(err);
            setReport({});
        });
    }, []);

    if (!report) return <Loader/>;

    const { summary, chart } = report;


    return (
        <div>
            <div className= "grid md:grid-cols-4 gap-6">
                <Card className= "Shadow">
                    <div className="flex justify-around items-center">
                        <div className="flex items-center flex-col gap-y-2">
                            <Button
                            type="primary"
                            icon={<BarChartOutlined />}
                            size="large"
                            shape="circle"
                            className="!bg-rose-500 hover:bg-blue-600"
                            />
                            <h1 className="text-xl font-semibold text-rose-600">
                                Transactions
                            </h1>
                        </div>
                        <Divider type="vertical" className="h-24" />
                        <div>
                            <h1 className="text-3xl font-bold text-rose-400">
                                    {summary.totalTransactions ?? 0} T

                                </h1>
                                <p className="text-lg mt-1 text-zinc-400">
                                    {summary.totalTransactionsEstimate ?? 0} estimate
                                </p>
                        </div>
                        </div>
                </Card>

                <Card className= "Shadow">
                    <div className="flex justify-around items-center">
                        <div className="flex items-center flex-col gap-y-2">
                            <Button
                            type="primary"
                            icon={<PlusCircleOutlined />}
                            size="large"
                            shape="circle"
                            className="!bg-green-500 hover:bg-green-600"
                            />
                            <h1 className="text-xl font-semibold text-green-600">
                                Total Credit
                            </h1>
                        </div>
                        <Divider type="vertical" className="h-24" />
                        <div>
                            <h1 className="text-3xl font-bold text-green-400">
                                {summary.totalCredit ?? 0} ₹
                                </h1>
                                <p className="text-lg mt-1 text-zinc-400">
                                    {summary.totalCreditEstimate ?? 0} estimate
                                </p>
                        </div>
                        </div>
                </Card>

                 <Card className= "Shadow">
                    <div className="flex justify-around items-center">
                        <div className="flex items-center flex-col gap-y-2">
                            <Button
                            type="primary"
                            icon={<MinusCircleOutlined />}
                            size="large"
                            shape="circle"
                            className="!bg-orange-500 hover:bg-red-600"
                            />
                            <h1 className="text-xl font-semibold text-orange-700">
                                Total Debit
                            </h1>
                        </div>
                        <Divider type="vertical" className="h-24" />
                        <div>
                            <h1 className="text-3xl font-bold text-orange-600">
                                {summary.totalDebit ?? 0} ₹
                                </h1>
                                <p className="text-lg mt-1 text-zinc-400">
                                    {summary.totalDebitEstimate ?? 0} estimate
                                </p>
                        </div>
                        </div>
                </Card>

                 <Card className= "Shadow">
                    <div className="flex justify-around items-center">
                        <div className="flex items-center flex-col gap-y-2">
                            <Button
                            type="primary"
                            icon={<DollarCircleOutlined />}
                            size="large"
                            shape="circle"
                            className="!bg-indigo-500 hover:bg-indigo-600"
                            />
                            <h1 className="text-xl font-semibold text-indigo-800">
                                Balance
                            </h1>
                        </div>
                        <Divider type="vertical" className="h-24" />
                        <div>
                            <h1 className="text-3xl font-bold text-indigo-600">
                                {summary.balance ?? 0} ₹
                                </h1>
                                <p className="text-lg mt-1 text-zinc-400">
                                    {summary.balanceEstimate ?? 0} estimate
                                </p>
                        </div>
                        </div>
                </Card>
                
            </div>
            <div className="hidden md:block mt-5 grid md:grid-cols-1">
                <DailyTransactionchart transactions={chart} />
            </div>
        </div>
    )
}

export default Dashboard;