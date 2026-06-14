const express=require("express");
const authRouter=express.Router();
const {register,login,logout,adminRegister}=require("../controllers/userAuthentication");
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");


// register
// login
// logout
// getprofile

authRouter.post("/register",register);
authRouter.post('/login',login);
authRouter.post('/logout',userMiddleware,logout);   //usermiddleware ye chcek krta hai ki Agar user properly authenticated hai AND logout nahi hua hai tabhi next route pe jaane do
authRouter.post('/admin/register',adminMiddleware,adminRegister)
// authRouter.get('/getProfile',getProfile)

module.exports=authRouter;