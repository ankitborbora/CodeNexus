const jwt = require("jsonwebtoken");
const User = require("../models/user.js");



const userAuth= async (req,res,next)=>{

    try{

    let { token } = req.cookies;
    
    if(!token){
        return res.status(401).json({
            code:401,
            message:"Invalid token"
        });
    }

    const decoded= await jwt.verify(token,"nodejsdev");
    let data = await User.findOne({_id:decoded._id});

    if(!data){
        return res.status(400).json({
            code:400,
            message:"User not found"
        });
    }

    req.user=data;
    next();
    

    }
    catch(err){
        return res.status(500).json({
            code:500,
            message:"Some error ocurred: "+err.message
        }); 
    }

}

module.exports={userAuth};