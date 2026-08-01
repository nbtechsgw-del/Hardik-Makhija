import { Button, Card, Input, Popconfirm, Table,Form, Select } from "antd";
import { SearchOutlined, EyeOutlined,EyeInvisibleOutlined } from "@ant-design/icons";
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


const Users = () => {
    const [transactionForm]=Form.useForm();

    const [edit, setEdit] = useState(null);
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const columns = [
        {
            title:"Role",
            dataIndex: "role",
            key: "role",
            className:"capitalize",
        },
        {
            title:" Mobile",
            dataIndex: "mobile",
            key: "mobile",
            className:"capitalize",
        },
         {
            title:" Email",
            dataIndex: "email",
            key: "email",
            className:"capitalize",
        },
        {
            title:" Date",
            dataIndex: "createdAt",
            key: "createdAt",
            className:"capitalize",
            render : (date) => formatDate(date)
        },
        {
            title:" Payment Method",
            dataIndex: "paymentMethod",
            key: "paymentMethod",
            className:"capitalize",
        },
        {
            title:"Status",
            dataIndex: "status",
            key: "status",
            className:"capitalize",
            render: (status, obj) => (
                <Button
                    shape="circle"
                    icon={<EyeOutlined />}
                    onClick={() => onStatus(obj)}
                    loading={loading}
                    style={{
                        backgroundColor: status ? '#10b981' : '#ef4444',
                        color: '#ffffff',
                        border: 'none'
                    }}
                />
            )
        },
      

    ]
 
    const { data: users, error, isLoading } = useSWR(
        "/api/user/get",
        fetcher

    )

    const dataSource = Array.isArray(users) ? users : [];

    const onStatus= async(obj)=> {
           try {
            setLoading(true);
            await http.put(`/api/user/status/${obj._id}`, { status: !obj.status });
            toast.success("User status updated successfully !");
            mutate("/api/user/get")
            }catch (err) {
        toast.error(err?.response?.data?.message || err.message);
    }finally {
        setLoading(false);
    }
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
                        placeholder="Search by all..."
                        prefix={<SearchOutlined />}         
                    />

                </div>
            }
            >
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="_id"
                    scroll={{x: "max-content"}}
                    loading={isLoading}
                />
            

            </Card>
        </div>
        
       </div>
    )
}

export default Users;
