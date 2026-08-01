import { Card, Form, Input, Button } from "antd";
import { LockOutlined, UserOutlined, PhoneOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Homelayout from "../../../layout/Homelayout";
import { useState } from "react";
import {toast} from "react-toastify";
import http from "../../../utils/http";

const { Item } = Form;
const Signup = () => {
    const [signupForm] = Form.useForm();

    const [formData, setFormData] = useState(null);
    const [otp, setOtp] = useState(null);
    const [loading, setLoading] = useState(false);




    const onFinish = async (values) => {
        try {
            setLoading(true);
            const { data } = await http.post("/api/user/send-mail", values);
            setOtp(data.otp);
            setFormData(values);
        } catch (err) {
          toast.error(err.response ? err.response.data.message : err.message)

            setOtp(null);
            setFormData(null);
        } finally {
            setLoading(false);
        }
    }


    const onSignup = async (values) => {
        try {
            if (Number(values.otp)!== Number(otp))
                return toast.error("OTP not matched");
           setLoading(true);
            await http.post("/api/user/signup", formData);
            toast.success("Signup success");
             setOtp(null);
            setFormData(null);
            signupForm.resetFields();

        } catch (err) {

            toast.error(err.response ? err.response.data.message : err.message)
        } finally {
            setLoading(false);
        }
    };
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
                    <Card className="w-full max-w-sm shadow-xl">
                        <h2 className="font-bold text-[#FF735C] text-2xl mb-6">
                            Track Your Expense
                        </h2>
                        {
                            otp ?
                                <Form
                                    name="otp-form"
                                    layout="vertical"
                                    onFinish={onSignup}
                                >
                                    <Item
                                        name="otp"
                                        label="OTP:"
                                        rules={[{ required: true }]}
                                    >


                                        <Input.OTP
                                            prefix={<UserOutlined />}
                                            placeholder="Enter Your Username"
                                        />
                                    </Item>





                                    <Item>
                                        <Button
                                            loading={loading}
                                            type="text"
                                            htmlType="submit"
                                            block
                                            className="!bg-[#FF735C] !text-white !font-bold"
                                        >
                                            verify Now
                                        </Button>
                                    </Item>

                                </Form>

                                :


                                <Form
                                    name="Signup-form"
                                    layout="vertical"
                                    onFinish={onFinish}
                                    form={signupForm}
                                >
                                    <Item
                                        name="email"
                                        label="Username:"
                                        rules={[{ required: true }]}
                                    >

                                        <Input
                                            prefix={<UserOutlined />}
                                            placeholder="Enter Your Username"
                                        />
                                    </Item>

                                    <Item
                                        name="fullname"
                                        label="Fullname:"
                                        rules={[{ required: true }]}
                                    >

                                        <Input
                                            prefix={<UserOutlined />}
                                            placeholder="Enter Your Fullname"
                                        />
                                    </Item>


                                    <Item
                                        name="mobile"
                                        label="Mobile Number:"
                                        rules={[{ required: true }]}
                                    >

                                        <Input
                                            prefix={<PhoneOutlined />}
                                            placeholder="Enter Your Mobile Number"
                                        />
                                    </Item>


                                    <Item
                                        name="password"
                                        label="Password:"
                                        rules={[{ required: true }]}
                                    >

                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="Enter Your Password"
                                        />
                                    </Item>
                                    <Item>
                                        <Button
                                            loading={loading}
                                            type="text"
                                            htmlType="submit"
                                            block
                                            className="!bg-[#FF735C] !text-white !font-bold"
                                        >
                                            SignUp
                                        </Button>
                                    </Item>

                                </Form>
                        }




                        <div className="flex items-center justify-between">
                            <div></div>
                            <Link
                                style={{ textDecoration: "underline" }}
                                to="#"
                                className="!text-[#FF735C] font-bold"
                            >

                            </Link>

                            <Link
                                style={{ textDecoration: "underline" }}
                                to="/"
                                className="!text-[#FF735C] font-bold"
                            >
                                Already have an account?
                            </Link>
                        </div>



                    </Card>
                </div>
            </div>
        </Homelayout>


    )
}

export default Signup;