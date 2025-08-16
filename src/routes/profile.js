const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const User = require("../models/user.js");
const { validateProfileEdit } = require("../utils/validation.js");
const validator = require("validator");
const bcrypt = require("bcrypt");



const profileRouter = express.Router();

profileRouter.get("/profile/view",userAuth, async (req,res)=>{
    
    try{

        let data = req.user;

        return res.status(200).json({
            code:200,
            message:"Data fetched successfully",
            data
        });

    }
    catch(err){
        return res.status(500).json({
            code:500,
            message:"Some error ocurred: "+err.message
        }); 
    }
});

profileRouter.patch("/profile/edit", userAuth, async (req,res)=>{
    
    try{
        if(!validateProfileEdit(req.body)){
            return res.status(400).json({
                code:400,
                message:"Invalid edit request for password"
            });
        }

        let loggedInUser= req.user;
        Object.keys(req.body).forEach(function(key){
            loggedInUser[key]=req.body[key];
        });

        let update= await loggedInUser.save();

        if(update){
            return res.status(200).json({
                code:200,
                message:"Data updated successfully"
            });
        }
        
        return res.status(400).json({
            code:400,
            message:"Unable to update the user data"
        });

    }
    catch(err){
        return res.status(500).json({
            code:500,
            message:"Some error ocurred: "+err.message
        }); 
    }
});

profileRouter.patch("/profile/reset-password", userAuth, async (req,res)=>{

    try{
        let loggedInUser = req.user;
        const { currentPassword, newPassword} = req.body;
        if(!validator.isStrongPassword(newPassword)) throw new Error("Enter a strong password");

        let checkCurrentPassword = await loggedInUser.validatePassword(currentPassword);

        if(checkCurrentPassword){
            let newHashedPassword = await bcrypt.hash(newPassword,10);
            loggedInUser.password=newHashedPassword;
            let updatePassword=await loggedInUser.save();
            if(updatePassword){
                return res.status(200).json({
                    code:200,
                    message:"Password updated successfully"
                });
            }
            return res.status(400).json({
                code:400,
                message:"Unable to update the password"
            });

        }

        return res.status(400).json({
            code:400,
            message:"Current password is wrong"
        });
        
    }
    catch(err){
        return res.status(500).json({
            code:500,
            message:"Some error ocurred: "+err.message
        });
    }

});

profileRouter.get("/feed",async (req,res)=>{

    try{
        let users = await User.find({});

        if(users.length>0){
            return res.status(200).json({
                code:200,
                message:"Data found successfully",
                data: users
            });
        }

        return res.status(404).json({
            code:404,
            message:"Data not found"
        });
    }
    catch(err){
        return res.status(500).json({
            code:500,
            message:"Some error ocurred: "+err.message
        }); 
    }
    


});

profileRouter.get("/user", async(req,res)=>{

    let { email } = req?.body;

    try{

        let user = await User.findOne({emailId:email});

        if(user){
            return res.status(200).json({
                code:200,
                message:"Data found successfully",
                data: user
            });
        }

        return res.status(404).json({
            code:404,
            message:"Data not found"
        });
    }
    catch(err){
        return res.status(500).json({
            code:500,
            message:"Some error ocurred: "+err.message
        }); 
    }

});

profileRouter.delete("/delete",async (req,res)=>{
    try{

        let {userId}= req?.body;

        let deletedDoc = await User.findByIdAndDelete(userId);

        if(deletedDoc){
            return res.status(200).json({
                code:200,
                message:"Data deleted successfully"
            });
        }
        return res.status(400).json({
            code:400,
            message:"Unable to delete data"
        });

    }
    catch(err){
        return res.status(500).json({
            code:500,
            message:"Some error ocurred: "+err.message
        }); 
    }

});

profileRouter.patch("/update/:userId",async (req,res)=>{

    let userId= req.params?.userId;

    if(!userId){
        return res.status(400).json({
            code:400,
            message:"Please provide a valid userId"
        });
    }

    try{

        let data = req?.body;

        Object.keys(data).forEach(function(val){
            if(val=="emailId")throw new Error("Update ot allowed for email");
        });
        let update = await User.findByIdAndUpdate(userId,req.body,{runValidators:true});

        if(update){
            return res.status(200).json({
                code:200,
                message:"Data updated successfully"
            });
        }
        return res.status(400).json({
            code:400,
            message:"Unable to update data"
        });

    }
    catch(err){
        return res.status(500).json({
            code:500,
            message:"Some error ocurred: "+err.message
        }); 
    }
});

profileRouter.patch("/update-by-email/:email",async (req,res)=>{

    let email = req.params?.email;

    if(!email){
        return res.status(400).json({
            code:400,
            message:"Please provide a valid email"
        });
    }

    try{

        let data = req?.body;

        Object.keys(data).forEach(function(val){
            if(val=="emailId")throw new Error("Update ot allowed for email");
        });

        let update = await User.updateOne({emailId:email},req.body,{runValidators:true});

        if(update.modifiedCount>0){
            return res.status(200).json({
                code:200,
                message:"Data updated successfully"
            });
        }
        return res.status(400).json({
            code:400,
            message:"Unable to update data"
        });

    }
    catch(err){
        return res.status(500).json({
            code:500,
            message:"Some error ocurred: "+err.message
        }); 
    }
});

module.exports=profileRouter;