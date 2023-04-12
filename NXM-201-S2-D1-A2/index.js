const express = require('express')

const { connection } = require('./db')

const { userRouter } = require('./routes/user.route')


require('dotenv').config()

const app = express()


app.use(express.json())



app.get("/", (req,res)=>{
    res.send("home page")
})


app.use("/", userRouter)


app.all("*", (req,res)=>{
    res.status(404).send({
        "msg":"Error 404! Invalid URL"
    })
})


app.listen(process.env.port , async ()=>{

    try {
    
        await connection
        console.log(`Connected to DB. server is running at port : ${process.env.port}`)

    } 
    
    catch (error) {
        
    }
})

