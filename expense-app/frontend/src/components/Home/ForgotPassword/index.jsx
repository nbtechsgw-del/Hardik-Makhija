    import { Card,Form,Input,Button } from "antd";
    import {LockOutlined, UserOutlined} from "@ant-design/icons";
    import {Link, useSearchParams} from "react-router-dom";
    import {toast} from "react-toastify";
    import { useState } from "react";
    import { useEffect } from "react";
    import {useNavigate} from "react-router-dom";
    import Homelayout from "../../../layout/Homelayout";
    import http from "../../../utils/http";

    const {Item} = Form;
    const ForgotPassword = () => {
        const navigate = useNavigate();
        const [params]= useSearchParams();

        const [forgotForm] = Form.useForm();
        const [rePasswordForm] = Form.useForm();
        const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(() => {
        return params.get("token") || new URLSearchParams(window.location.search).get("token");
    });

    useEffect(() => {
        const tok = params.get("token") || new URLSearchParams(window.location.search).get("token");
        setToken(tok);
        }, [params]);

        const checkToken = async (tok) => {
            try {
                await http.post("/api/user/verify-token", {}, {
                    headers: {
                        Authorization: `Bearer ${tok}`
                    }
                });
                setToken(tok);
            } catch (err) {
                setToken(null);
            }
        }


        const onFinish = async (values) => {
                try {
                    setLoading(true);
                    await http.post("/api/user/forgot-password", values);
                                toast.success("Password reset link sent to your email!")

                } catch (err) {
                toast.error(err.response ? err.response.data.message : err.message)
                } finally {
                    setLoading(false);
                }
            }

          const onChangePassword = async (values) => {
                try {
                    if (values.password !== values["rePassword"])
                        return toast.warning("Password and re-password not matched");
                    setLoading(true);
                    await http.put("/api/user/change-password", values,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                    toast.success("Password changed successfully! Redirecting to login..." )
                    setTimeout(() => {
                        navigate("/");
                    },5000);


                } catch (err) {
                toast.error(err.response ? err.response.data.message : err.message)
                } finally {
                    setLoading(false);
                }
            }




        return (
           <Homelayout>
             <div className="flex">
                <div className="w-1/2 hidden md:flex items-center justify-center ">
                <img
                src="/exp-img.jpg"
                alt="Bank"
                className="w-4/5 object-contain"
                />
                </div>
                <div className="w-full md:w-1/2 flex items-center justify-center p-2 md:p-6 bg-white">
                    <Card className= "w-full max-w-sm shadow-xl">
                <h2 className = "font-bold text-[#FF735C] text-2xl mb-6">
                {
                    token ?
                    "Change Password"
                    :
                    "Forgot Password"
                }
                </h2>
                {
                    token ?
                     <Form
                name="Login-form"
                layout="vertical"
                onFinish={onChangePassword}
                form={rePasswordForm}
                >
                    <Item
                                        name="password"
                                        label= "Password:"
                                        rules={[{required: true}]}
                                        >

                                            <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="Enter Your Password"
                                            />
                                        </Item>
                                        <Item
                    name="rePassword"
                    label= "re Enter Password:"
                    rules={[{required: true}]}
                    >

                        <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Enter Your Password"
                        />
                    </Item>
                    <Item>
                        <Button
                            type="text"
                            htmlType="submit"
                            block
                            className="!bg-[#FF735C] !text-white !font-bold"
                            loading={loading}
                            >
                                Change Password
                        </Button>
                    </Item>

                </Form>
                :
                    <Form
                    name="Login-form"
                    layout="vertical"
                    onFinish={onFinish}
                    form={forgotForm}
                    >
                        <Item
                        name="email"
                        label= "Email:"
                        rules={[{required: true}]}
                        >

                            <Input
                            prefix={<UserOutlined />}
                            placeholder="Enter Your Email"
                            />
                        </Item>
                        <Item>
                            <Button
                                type="text"
                                htmlType="submit"
                                block
                                className="!bg-[#FF735C] !text-white !font-bold"
                                loading={loading}
                                >
                                    Submit
                            </Button>
                        </Item>

                    </Form>
                }







                <div className ="flex items-center justify-between">
                    <Link
                    style={{textDecoration: "underline"}}
                    to="/"
                    className="!text-[#FF735C] font-bold"
                    >
                        Sign In
                    </Link>

                    <Link
                    style={{textDecoration: "underline"}}
                    to="/signup"
                    className="!text-[#FF735C] font-bold"
                    >
                        Don't have an account?
                    </Link>
                </div>



            </Card>
                </div>
            </div>
           </Homelayout>
        )
    }

    export default ForgotPassword;