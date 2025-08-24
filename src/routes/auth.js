const express= require("express");
const bcrypt= require("bcrypt");
const { validateSignUpData } = require("../utils/validation.js");
const User = require("../models/user.js");
const validator = require("validator");

const authRouter= express.Router();

authRouter.post("/signup",async (req,res)=>{

    try{
    
    validateSignUpData(req.body);

    const { firstName, lastName, emailId, password, age, gender, image, about, skills} = req?.body;
    let hashedPass= await bcrypt.hash(password,10);

    let defaultImg="https://geographyandyou.com/images/user-profile.png";

    let profileImg= (!image || image=="")?defaultImg:image;

    let insertionObj={
        firstName,
        lastName,
        emailId,
        password:hashedPass,
        age,
        gender,
        image:profileImg,
        about,
        skills
    }



    let insertDoc= await User.create(insertionObj);

    if(insertDoc){
        return res.status(200).json({
            code:200,
            message:"Data inserted successfully",
            data: insertDoc
        });
    }
    return res.status(400).json({
        code:400,
        message:"Data not inserted"
    });

    }
    catch(err){
        return res.status(500).json({
            code:500,
            message:"Some error ocurred: "+err.message
        }); 
    }

});

authRouter.post("/login",async (req,res)=>{
    
    try{
        const { emailId, password} = req?.body;

        if(!validator.isEmail(emailId)){
            return res.status(400).json({
                code:400,
                message:"Please provide valid email"
            });
        }

        let user = await User.findOne({emailId});

        if(!user){
            return res.status(400).json({
                code:400,
                message:"Invalid email"
            });
        }

        const isValidPassword = await user.validatePassword(password);
        
        if(isValidPassword){
            const token = await user.getJWT();
            res.cookie("token",token);
            return res.status(200).json({
                code:200,
                message:"Logged in successfully",
                user
            });
        }

        return res.status(400).json({
            code:400,
            message:"Invalid password"
        });

    }
    catch(err){
        return res.status(500).json({
            code:500,
            message:"Some error ocurred: "+err.message
        }); 
    }
});

authRouter.post("/logout", async(req,res)=>{
    res.cookie("token",null,{
        expires: new Date(Date.now()),
    });

    return res.status(200).json({
        code:200,
        message:"Logged out successfully"
    })
})


module.exports=authRouter;