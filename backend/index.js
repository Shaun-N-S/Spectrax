const express = require('express');
const mongoose = require('mongoose');
const app = express();
const dotenv = require('dotenv')
const cors = require('cors')
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser')
const session = require("express-session");
const userRoutes = require('./routes/userRoutes');
const cookieParser = require('cookie-parser');
const adminRoutes = require('./routes/adminRoutes');

const PORT = process.env.PORT || 3000;


const corsOptions = {
    origin: ['http://localhost:5173','http://localhost:5174'], // Your frontend URL
    credentials: true, // Allow credentials (cookies, headers, etc.)
  };
dotenv.config()

app.use(cookieParser());

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000, // 72 hours
      sameSite: 'lax',
    },
  }));
  


app.use("/user",userRoutes)
app.use("/admin",adminRoutes)


mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log("Mongodb connected successfully"))
.catch((err)=>console.log("Mongodb connection failed"));


app.get('/',(req,res)=>{
    res.send('Sign in page')
})



app.listen(PORT,()=>{
    console.log(`server is running on the port ${PORT}`);
})