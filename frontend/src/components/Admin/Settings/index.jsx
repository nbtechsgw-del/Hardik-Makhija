import { Card, Form, Input, Button, message } from 'antd';
import { useEffect, useState } from 'react';
import http from '../../../utils/http';
import Loader from '../../Shared/Loader';

const Settings = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const loadSettings = async () => {
        try {
            const res = await http.get('/api/settings');
            form.setFieldsValue(res.data);
        } catch (err) {
            message.error(err.response?.data?.message || err.message);
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            await http.put('/api/settings', values);
            message.success('Settings saved successfully.');
        } catch (err) {
            message.error(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <Loader />;

    return (
        <Card title="Admin Settings">
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item name="appName" label="App Name" rules={[{ required: true, message: 'App name is required' }]}>
                    <Input placeholder="Expense App" />
                </Form.Item>
                <Form.Item name="supportEmail" label="Support Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
                    <Input placeholder="support@example.com" />
                </Form.Item>
                <Form.Item name="supportMobile" label="Support Mobile" rules={[{ required: true, message: 'Enter a contact number' }]}>
                    <Input placeholder="e.g. +1234567890" />
                </Form.Item>
                <Form.Item name="domain" label="Frontend Domain" rules={[{ required: true, message: 'Frontend domain is required' }]}>
                    <Input placeholder="http://localhost:5173" />
                </Form.Item>
                <Form.Item name="currencySymbol" label="Currency Symbol" rules={[{ required: true, message: 'Currency symbol is required' }]}>
                    <Input placeholder="$" />
                </Form.Item>
                <Form.Item name="defaultTransactionLimit" label="Default Transaction Limit" rules={[{ required: true, type: 'number', message: 'Limit is required' }]}>
                    <Input type="number" placeholder="20" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Save Settings
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default Settings;
