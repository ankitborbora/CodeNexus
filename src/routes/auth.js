const express= require("express");
const bcrypt= require("bcrypt");
const { validateSignUpData } = require("../utils/validation.js");
const User = require("../models/user.js");
const validator = require("validator");
const controller = require("../worker_demo/controller.js");
const { Worker } = require("worker_threads");
const axios = require("axios");
const OauthAccount = require("../models/oauth_accounts.js")

const { Google, generateState, generateCodeVerifier, OAuth2RequestError } = require("arctic");

const google = new Google(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:4000/auth/google/callback"
)

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
        const token = await insertDoc.getJWT();
        res.cookie("token",token);
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
});

authRouter.get("/blocking",(req,res)=>{
    const worker = new Worker(require.resolve("../worker.js"));

    worker.on("message",(result)=>{
        return res.status(200).send(`Result is ${result}`);
    });
    worker.postMessage({});
});

authRouter.get("/non-blocking",(req,res)=>{
    res.status(200).send("Non blocking");
});

// authRouter.get("/blocking",(req,res)=>{
//     const result = controller.blockingOperation();
//     return res.status(200).send(`Result is ${result}`);
// });

authRouter.get("/auth/google/callback",async (req,res)=>{
  //google redirects with code and state query params
  //we will use code to find out the user

  const { code, state} = req.query;

  const storedState = req.signedCookies.google_oauth_state;
  const codeVerifier = req.signedCookies.google_code_verifier;

  console.log(code, state, storedState, codeVerifier)

  //Checking if we are getting the parameters from google and our cookies
  if(!code || !state || !storedState || !codeVerifier){
    return res.status(400).send("Missing OAuth parameters");
  }

  //state from google must match the state stored in our cookies
  if(state!==storedState){
    return res.status(400).send("Invalid state");
  }

    try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();

    const { data: googleUser } = await axios.get("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    // googleUser typically has: sub, email, email_verified, name, given_name, family_name, picture

    // Scenario 1: OAuth account already linked
    let oauthAccount = await OauthAccount.findOne({
        provider: "google",
        providerAccountId: googleUser.sub
    });

    let user;

    if (oauthAccount) {
        user = await User.findById(oauthAccount.userId);
    } else {
        // No linked OAuth account yet — check by email
        user = await User.findOne({ emailId: googleUser.email });

        if (user) {
            // Scenario 2: user exists (manual signup), link Google account to it
            await OauthAccount.create({
                userId: user._id,
                provider: "google",
                providerAccountId: googleUser.sub
            });
        } else {
            // Scenario 3: brand new user
            user = await User.create({
                firstName: googleUser.given_name || googleUser.name || "User",
                lastName: googleUser.family_name || "",
                emailId: googleUser.email,
                image: googleUser.picture || undefined,
                // no password — schema must allow this for OAuth users
            });

            await OauthAccount.create({
                userId: user._id,
                provider: "google",
                providerAccountId: googleUser.sub
            });
        }
    }

    // Issue your app's JWT and log the user in
    const token = await user.getJWT();
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    // Clear the temporary OAuth cookies
    res.clearCookie("google_oauth_state");
    res.clearCookie("google_code_verifier");

    return res.status(200).send("User logged in successfully"); // or wherever your app lands post-login
    }
    catch (err) {
    console.error(err);
    if (err instanceof OAuth2RequestError) {
        return res.status(400).send("Invalid Authorization code");
    }
    return res.status(500).send("Something went wrong");
    }
});

authRouter.get("/auth/google",(req,res)=>{
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const scopes =["openid", "email", "profile"];

    const url = google.createAuthorizationURL(state,codeVerifier,scopes);

    res.cookie("google_oauth_state",state,{
        httpOnly:true,
        secure:false,
        sameSite:"lax",
        maxAge:10*60*1000,
        signed: true
    });

    res.cookie("google_code_verifier",codeVerifier,{
        httpOnly:true,
        secure:false,
        sameSite:"lax",
        maxAge:10*60*1000,
        signed: true
    });

    res.redirect(url.toString());
})


module.exports=authRouter;