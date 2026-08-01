import { Card, DatePicker, Select, Button, Space } from 'antd';
import { useEffect, useState } from 'react';
import http from '../../../utils/http';
import useSWR from 'swr';
import fetcher from '../../../utils/fetcher';
import Loader from '../../Shared/Loader';

const { RangePicker } = DatePicker;

const ExportTransactions = () => {
    const [range, setRange] = useState(null);
    const [userId, setUserId] = useState(null);
    const [session, setSession] = useState(null);
    const { data: users } = useSWR(session?.role === 'admin' ? '/api/user/get' : null, fetcher);

    useEffect(() => {
        http.get('/api/user/session')
            .then(res => setSession(res.data))
            .catch(() => setSession(null));
    }, []);

    const downloadCSV = async () => {
        try {
            const params = [];
            if (range) {
                params.push(`start=${encodeURIComponent(range[0].startOf('day').toISOString())}`);
                params.push(`end=${encodeURIComponent(range[1].endOf('day').toISOString())}`);
            }
            if (userId) params.push(`userId=${userId}`);
            const url = `/api/transaction/download${params.length ? `?${params.join('&')}` : ''}`;
            const res = await http.get(url, { responseType: 'blob' });
            const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `transactions_export_${Date.now()}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error(err);
        }
    };

    if (!session) return <Loader />;

    return (
        <div>
            <Card title="Export Transactions to CSV" className="mb-4">
                <Space wrap>
                    <RangePicker value={range} onChange={setRange} />
                    {session.role === 'admin' && (
                        <Select
                            showSearch
                            placeholder="Select user"
                            style={{ width: 260 }}
                            allowClear
                            onChange={setUserId}
                            options={(users || []).map(u => ({ label: u.fullname || u.email, value: u._id }))}
                        />
                    )}
                    <Button type="primary" onClick={downloadCSV}>Download CSV</Button>
                </Space>
            </Card>
            <Card>
                <p>Use this module to download transactions with associated user details in CSV format.</p>
                <p>Filter by date range or select a specific user before exporting.</p>
            </Card>
        </div>
    );
};

export default ExportTransactions;
