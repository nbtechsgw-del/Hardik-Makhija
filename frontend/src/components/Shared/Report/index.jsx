import { DatePicker, Select, Button, Card, Divider } from "antd";
import { useEffect, useState } from "react";
import http from "../../../utils/http";
import useSWR from "swr";
import fetcher from "../../../utils/fetcher";
import Loader from "../Loader";
import DailyTransactionchart from "../DailyTransactions";
import { PieChart, Pie, Cell, Tooltip as RechartTooltip, ResponsiveContainer as RechartResponsiveContainer } from 'recharts';

const { RangePicker } = DatePicker;

const Report = () => {
    const [report, setReport] = useState(null);
    const [range, setRange] = useState(null);
    const [userId, setUserId] = useState(null);
    const [session, setSession] = useState(null);

    const { data: users } = useSWR(
        session && session.role === 'admin' ? "/api/user/get" : null,
        fetcher
    );

    useEffect(() => {
        http.get('/api/user/session')
        .then(res => setSession(res.data))
        .catch(() => setSession(null));
        fetchReport();
    }, []);

    const fetchReport = async (start, end, uid) => {
        try {
            setReport(null);
            let url = `/api/dashboard/report`;
            const params = [];
            if (start && end) {
                params.push(`start=${encodeURIComponent(start)}`);
                params.push(`end=${encodeURIComponent(end)}`);
            }
            if (uid) params.push(`userId=${uid}`);
            if (params.length) url += `?${params.join('&')}`;
            const res = await http.get(url);
            setReport(res.data);
        } catch (err) {
            console.error(err);
            setReport({ summary: {}, chart: [] });
        }
    }

    const exportReportCSV = () => {
        if (!report) return;
        const rows = [];
        // summary
        const s = report.summary || {};
        rows.push(["Metric","Value"].join(','));
        rows.push(["totalTransactions", s.totalTransactions || 0].join(','));
        rows.push(["totalCredit", s.totalCredit || 0].join(','));
        rows.push(["totalDebit", s.totalDebit || 0].join(','));
        rows.push(["balance", s.balance || 0].join(','));
        rows.push('');
        // chart
        rows.push(["date","total"].join(','));
        (report.chart || []).forEach(c => rows.push([c.date, c.total].join(',')));
        rows.push('');
        // breakdown
        rows.push(["breakdown byType"].join(','));
        Object.entries(report.breakdown?.byType || {}).forEach(([k,v]) => rows.push([k,v].join(',')));
        rows.push('');
        rows.push(["breakdown byPayment"].join(','));
        Object.entries(report.breakdown?.byPayment || {}).forEach(([k,v]) => rows.push([k,v].join(',')));
        rows.push('');
        rows.push(["top titles","total"].join(','));
        (report.breakdown?.byTitle || []).forEach(t => rows.push([t.title, t.total].join(',')));

        const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    const onApply = () => {
        if (range) {
            const start = range[0].startOf('day').toISOString();
            const end = range[1].endOf('day').toISOString();
            fetchReport(start, end, userId);
        } else {
            fetchReport(null, null, userId);
        }
    }

    if (!report) return <Loader />;

    const summary = report.summary || {};

    return (
        <div>
            <Card className="mb-4">
                <div className="flex gap-4 items-center">
                    <RangePicker value={range} onChange={(vals) => setRange(vals)} />
                    {session?.role === 'admin' && (
                        <Select
                            showSearch
                            placeholder="Select user"
                            style={{ width: 240 }}
                            allowClear
                            onChange={setUserId}
                            options={(users || []).map(u => ({ label: u.fullname || u.email, value: u._id }))}
                        />
                    )}
                    <Button type="primary" onClick={onApply}>Apply</Button>
                    <Button onClick={() => { setRange(null); setUserId(null); fetchReport(); }}>Reset</Button>
                </div>
            </Card>

            <div className="grid md:grid-cols-4 gap-6">
                <Card>
                    <h3>Transactions</h3>
                    <div>{summary.totalTransactions ?? 0}</div>
                </Card>
                <Card>
                    <h3>Total Credit</h3>
                    <div>{summary.totalCredit ?? 0}</div>
                </Card>
                <Card>
                    <h3>Total Debit</h3>
                    <div>{summary.totalDebit ?? 0}</div>
                </Card>
                <Card>
                    <h3>Balance</h3>
                    <div>{summary.balance ?? 0}</div>
                </Card>
            </div>

            <div className="mt-6 flex gap-4">
                <Button onClick={exportReportCSV}>Export CSV</Button>
                <div className="flex-1" />
            </div>

            <Divider />

            <div className="grid md:grid-cols-3 gap-6">
                <Card title="By Transaction Type">
                    <div style={{ width: '100%', height: 220 }}>
                        <RechartResponsiveContainer>
                            <PieChart>
                                <Pie data={Object.entries(report.breakdown?.byType || {}).map(([k,v])=>({ name:k, value:v }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label />
                                <RechartTooltip />
                            </PieChart>
                        </RechartResponsiveContainer>
                    </div>
                </Card>
                <Card title="By Payment Method">
                    <div style={{ width: '100%', height: 220 }}>
                        <RechartResponsiveContainer>
                            <PieChart>
                                <Pie data={Object.entries(report.breakdown?.byPayment || {}).map(([k,v])=>({ name:k, value:v }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label />
                                <RechartTooltip />
                            </PieChart>
                        </RechartResponsiveContainer>
                    </div>
                </Card>
                <Card title="Top Titles">
                    <div>
                        <ul>
                            {(report.breakdown?.byTitle || []).map(t => (
                                <li key={t.title}>{t.title} — {t.total}</li>
                            ))}
                        </ul>
                    </div>
                </Card>
            </div>

            <div className="mt-6">
                <DailyTransactionchart transactions={report.chart || []} />
            </div>
        </div>
    )
}

export default Report;
