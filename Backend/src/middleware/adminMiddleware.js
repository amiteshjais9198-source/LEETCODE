const jwt = require("jsonwebtoken");
const User = require("../model/user");
const redisClient = require("../config/redis")

//this whole is same as usermiddleware but the only thing which is differnet is that it also check for admin role

//this whole code is to validate the user 
const adminMiddleware = async (req, res, next) => {

    try {
        const { token } = req.cookies;
        if (!token)    //dekh rhe user login hai ki nhi 
            throw new Error("the token is not present");

        const payload = jwt.verify(token, process.env.JWT_KEY);   //if the token is valid it will give the data that is stored in it 
 
        const { _id } = payload;
        

        if (!_id)
            throw new Error("Invalid token");

        if(payload.role!="admin")
            throw new Error("Invalid credentials")    //in this we have added one extra checkpoint of checking wheather role is admin if not then show error 
        

        const result = await User.findById(_id);     //dekh rhe ki user hai ki nhi database me 
        if (!result)
            throw new Error("User does not exist");

        //ye dekh rhe ki redis ke blocklist me to nhi hai token 
        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked)
            throw new Error("Invalid token");

        req.result = result;

        next();

    }
    catch(err) {
        res.send("Error msg:"+ err);
    }
}

module.exports=adminMiddleware;