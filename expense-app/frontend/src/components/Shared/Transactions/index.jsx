import { Button, Card, Input, Popconfirm, Table,Form, Select, DatePicker } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { EditOutlined } from "@ant-design/icons";
import { DeleteOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { Modal } from "antd";
import { useState } from "react";
import http from "../../../utils/http";
import useSWR, { mutate } from "swr";
import fetcher from "../../../utils/fetcher";
import { formatDate } from "../../../utils/date";



const { Item } = Form;


const Transactions = () => {
    const [transactionForm]=Form.useForm();

    const [edit, setEdit] = useState(null);
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [transactionTypeFilter, setTransactionTypeFilter] = useState(null);
    const [paymentMethodFilter, setPaymentMethodFilter] = useState(null);
    const [dateRange, setDateRange] = useState(null);


    const columns = [
        {
            title:" Transaction Type",
            dataIndex: "transactionType",
            key: "transactionType",
            className:"capitalize",
        },
        {
            title:" Title",
            dataIndex: "title",
            key: "title",
            className:"capitalize",
        },
        {
            title:" Amount",
            dataIndex: "amount",
            key: "amount",
            className:"capitalize",
        },
        {
            title:" Payment Method",
            dataIndex: "paymentMethod",
            key: "paymentMethod",
            className:"capitalize",
        },
        {
            title:"Notes",
            dataIndex: "notes",
            key: "notes",
            className:"capitalize",
        },
        {
            title:" Date",
            dataIndex: "createdAt",
            key: "createdAt",
            render : (createdAt) => formatDate(createdAt)
        },
        {
        
            title:" Action",
            key: "action",
            fixed: "right",
            render:(_, obj) => (
                <div className="flex gap-1">
                    <Popconfirm
                        title="Are you sure to delete this transaction?"
                        description="Once you update, You can also re-update it later."
                        onCancel={() => toast.info("No Changes occur")}
                        onConfirm={()=> onEditTransaction(obj)}
                    >
                        <Button 
                        type="text"
                        className="!bg-green-100 !text-green-500"
                        icon={<EditOutlined />}
                        />
                    </Popconfirm>
                    <Popconfirm
                        title="Are you sure to delete this transaction?"
                        description="Once you delete, You can also re-add it later."
                        onCancel={() => toast.info("Your data is safe!")}
                        onConfirm={() => onDelete(obj._id)}
                    >
                        <Button 
                        type="text"
                        className="!bg-red-100 !text-red-500"
                        icon={<DeleteOutlined />}
                        />
    

                    </Popconfirm>

                </div>
            )
        }

    ]
 
    const key = `/api/transaction/get?page=${page}&limit=${pageSize}` +
        (search ? `&search=${encodeURIComponent(search)}` : "") +
        (transactionTypeFilter ? `&transactionType=${transactionTypeFilter}` : "") +
        (paymentMethodFilter ? `&paymentMethod=${paymentMethodFilter}` : "") +
        (dateRange ? `&start=${encodeURIComponent(dateRange[0].startOf('day').toISOString())}&end=${encodeURIComponent(dateRange[1].endOf('day').toISOString())}` : "");

    const { data: resp, error, isLoading } = useSWR(key, fetcher);
    const transactions = resp?.data || [];
    const total = resp?.total || 0;

    const onFinish = async (values) => {
        try {
            setLoading(true);
            await http.post("/api/transaction/create", values);
            toast.success("Transaction added successfully");
            mutate(key)
            setModal(false);
            transactionForm.resetFields();
            }catch (err) {
        toast.error(err?.response?.data?.message || err.message);
    }finally {
        setLoading(false);
    }
}
const onUpdate = async (values) => {
        try {
            setLoading(true);
            await http.put(`/api/transaction/update/${edit._id}`, values);
            toast.success("Transaction updated successfully");
            mutate(key)
            setModal(false);
            setEdit(null);
            transactionForm.resetFields();
            }catch (err) {
        toast.error(err?.response?.data?.message || err.message);
    }finally {

        setLoading(false);
    }
}

    const onDelete= async(id)=> {
           try {
            setLoading(true);
            await http.delete(`/api/transaction/delete/${id}`);
            toast.success("Transaction deleted successfully !");
            mutate(key)
            }catch (err) {
        toast.error(err?.response?.data?.message || err.message);
    }finally {
        setLoading(false);
    }
}

    const onEditTransaction = (obj) => {
        setEdit(obj);
        transactionForm.setFieldsValue(obj);
        setModal(true);
    }

    const exportCSV = () => {
        const rows = transactions || [];
        if (!rows.length) return toast.info("No transactions to export");
        const header = ["Title","Amount","Type","PaymentMethod","Note","Date"];
        const escape = (v) => {
            if (v === undefined || v === null) return '';
            const s = String(v);
            return '"' + s.replace(/"/g, '""') + '"';
        }
        const csvRows = rows.map(r => [
            escape(r.title),
            escape(r.amount),
            escape(r.transactionType),
            escape(r.paymentMethod),
            escape(r.notes),
            escape(formatDate(r.createdAt))
        ].join(','));
        const csv = [header.join(',')].concat(csvRows).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
       <div>
        <div className="grid">
            <Card
            title="Transaction List"
            style={{overflowX: "auto"}}
                    extra={
                <div className="mt-2 md:mt-0 flex flex-col md:flex-row gap-3">
                    <Input
                        placeholder="Search by title, note or amount"
                        prefix={<SearchOutlined />}
                        onPressEnter={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                    <Select placeholder="Type" allowClear style={{ width: 140 }} onChange={(v)=>{ setTransactionTypeFilter(v); setPage(1); }} options={[{value:'cr', label:'Credit'},{value:'dr', label:'Debit'}]} />
                    <Select placeholder="Payment" allowClear style={{ width: 140 }} onChange={(v)=>{ setPaymentMethodFilter(v); setPage(1); }} options={[{value:'Cash',label:'Cash'},{value:'Online',label:'Online'}]} />
                    <DatePicker.RangePicker onChange={(vals)=>{ setDateRange(vals); setPage(1); }} />
                    <Button onClick={exportCSV} type="default">Export CSV</Button>
                    <Button
                        type="text"
                        className="!font-bold !bg-blue-500 !text-white !hover:bg-blue-600"
                        onClick={() => {setModal(true)}}
                        >
                            Add New Transaction

                    </Button>

                </div>
            }
            >
                    <Table
                    columns={columns}
                    dataSource={transactions}
                    scroll={{x: "max-content"}}
                    loading={isLoading}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        showSizeChanger: true,
                        onChange: (p, ps) => { setPage(p); setPageSize(ps); }
                    }}
                    rowKey={(r) => r._id}
                />
            

            </Card>
        </div>
        <Modal
        open={modal}
        onCancel={() => setModal(false)}
        title="Add New Transaction"
        footer={null}
        >
            <Form
            Layout="vertical"
            form={transactionForm}
            onFinish={edit? onUpdate: onFinish}
           >
            <div className="grid md:grid-cols-2 gap-x-3">
                <Item
                label="Transaction Type"
                name="transactionType"
                rules={[{required: true, message: "Please select transaction type"}]}
                >
                    <Select
                    placeholder="transaction type"
                    options={[
                        {value: "cr", label: "Credit"},
                        {value: "dr", label: "Debit"},

                    ]}
                    />
                </Item>
                <Item
                label="Amount"
                name="amount"
                rules={[{required: true, message: "Please enter amount"}]}
                >
                    <Input placeholder="amount" type="number"/>
                </Item>
                <Item
                label="Title"
                name="title"
                rules={[{required: true, message: "Please enter title"}]}
                >
                    <Input placeholder="title"/>
                </Item>
                 <Item
                label="Payment Type"
                name="paymentMethod"
                rules={[{required: true, message: "Please select payment type"}]}
                >
                    <Select
                    placeholder="payment Method"
                    options={[
                        {value: "Cash", label: "Cash"},
                        {value: "Online", label: "Online"},

                    ]}      
                    />
                </Item>
            </div>
            <Item
            label="Notes"
            name="notes"
            rules={[{required: true, message: "Please enter notes"}]}
            >
                <Input.TextArea placeholder="notes" rows={4}/>

            </Item>
            <Item
            className="flex justify-end items-center"
            >
            <Button
            loading={loading}
            type="text"
            htmlType="submit"
            className={`!font-semibold !text-white ${edit ? "!bg-red-500" : "!bg-blue-500"}`}
            >
                {edit ? "Update" : "Submit"}
            </Button>
            
            </Item>
         </Form>

        </Modal>
       </div>
    )
}

export default Transactions;
