const express = require("express");
const ConnectionRequest = require("../models/connectionRequest.js");
const { userAuth } = require("../middlewares/auth.js");

const userRouter= express.Router();

userRouter.get("/user/requests/recieved", userAuth, async (req,res)=>{
    try{
        const loggedInUser= req.user;

        const recievedRequests = await ConnectionRequest.find({
            toUserId:loggedInUser._id,
            status:"interested"
        }).populate("fromUserId",["firstName","lastName","age","gender","image","skills","about"]);

        if(recievedRequests.length>0){
            return res.status(200).json({
                code:200,
                message:"Recieved requests fetched successfully",
                data:recievedRequests
            })
        }
        return res.status(404).json({
            code:404,
            message:"No data found"
        });

    }
    catch(err){
        return res.status(500).json({
            code:500,
            message:"Some error ocurred: "+err.message
        }); 
           
    }
});

userRouter.get("/user/connections", userAuth, async (req,res)=>{
    try{
        const loggedInUser= req.user;

        const connections = await ConnectionRequest.find({
            status:"accepted",
            $or:[
                {fromUserId:loggedInUser._id},
                {toUserId:loggedInUser._id}
            ]
        }).populate([
              { path: "fromUserId", select: "firstName lastName age gender image skills about" },
              { path: "toUserId", select: "firstName lastName age gender image skills about" }
            ]);

        let data = connections.map(function(val){
            if(val.fromUserId._id.equals(loggedInUser._id)) return val.toUserId; // sending the data of the person with whom i am connected 
            return val.fromUserId;
        })

        if(connections.length>0){
            return res.status(200).json({
                code:200,
                message:"Connections fetched successfully",
                data:data
            })
        }
        return res.status(404).json({
            code:404,
            message:"No data found"
        });

    }
    catch(err){
        return res.status(500).json({
            code:500,
            message:"Some error ocurred: "+err.message
        }); 
           
    }
})


module.exports=userRouter;