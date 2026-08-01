import jwt from "jsonwebtoken";
import UserModel from "../user/user.model.js";

export const verifyTokenGuard = async(req, res, next) => {
    const authorization = req.headers['authorization'];
    if (!authorization)
        return res.status(400).send("Bad Request !");
    const [type, token] = authorization.split(" ");

    if (type !== "Bearer")
        return res.status(400).send("Bad Request !");

    const payload = await jwt.verify(token, process.env.FORGOT_TOKEN_SECRET);
    if(payload.role !== "user" && payload.role !== "admin")
        return invalid(res);
    req.user = payload;
    next();

}
const invalid = async(res) => {
    res.cookie('authToken', null, {
        httpOnly: true,
        secure: process.env.ENVIRONMENT !== "DEV",
        sameSite: process.env.ENVIRONMENT === "DEV" ? "lax" : "none",
        path: "/",
        domain: undefined,
        maxAge: 0,
    });
    return res.status(400).json({ message: "Invalid session" });
}
export const AdminUserGuard = async(req, res, next) => {
    const { authToken } = req.cookies;
    if (!authToken)
        return invalid(res)

    const payload = await jwt.verify(authToken, process.env.AUTH_SECRET);
    if (payload.role !== "user" && payload.role !== "admin")
        return invalid(res);

    const dbUser = await UserModel.findById(payload.id);
    if (!dbUser || (!dbUser.status && payload.role !== 'admin')) return invalid(res);

    req.user = payload;
    next();

}

export const AdminGuard = async(req, res, next) => {
    const { authToken } = req.cookies;
    if (!authToken)
        return invalid(res)

    const payload = await jwt.verify(authToken, process.env.AUTH_SECRET);
    if ( payload.role !== "admin")
        return invalid(res);

    const dbUser = await UserModel.findById(payload.id);
    if (!dbUser || (!dbUser.status && payload.role !== 'admin')) return invalid(res);

    req.user = payload;
    next();

}