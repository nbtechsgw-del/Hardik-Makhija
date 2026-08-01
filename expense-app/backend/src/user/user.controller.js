import UserModel from "./user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/mail.js";
import { otpTemplate } from "../utils/otp.template.js"
import { forgotPasswordTemplate } from "../utils/forgot-template.js";
import { generateOTP } from "../utils/generate.otp.js";

export const createUser = async(req, res) => {
    try {
        const data = req.body;
        const user = new UserModel(data);
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const sendEmail = async(req, res) => {
    try {
        const { email } = req.body;
        const OTP = generateOTP();
        const isEmail = await UserModel.findOne({ email });
        if (isEmail)
            return res.status(400).json({ message: "It has been already registered !" });
        await sendMail(email, "OTP For Signup", otpTemplate(OTP))
        res.json({
            message: "Email sent successfully",
            otp: OTP,
            success: true
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const createToken = async(user) => {
    const payload = {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role
    }

    const token = await jwt.sign(payload, process.env.AUTH_SECRET, { expiresIn: '1d' });
    return token;

}

export const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found !" });
        const isLoged = await bcrypt.compare(password, user.password);
        if (!isLoged)
            return res.status(401).json({ message: "Invalid credentials !" });
        // allow admins to login even if their `status` is false
        if (!user.status && user.role !== 'admin')
            return res.status(403).json({ message: "You are not an active member !" });
        const token = await createToken(user);
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.ENVIRONMENT !== "DEV",
            sameSite: process.env.ENVIRONMENT === "DEV" ? "lax" : "none",
            path: "/",
            domain: undefined,
            maxAge: 86400000,
        });
        res.json({ message: "Login successful !", role: user.role });




    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


export const logout = async(req, res) => {
    try {
         res.cookie('authToken', null, {
        httpOnly: true,
        secure: process.env.ENVIRONMENT !== "DEV",
        sameSite: process.env.ENVIRONMENT === "DEV" ? "lax" : "none",
        path: "/",
        domain: undefined,
        maxAge: 0,


         });
         res.status(200).json({ message: "Logout successful !" });

    } catch (err) {
        res.status(501).json({ message: err.message || "Logout failed !"

         });
    }
}

export const forgotPassword = async(req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User doesn't exists !" });
        if (!user.status)
            return res.status(404).json({ message: "You are not active member !" });

        const token = await jwt.sign({ id: user._id }, process.env.FORGOT_TOKEN_SECRET, { expiresIn: '15m' });
        console.log("[forgot-password] generated token:", token);
        console.log("[forgot-password] request origin:", req.get('origin'));
        console.log("[forgot-password] reset link:", `${req.get('origin') || process.env.DOMAIN}/forgot-password?token=${token}`);
        // Prefer the request origin (frontend) when available so the link opens the frontend
        const frontDomain = process.env.DOMAIN || req.get('origin');
        const link = `${frontDomain}/forgot-password?token=${token}`;
        const sent = await sendMail(
            email,
            "Expense Tracker - Forgot Password ?",
            forgotPasswordTemplate(user.fullname, link)
        );
        if (!sent)
            return res.status(424).json({ message: "Email not sent !" });
        res.json({ message: "please check your email to forgot password !" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const changePassword = async(req, res) => {
    try {
        const { password } = req.body;
        if (!password)
            return res.status(400).json({ message: "Password is required" });

        const hashedPassword = await bcrypt.hash(password.toString(), 12);
        await UserModel.findByIdAndUpdate(req.user.id, { password: hashedPassword });

        res.json({ message: "Password changed successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const verifyToken = async(req, res) => {
    try {
        res.json("Verification Successful !");
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({
            message: err.message || "Internal server error"
        });
    }
};

export const updateStatus = async (req, res) => {
    try{
        const {status} = req.body;
        const { id } = req.params;
        const user = await UserModel.findByIdAndUpdate(id, { status }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found !",
            user 
        });

        }

        res.json(user);
    }catch(err){
        res.status(500).json({
            message: err.message || "Internal server error"
        });
    }
}