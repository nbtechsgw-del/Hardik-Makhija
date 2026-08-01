import { Card, DatePicker, Select, Button, Divider } from 'antd';
import { useEffect, useState } from 'react';
import http from "../../../utils/http";
import DailyTransactionchart from '../../Shared/DailyTransactions';
import Loader from '../../Shared/Loader';
import fetcher from '../../../utils/fetcher';
import useSWR from 'swr';
import { PieChart, Pie, Tooltip as RechartTooltip, ResponsiveContainer as RechartResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

const { RangePicker } = DatePicker;

const KPI = ({ label, value }) => (
    <Card>
        <h4 className="text-sm text-gray-500">{label}</h4>
        <div className="text-2xl font-semibold">{value}</div>
    </Card>
);

const Analytics = () => {
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
            setReport({ summary: {}, chart: [], breakdown: {} });
        }
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

    const s = report.summary || {};
    const byType = Object.entries(report.breakdown?.byType || {}).map(([name, value]) => ({ name, value }));
    const byPayment = Object.entries(report.breakdown?.byPayment || {}).map(([name, value]) => ({ name, value }));

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

            <div className="grid md:grid-cols-4 gap-4">
                <KPI label="Transactions" value={s.totalTransactions ?? 0} />
                <KPI label="Total Credit" value={s.totalCredit ?? 0} />
                <KPI label="Total Debit" value={s.totalDebit ?? 0} />
                <KPI label="Balance" value={s.balance ?? 0} />
            </div>

            <div className="mt-6 grid md:grid-cols-3 gap-6">
                <Card title="Daily Transactions">
                    <DailyTransactionchart transactions={report.chart || []} />
                </Card>

                <Card title="By Transaction Type">
                    <div style={{ width: '100%', height: 240 }}>
                        <RechartResponsiveContainer>
                            <PieChart>
                                <Pie data={byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label />
                                <RechartTooltip />
                            </PieChart>
                        </RechartResponsiveContainer>
                    </div>
                </Card>

                <Card title="By Payment Method">
                    <div style={{ width: '100%', height: 240 }}>
                        <RechartResponsiveContainer>
                            <PieChart>
                                <Pie data={byPayment} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label />
                                <RechartTooltip />
                            </PieChart>
                        </RechartResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Divider />

            <Card title="Top Titles">
                <ul>
                    {(report.breakdown?.byTitle || []).map(t => (
                        <li key={t.title}>{t.title} — {t.total}</li>
                    ))}
                </ul>
            </Card>
        </div>
    )
}

export default Analytics;
