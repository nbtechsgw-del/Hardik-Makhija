import { Router } from 'express';
import { createUser, login, sendEmail, forgotPassword, verifyToken, changePassword, logout,getAllUsers,updateStatus } from "./user.controller.js";
import { verifyTokenGuard } from '../middleware/guard.middleware.js';
import { AdminUserGuard } from '../middleware/guard.middleware.js';
import { AdminGuard } from '../middleware/guard.middleware.js';
const userRouter = Router();

//@POST /api/user/signup
userRouter.post("/signup", createUser);

//@POST /api/user/login
userRouter.post("/login", login);

//@GET /api/user/logout
userRouter.get("/logout", logout);

//@GET /api/user/logout
userRouter.get("/get",AdminGuard, getAllUsers);

//@GET /api/user/status
userRouter.put("/status/:id",AdminGuard, updateStatus);


//@POST /api/user/send-mail
userRouter.post("/send-mail", sendEmail);

//@POST /api/user/forgot-password
userRouter.post("/forgot-password", forgotPassword);

//@GET /api/user/session
userRouter.get("/session", AdminUserGuard, (req, res) => {
    return res.json(req.user);
});

//@POST /api/user/forgot-password
userRouter.post("/verify-token", verifyTokenGuard, verifyToken);

//@PUT /api/user/change-password
userRouter.put("/change-password", verifyTokenGuard, changePassword);



export default userRouter;