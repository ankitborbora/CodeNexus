const express= require("express");
const connectionRouter = express.Router();
const { userAuth } = require("../middlewares/auth.js");
const User = require("../models/user.js");
const ConnectionRequest = require("../models/connectionRequest.js");

connectionRouter.post("/request/send/:status/:toUserId",userAuth,async (req,res)=>{
    try{
        let fromUserId=req.user._id;
        let status=req.params.status;
        let toUserId= req.params.toUserId;

        let allowedStatus=["interested","ignored"];

        if(!status || !allowedStatus.includes(status)){
            return res.status(400).json({
                code:400,
                message:"Invalid status type for this api"
            });
        }

        let checkToUserId= await User.findById(toUserId);

        if(!checkToUserId){
            return res.status(400).json({
                code:400,
                message:"Invalid user id"
            });
        }

        let checkExistingRequest = await ConnectionRequest.findOne({
            $or:[
                {fromUserId,toUserId},
                {fromUserId:toUserId, toUserId:fromUserId}
            ]
        });

        if(checkExistingRequest){
            return res.status(201).json({
                code:201,
                message:"Connection request already exists"
            });
        }

        let createRequest= await ConnectionRequest.create({fromUserId,toUserId,status});

        if(createRequest){
            return res.status(200).json({
                code:200,
                message:"Request added successfully",
                data:createRequest
            });
        }
        return res.status(400).json({
                code:400,
                message:"Unable to add request"
        });


    }
    catch(err){
        return res.status(500).json({
            code:500,
            message:"Some error ocurred: "+err.message
        }); 
           
    }
});

module.exports=connectionRouter;