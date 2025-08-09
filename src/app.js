const express=require("express");
const app= express();//INSTANCE OF EXPRESS
const connectDB=require("./config/database");
const User = require("./models/user.js");

app.use(express.json());

app.post("/signup",async (req,res)=>{

    try{

    let insertDoc= await User.create(req.body);

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

app.get("/feed",async (req,res)=>{

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

app.get("/user", async(req,res)=>{

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

app.delete("/delete",async (req,res)=>{
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

app.patch("/update/:userId",async (req,res)=>{

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

app.patch("/update-by-email/:email",async (req,res)=>{

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


connectDB().then(()=>{ 
    console.log("Connected to database");
    
    app.listen(3000,()=>{ //when the db is connected, only then connect the server
        console.log("server is running");
    });
}).catch((err)=>{
    console.error("Database could not be connected");
});

