const {Router} = require('express')

const {UserModel} = require('../model/user.model')

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const userRouter = Router()

const {BlacklistUser, tokenlist} = require('../blacklist');

const { Auth } = require('../middleware/auth');

const { VlogModel } = require('../model/vlog.model')





userRouter.post("/user/register", async (req,res)=>{

    const {Email , Name , Password , Gender, Location} = req.body;

    if(!Email || !Name || !Password || !Gender || !Location){
        return res.status(400).send({
            "msg":"Kindly provide all required details for registration."
        })
    }


    try {


        const checkdup = await UserModel.aggregate([{$match:{Email:Email}}])

        console.log(checkdup.length)

        if(checkdup.length){
            return res.status(400).send({
                "error":"User Already exists."
            })
        }
        
        bcrypt.hash(Password , 5 , async (err,hash)=>{
            if(err){
                return res.status(400).send({
                    "msg":"Something went wrong ! Kindly retry after sometime."
                })
            }

            const user = new UserModel({Email,Password:hash,Name,Gender,Location})

            await user.save()

            return res.status(200).send({
                "msg":"New user registration has been done Successfully.",
                "User":user
            })

        })

    } 
    
    catch (error) {
        return res.status(400).send({
            "error":error.message
        })
    }



})


userRouter.post("/user/login", async (req,res)=>{

    const {Email,Password} = req.body;

   try {
    
    const verifyuser = await UserModel.aggregate([{$match:{Email:Email}}])


    if(verifyuser.length==0){
        return res.status(400).send({
            "msg":"Invalid User! User doesn't exists."
        })
    }


    bcrypt.compare(Password , verifyuser[0].Password ,  async (err , result)=>{
        console.log(err)
        if(!result){
            return res.status(400).send({
                "msg":"Invalid Password!"
            })
        }
        
        const rt = jwt.sign({UserID:verifyuser[0]._id} , process.env.RefreshTokenSecretKey , {expiresIn:'300s'})
        const rs = {
            "msg":"Login Successfull",
            "token":jwt.sign({UserID:verifyuser[0]._id} , process.env.AccessTokenSecretKey, {expiresIn:'120s'}),
            "refreshtoken":rt
        }

        tokenlist[rt] = rs

        return res.status(200).send(rs)

    })


   } 
   
   catch (error) {
    return res.status(400).send({
        "error":error.message
    })
   }

})


userRouter.get("/user/logout", async (req,res)=>{

    const authheader = req.headers.authorization;

    if(!authheader){
        return res.status(404).send({
            "msg":"Invalid token or token isn't passed"
        })
    }

    const token = authheader.split(' ')[1];

    if(token){

        BlacklistUser.push(token)

        return res.status(400).send({
            "msg":"Logout Successfully."
        })
    }



})



// protected routes


userRouter.post("/addVlog" , Auth , async (req,res)=>{

    const {Title , Description } = req.body;

    const AuthorID = req.body.UserID;

    try {
        
        const vlog = new VlogModel({AuthorID,Title,Description})

        await vlog.save()

        return res.status(200).send({
            "msg":"New Vlog has been created Successfully",
            "Vlog":vlog
        })


    } 
    
    catch (error) {
        return res.status(400).send({
            "error":error.message
        })
    }


})




userRouter.get("/getVlogs", Auth , async(req,res)=>{

    const {UserID} = req.body;

    try {

        const vlogs = await VlogModel.aggregate([{$match:{"AuthorID":UserID}}])

        return res.status(200).send({
            "msg":"Your vlog list is as : ",
            "Vlogs":vlogs
        })

    }
    
    catch (error) {

        return res.status(400).send({

            "error":error.message
        })
    }

})




module.exports = {
    userRouter
}