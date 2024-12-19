require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require('../models/userModel');

verifyAdmin = async(req,res)=>{
    let token = req.cookie.token;

    if(token){
        try {
            const decode = jwt.verify(token,process.env.JWT_SECRET);

            await User.findById(decode.id).select("-password");
            next();


        } catch (error) {
            console.log(error);
            
            console.log("Not authorized , token failed");
            res.status(401).json({message:"Not authorized token failed"})
        }
    }else{
        res.status(401).json({message:"Not authorized , no token"});
        console.log("Not authorized , no token");
    }
}

module.exports = {verifyAdmin};