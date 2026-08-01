import { AppstoreAddOutlined, BarChartOutlined, DollarOutlined, LogoutOutlined, MenuOutlined } from "@ant-design/icons";
import { Button, Image, Layout, Menu, theme } from "antd";
import { useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import useSWR from "swr";
import fetcher from "../../../utils/fetcher";
import http from "../../../utils/http";
import { toast } from "react-toastify";
import Loader from "../../Shared/Loader";

const { Sider, Header, Content, Footer } = Layout;
const items = [
    {
        key: "/app/user/dashboard",
        label: "Dashboard",
        icon: <AppstoreAddOutlined />
    },
    {
        key: "/app/user/report",
        label: "Reports",
        icon: <BarChartOutlined />

    },
    {
        key: "/app/user/transactions",
        label: "Transactions",
        icon: <DollarOutlined />

    },


]
const Userlayout = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation()
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleNavigate = (menu) => {
        navigate(menu.key);
    }


    const siderStyle = {
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        insertInlineStart: 0,
        top: 0,
        bottom: 0,
        scrollbarWidth: 'thin',
        scrollbarGutter: 'stable',
    };

    const headerStyle = {
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: 0,

    }
    //logout
    const logout = async () => {
        try {
            setLoading(true);
            await http.get("/api/user/logout");
            navigate("/");
            setLoading(false);

        } catch (err) {
            setLoading(false);
            toast.error(err.response ? err.response.data.message : err.message);
        }
    }

    const{
        token: { colorBgContainer, borderRadiusLG }
    }= theme.useToken();


return (
    <Layout className="!min-h-screen">
        <Sider style={siderStyle} collapsible collapsed={open}>
            <div className="flex items-center justify-center my-4">
                <Image
                    src="/logo.jpg"
                    width={70}
                    height={70}
                    alt="logo"
                    className="rounded-full !text-center !mx-auto mb-3"
                />
            </div>
            <Menu
                defaultSelectedKeys={[pathname]}
                theme="dark"
                items={items}
                onClick={handleNavigate}
            />
        </Sider>
        <Layout>
            <Header style={headerStyle} className="flex items-center justify-between !px-5 !bg-white !shadow">
                <Button
                    onClick={() => setOpen(!open)}
                    icon={<MenuOutlined />}
                />
                <Button
                    icon={<LogoutOutlined />}
                    onClick={logout}
                    loading={loading}
                />
            </Header>
            <Content
                style={{
                    margin: '4px 8px',
                    padding: 4,
                    minHeight: 280,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                }}
                >
                <Outlet />
            </Content>

        </Layout>
    </Layout>
)

}
export default Userlayout;